#!/usr/bin/env node
// play_song.mjs — local server + control plane for the song-lesson player.
//
// Server mode:
//   node tools/play_song.mjs "<artist>" "<title>" [--url <yt-url>] [--no-open]
//     Starts a local HTTP server on 127.0.0.1:<auto-port>, opens the browser
//     player, and stays in the foreground. Ctrl+C cleans up.
//
// Control mode:
//   node tools/play_song.mjs ctl <action> [args]
//     Reads tools/.player/.server.json, POSTs commands to the running server.
//     Actions: play / pause / seek / rate / loop / clear-loop /
//              practice shadow --lines <a,b,c> /
//              practice dialogue start [--opener "<line>"] /
//              practice dialogue say "<line>" /
//              practice end / status / stop
//
// Lyrics + audio:
//   Synced lyrics from lrclib.net; falls back to tools/get_lyrics.mjs (unsynced).
//   Audio default: YouTube IFrame. On embed errors (101/150/153) the player
//   POSTs /audio/promote; the server shells yt-dlp to download and cache the
//   audio locally, then the player swaps to an HTML <audio> element.
//
// Practice modes (browser): shadow (Web Speech recognition + similarity score)
// and dialogue (TTS + mic + transcripts POSTed back, appended to vault/practice).
//
// stdout: server URL on start, or ctl response.  stderr: progress + errors.
// Exit 0 ok, 1 resolve/start failure, 2 bad args.

import {
  readFileSync, writeFileSync, existsSync, mkdirSync, statSync, createReadStream,
  unlinkSync, appendFileSync,
} from "node:fs";
import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import http from "node:http";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CACHE_PATH = path.join(PROJECT_ROOT, "vault", "_meta", "youtube_ids.json");
const PLAYER_DIR = path.join(__dirname, ".player");
const AUDIO_DIR = path.join(PLAYER_DIR, "audio");
const TTS_CACHE_DIR = path.join(PLAYER_DIR, "tts-cache");
const SERVER_INFO_PATH = path.join(PLAYER_DIR, ".server.json");
const PLAYER_HTML_PATH = path.join(__dirname, "player.html");
const PRACTICE_DIR = path.join(PROJECT_ROOT, "vault", "practice");

// Load .env from project root, if present. Tiny inline parser — no new dep.
// Lines: KEY=VALUE, # comments, optional single/double quotes around value.
// Existing process.env values win (so shell exports still override the file).
(function loadDotenv() {
  const envPath = path.join(PROJECT_ROOT, ".env");
  if (!existsSync(envPath)) return;
  try {
    const text = readFileSync(envPath, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      if (!key || key in process.env) continue;
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch (e) {
    console.error(`dotenv: failed to read ${envPath}: ${e.message}`);
  }
})();

// Azure Cognitive Services Speech — optional, for true neural voices in your target locale.
// Set AZURE_TTS_KEY and AZURE_TTS_REGION in the environment (or .env) to enable.
//
// To target a different language/variant, replace the AZURE_VOICES entries below with
// voice IDs from the Azure catalogue (https://speech.microsoft.com/portal/voicegallery).
// The `lang` field must match the voice's locale code (e.g. es-MX, ja-JP, fr-FR, zh-CN).
// See SETUP.md §6.4 for a cheat sheet of common locales.
const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY || "";
const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION || "";
const AZURE_VOICES = [
  { id: "es-MX-DaliaNeural",  lang: "es-MX", name: "Dalia — Mexican (Azure)" },
  { id: "es-MX-JorgeNeural",  lang: "es-MX", name: "Jorge — Mexican (Azure)" },
  { id: "es-ES-ElviraNeural", lang: "es-ES", name: "Elvira — Spain (Azure)" },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const TIMEOUT_MS = 12000;

// --- Shared helpers (carried over from Phase 1) ----------------------------

async function get(url, { json = false, headers = {} } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "es,en;q=0.8", ...headers },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return json ? await res.json() : await res.text();
  } finally {
    clearTimeout(t);
  }
}

function loadIdCache() {
  if (!existsSync(CACHE_PATH)) return {};
  try { return JSON.parse(readFileSync(CACHE_PATH, "utf8")); } catch { return {}; }
}
function saveIdCache(cache) {
  const dir = path.dirname(CACHE_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf8");
}
function cacheKey(artist, title) {
  return `${artist.trim().toLowerCase()}|${title.trim().toLowerCase()}`;
}
function videoIdFromUrl(url) {
  const m =
    url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    url.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
async function searchYouTubeId(artist, title) {
  const q = `${artist} ${title} official audio`;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  const html = await get(url);
  const m = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
  return m ? m[1] : null;
}
async function resolveYouTubeId(artist, title, urlOverride) {
  const cache = loadIdCache();
  const key = cacheKey(artist, title);
  if (urlOverride) {
    const id = videoIdFromUrl(urlOverride);
    if (!id) throw new Error(`Could not parse a video ID out of: ${urlOverride}`);
    cache[key] = id; saveIdCache(cache);
    console.error(`youtube: using --url override, id=${id} (cached)`);
    return id;
  }
  if (cache[key]) {
    console.error(`youtube: cache hit, id=${cache[key]}`);
    return cache[key];
  }
  console.error(`youtube: searching "${artist} ${title} official audio"...`);
  const id = await searchYouTubeId(artist, title);
  if (!id) return null;
  cache[key] = id; saveIdCache(cache);
  console.error(`youtube: resolved id=${id} (cached)`);
  return id;
}

// Pull the video's real length from the watch page so we can match lyrics to it.
// Public HTML, no yt-dlp/cookies needed; returns null if YouTube walls the page.
async function fetchVideoDurationSeconds(videoId) {
  if (!videoId) return null;
  try {
    const html = await get(`https://www.youtube.com/watch?v=${videoId}`);
    const m = html.match(/"lengthSeconds":"(\d+)"/);
    return m ? parseInt(m[1], 10) : null;
  } catch { return null; }
}
// Rough play-length of an LRC block: span between its first and last timestamp.
function lrcSpanSeconds(lrc) {
  const re = /\[(\d{1,3}):(\d{2})(?:[.:]\d{1,3})?\]/g;
  const times = [];
  let m;
  while ((m = re.exec(lrc))) times.push(parseInt(m[1], 10) * 60 + parseInt(m[2], 10));
  if (!times.length) return null;
  return Math.max(...times) - Math.min(...times);
}
function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// lrclib often returns several versions of a song — studio, radio edit, and
// LIVE MEDLEYS that stitch multiple tracks together (e.g. "Te Voy a Amar /
// Besos Usados", ~9 min). The old logic picked the *longest* lyric block, which
// systematically selected those medleys. Instead, match the version whose
// duration is closest to the real track, and drop medley-length outliers.
const MEDLEY_FACTOR = 1.4; // > 1.4x the reference length => treat as live/medley
async function fetchSyncedLyrics(artist, title, targetDuration = null) {
  const url =
    `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}` +
    `&track_name=${encodeURIComponent(title)}`;
  const results = await get(url, { json: true });
  if (!Array.isArray(results) || !results.length) return null;
  const cands = results
    .filter((r) => r && typeof r.syncedLyrics === "string" && r.syncedLyrics.trim().length > 0)
    .map((r) => ({
      lyrics: r.syncedLyrics,
      dur: (typeof r.duration === "number" && r.duration > 0)
        ? r.duration
        : lrcSpanSeconds(r.syncedLyrics),
    }))
    .filter((c) => c.dur != null);
  if (!cands.length) return null;

  // Reference length: the actual video if we know it, else the median of all
  // candidates (robust to a single long medley outlier).
  const ref = (targetDuration && targetDuration > 0)
    ? targetDuration
    : median(cands.map((c) => c.dur));

  // Medley guard: discard versions running far longer than the reference.
  const kept = cands.filter((c) => c.dur <= ref * MEDLEY_FACTOR);
  const dropped = cands.length - kept.length;
  if (dropped > 0) {
    console.error(`lrclib: ignored ${dropped} likely live/medley version(s) (> ${Math.round(ref * MEDLEY_FACTOR)}s vs ref ~${Math.round(ref)}s)`);
  }
  const pool = kept.length ? kept : cands;

  // Closest duration to the reference wins; tie-break toward more complete lyrics.
  pool.sort((a, b) => {
    const da = Math.abs(a.dur - ref), db = Math.abs(b.dur - ref);
    if (da !== db) return da - db;
    return b.lyrics.length - a.lyrics.length;
  });
  console.error(`lrclib: picked version ~${Math.round(pool[0].dur)}s (ref ~${Math.round(ref)}s) from ${cands.length} candidate(s)`);
  return pool[0].lyrics;
}
function parseLrc(lrc) {
  const lines = [];
  const tsRe = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
  for (const raw of lrc.split(/\r?\n/)) {
    const stamps = [];
    let m; tsRe.lastIndex = 0;
    while ((m = tsRe.exec(raw))) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      const fracStr = m[3] || "0";
      const frac = parseInt(fracStr, 10) / Math.pow(10, fracStr.length);
      stamps.push(min * 60 + sec + frac);
    }
    if (!stamps.length) continue;
    const text = raw.replace(tsRe, "").trim();
    if (/^\[[a-zA-Z]+:[^\]]*\]$/.test(raw.trim())) continue;
    for (const t of stamps) lines.push({ time: t, text });
  }
  lines.sort((a, b) => a.time - b.time);
  return lines;
}
function fetchUnsyncedLyrics(artist, title) {
  return new Promise((resolve) => {
    const script = path.join(__dirname, "get_lyrics.mjs");
    execFile(
      process.execPath,
      [script, artist, title],
      { timeout: 30000, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (stderr) process.stderr.write(stderr);
        if (err || !stdout) return resolve(null);
        const lines = stdout
          .split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0)
          .map((text) => ({ time: null, text }));
        resolve(lines.length ? lines : null);
      }
    );
  });
}
function slugify(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// --- yt-dlp ----------------------------------------------------------------

import { readdirSync } from "node:fs";

function findYtDlp() {
  return new Promise((resolve) => {
    execFile("yt-dlp", ["--version"], { timeout: 4000 }, (err) => {
      if (!err) return resolve("yt-dlp");
      const wingetRoot = path.join(
        process.env.LOCALAPPDATA || "",
        "Microsoft", "WinGet", "Packages"
      );
      try {
        if (existsSync(wingetRoot)) {
          const entry = readdirSync(wingetRoot).find((d) => /^yt-dlp\.yt-dlp_/.test(d));
          if (entry) {
            const exe = path.join(wingetRoot, entry, "yt-dlp.exe");
            if (existsSync(exe)) return resolve(exe);
          }
        }
      } catch { /* ignore */ }
      resolve(null);
    });
  });
}

function findFfmpegDir() {
  // ffmpeg.exe may live inside the winget yt-dlp.FFmpeg package, in a versioned subdir.
  const wingetRoot = path.join(
    process.env.LOCALAPPDATA || "",
    "Microsoft", "WinGet", "Packages"
  );
  try {
    if (!existsSync(wingetRoot)) return null;
    const ffPkg = readdirSync(wingetRoot).find((d) => /^yt-dlp\.FFmpeg_/.test(d));
    if (!ffPkg) return null;
    const pkgDir = path.join(wingetRoot, ffPkg);
    // Look for any subdir containing bin/ffmpeg.exe
    const entries = readdirSync(pkgDir);
    for (const e of entries) {
      const candidate = path.join(pkgDir, e, "bin", "ffmpeg.exe");
      if (existsSync(candidate)) return path.dirname(candidate);
    }
  } catch { /* ignore */ }
  return null;
}

let YT_DLP_PATH = null;
let FFMPEG_DIR = null;

function downloadAudio(videoId) {
  return new Promise((resolve, reject) => {
    if (!YT_DLP_PATH) return reject(new Error("yt-dlp not found"));
    if (!existsSync(AUDIO_DIR)) mkdirSync(AUDIO_DIR, { recursive: true });
    const out = path.join(AUDIO_DIR, `${videoId}.m4a`);
    if (existsSync(out)) return resolve(out);
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    // Prefer native m4a (no post-processing → no ffmpeg dependency).
    // Fall back to whatever bestaudio gives us; pass --ffmpeg-location if we
    // have one so post-processing can complete.
    const args = [
      "-f", "bestaudio[ext=m4a]/bestaudio",
      "-o", out,
      "--no-playlist", "--quiet", "--no-warnings",
      "--no-part",
    ];
    if (FFMPEG_DIR) args.push("--ffmpeg-location", FFMPEG_DIR);
    // Opt-in auth for YouTube's "confirm you're not a bot" gate. Nothing is
    // read from a browser unless one of these env vars is explicitly set.
    //   YTDLP_COOKIES_FILE=path\to\cookies.txt        (exported cookies)
    //   YTDLP_COOKIES_FROM_BROWSER=firefox|chrome|edge (read live profile)
    if (process.env.YTDLP_COOKIES_FILE) {
      args.push("--cookies", process.env.YTDLP_COOKIES_FILE);
    } else if (process.env.YTDLP_COOKIES_FROM_BROWSER) {
      args.push("--cookies-from-browser", process.env.YTDLP_COOKIES_FROM_BROWSER);
    }
    args.push(url);
    console.error(`yt-dlp: downloading ${videoId}...`);
    const proc = spawn(YT_DLP_PATH, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (b) => { stderr += b.toString(); });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0) return reject(new Error(`yt-dlp exit ${code}: ${stderr.trim().slice(0, 400)}`));
      if (!existsSync(out)) return reject(new Error("yt-dlp finished but output file is missing"));
      resolve(out);
    });
  });
}

// --- Azure TTS -------------------------------------------------------------

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

async function azureTts(text, voiceId) {
  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) throw new Error("Azure TTS not configured");
  const voice = AZURE_VOICES.find((v) => v.id === voiceId) || AZURE_VOICES[0];
  if (!existsSync(TTS_CACHE_DIR)) mkdirSync(TTS_CACHE_DIR, { recursive: true });
  const hash = createHash("sha256").update(`${voice.id}|${text}`).digest("hex").slice(0, 32);
  const file = path.join(TTS_CACHE_DIR, `${hash}.mp3`);
  if (existsSync(file)) return file;
  const ssml =
    `<speak version="1.0" xml:lang="${voice.lang}">` +
    `<voice name="${voice.id}">${escapeXml(text)}</voice></speak>`;
  const res = await fetch(
    `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "song-lesson-player",
      },
      body: ssml,
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Azure TTS HTTP ${res.status}: ${detail.slice(0, 200)}`);
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

// --- Server ----------------------------------------------------------------

function jsonResponse(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}
function textResponse(res, status, text, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Content-Length": Buffer.byteLength(text) });
  res.end(text);
}
function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
  });
}

async function startServer({ artist, title, videoId, lines, synced, autoOpen }) {
  const song = { artist, title, videoId, lines, synced };
  const slug = `${slugify(artist)}-${slugify(title)}`;
  const sseClients = new Set();
  const waiters = { shadow: new Set(), dialogue: new Set(), request: new Set() };

  function notifyWaiters(kind, payload) {
    const set = waiters[kind];
    if (!set) return;
    for (const w of set) {
      clearTimeout(w.timer);
      try { jsonResponse(w.res, 200, { kind, payload }); } catch {}
    }
    set.clear();
  }
  YT_DLP_PATH = await findYtDlp();
  FFMPEG_DIR = findFfmpegDir();
  const ytDlpReady = !!YT_DLP_PATH;
  if (!ytDlpReady) {
    console.error("yt-dlp: not found. Install with: winget install yt-dlp.yt-dlp");
  } else {
    console.error(`yt-dlp: found at ${YT_DLP_PATH}`);
    if (FFMPEG_DIR) console.error(`ffmpeg: found at ${FFMPEG_DIR}`);
    else console.error("ffmpeg: not found (will fail on songs that need post-processing)");
  }
  if (AZURE_TTS_KEY && AZURE_TTS_REGION) {
    console.error(`azure-tts: enabled (region ${AZURE_TTS_REGION}) — neural voices available`);
  } else {
    console.error("azure-tts: not configured (set AZURE_TTS_KEY + AZURE_TTS_REGION for neural voices)");
  }

  function broadcast(type, payload) {
    const msg = `data: ${JSON.stringify({ type, payload })}\n\n`;
    for (const res of sseClients) {
      try { res.write(msg); } catch { /* dead client */ }
    }
  }

  function practiceFile() {
    if (!existsSync(PRACTICE_DIR)) mkdirSync(PRACTICE_DIR, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const file = path.join(PRACTICE_DIR, `${slug}_${date}.md`);
    if (!existsSync(file)) {
      const header = `---\ndate: ${date}\nsong: ${artist} — ${title}\nslug: ${slug}\n---\n\n# Practice — ${artist} — ${title} (${date})\n\n`;
      writeFileSync(file, header, "utf8");
    }
    return file;
  }

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, `http://127.0.0.1`);
    try {
      // --- Static / data ---
      if (req.method === "GET" && u.pathname === "/") {
        if (!existsSync(PLAYER_HTML_PATH)) return textResponse(res, 500, "player.html missing");
        const html = readFileSync(PLAYER_HTML_PATH, "utf8");
        return textResponse(res, 200, html, "text/html; charset=utf-8");
      }
      if (req.method === "GET" && u.pathname === "/data") {
        return jsonResponse(res, 200, song);
      }
      if (req.method === "GET" && u.pathname.startsWith("/audio/")) {
        const name = u.pathname.replace("/audio/", "");
        const file = path.join(AUDIO_DIR, name);
        if (!file.startsWith(AUDIO_DIR) || !existsSync(file)) {
          return textResponse(res, 404, "not found");
        }
        const stat = statSync(file);
        res.writeHead(200, {
          "Content-Type": "audio/mp4",
          "Content-Length": stat.size,
          "Accept-Ranges": "bytes",
        });
        createReadStream(file).pipe(res);
        return;
      }

      // --- Promote to local audio (yt-dlp) ---
      if (req.method === "POST" && u.pathname === "/audio/promote") {
        if (!ytDlpReady) {
          return jsonResponse(res, 500, {
            error: "yt-dlp not found. Install with: winget install yt-dlp.yt-dlp",
          });
        }
        try {
          await downloadAudio(videoId);
          console.error(`yt-dlp: download ok ${videoId}`);
          return jsonResponse(res, 200, { url: `/audio/${videoId}.m4a` });
        } catch (e) {
          // Surface to the server's own stdout/log too, not just the browser,
          // so the failure is visible without screen access.
          console.error(`yt-dlp: download FAILED ${videoId}: ${e.message}`);
          return jsonResponse(res, 500, { error: e.message });
        }
      }

      // --- TTS (Azure, optional) ---
      if (req.method === "GET" && u.pathname === "/tts/voices") {
        const enabled = !!(AZURE_TTS_KEY && AZURE_TTS_REGION);
        return jsonResponse(res, 200, { enabled, voices: enabled ? AZURE_VOICES : [] });
      }
      if (req.method === "GET" && u.pathname === "/tts") {
        const text = u.searchParams.get("text") || "";
        const voice = u.searchParams.get("voice") || (AZURE_VOICES[0] && AZURE_VOICES[0].id) || "es-MX-DaliaNeural";
        if (!text) return jsonResponse(res, 400, { error: "missing text" });
        try {
          const file = await azureTts(text, voice);
          const stat = statSync(file);
          res.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Content-Length": stat.size,
            "Cache-Control": "public, max-age=86400",
          });
          createReadStream(file).pipe(res);
        } catch (e) {
          jsonResponse(res, 502, { error: e.message });
        }
        return;
      }

      // --- SSE ---
      if (req.method === "GET" && u.pathname === "/events") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(`: connected\n\n`);
        sseClients.add(res);
        req.on("close", () => sseClients.delete(res));
        return;
      }

      // --- Command dispatch ---
      if (req.method === "POST" && u.pathname === "/cmd") {
        const body = await readBody(req);
        const action = String(body.action || "");
        const args = body.args || {};
        if (action === "stop") {
          jsonResponse(res, 200, { ok: true });
          setTimeout(() => shutdown(), 50);
          return;
        }
        if (action === "status") {
          // We don't track state server-side (player owns it). Return clients connected.
          return jsonResponse(res, 200, { clients: sseClients.size, song });
        }
        broadcast("cmd", { action, args });
        return jsonResponse(res, 200, { ok: true, dispatched: action });
      }

      // --- Long-poll wait endpoint ---
      if (req.method === "GET" && u.pathname === "/practice/wait") {
        const kind = u.searchParams.get("kind") || "shadow";
        if (!waiters[kind]) return jsonResponse(res, 400, { error: `unknown kind: ${kind}` });
        const timeoutSec = Math.min(parseInt(u.searchParams.get("timeout") || "600", 10), 1800);
        const entry = { res, expiresAt: Date.now() + timeoutSec * 1000, timer: null };
        entry.timer = setTimeout(() => {
          waiters[kind].delete(entry);
          try { jsonResponse(res, 200, { kind, payload: null, timeout: true }); } catch {}
        }, timeoutSec * 1000);
        waiters[kind].add(entry);
        req.on("close", () => {
          clearTimeout(entry.timer);
          waiters[kind].delete(entry);
        });
        return;
      }

      // --- Practice result logging ---
      if (req.method === "POST" && u.pathname === "/practice/result") {
        const body = await readBody(req);
        const file = practiceFile();
        const table = body.rows
          ? body.rows.map((r) =>
              `| ${r.idx ?? ""} | ${r.label ?? ""} | ${(r.target || "").replace(/\|/g, "\\|")} | ${(r.heard || "").replace(/\|/g, "\\|")} | ${(r.score ?? "").toFixed ? r.score.toFixed(2) : r.score} | ${r.attempts ?? 1} |`
            ).join("\n")
          : "";
        const block =
          `\n## Shadow — ${new Date().toISOString().slice(11, 19)}\n\n` +
          `| # | Score | Target | Heard | Ratio | Tries |\n|---|---|---|---|---|---|\n${table}\n`;
        appendFileSync(file, block, "utf8");
        notifyWaiters("shadow", { rows: body.rows || [], file });
        return jsonResponse(res, 200, { ok: true, file });
      }
      if (req.method === "POST" && u.pathname === "/practice/dialogue") {
        const body = await readBody(req);
        const file = practiceFile();
        const who = body.role === "bot" ? "Claude" : "Learner";
        const line = `- **${who}:** ${(body.text || "").replace(/\n/g, " ")}\n`;
        appendFileSync(file, line, "utf8");
        if (body.role === "user") notifyWaiters("dialogue", { text: body.text, file });
        return jsonResponse(res, 200, { ok: true, file });
      }
      if (req.method === "POST" && u.pathname === "/practice/request") {
        const body = await readBody(req);
        notifyWaiters("request", body);
        return jsonResponse(res, 200, { ok: true });
      }
      if (req.method === "POST" && u.pathname === "/practice/cancel") {
        const body = await readBody(req).catch(() => ({}));
        const kind = body.kind || "dialogue";
        if (!waiters[kind]) return jsonResponse(res, 400, { error: `unknown kind: ${kind}` });
        notifyWaiters(kind, { cancelled: true, reason: body.reason || "user" });
        return jsonResponse(res, 200, { ok: true, kind });
      }
      if (req.method === "POST" && u.pathname === "/practice/dialogue/start") {
        const file = practiceFile();
        appendFileSync(file, `\n## Dialogue — ${new Date().toISOString().slice(11, 19)}\n\n`, "utf8");
        return jsonResponse(res, 200, { ok: true, file });
      }

      return textResponse(res, 404, "not found");
    } catch (e) {
      console.error(`server error: ${e.stack || e.message}`);
      try { jsonResponse(res, 500, { error: e.message }); } catch { /* */ }
    }
  });

  function shutdown() {
    console.error("server: shutting down...");
    for (const r of sseClients) { try { r.end(); } catch {} }
    sseClients.clear();
    try { if (existsSync(SERVER_INFO_PATH)) unlinkSync(SERVER_INFO_PATH); } catch {}
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  if (!existsSync(PLAYER_DIR)) mkdirSync(PLAYER_DIR, { recursive: true });
  writeFileSync(
    SERVER_INFO_PATH,
    JSON.stringify({ port, pid: process.pid, slug, startedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
  const url = `http://127.0.0.1:${port}/`;
  console.error(`server: listening on ${url} (slug=${slug})`);
  process.stdout.write(url + "\n");
  if (autoOpen) openInBrowser(url);
}

function openInBrowser(url) {
  const child = spawn("cmd", ["/c", "start", "", url], {
    detached: true, stdio: "ignore", windowsHide: true,
  });
  child.unref();
}

// --- ctl mode --------------------------------------------------------------

function readServerInfo() {
  if (!existsSync(SERVER_INFO_PATH)) {
    throw new Error(`No running server (${SERVER_INFO_PATH} missing). Start one first.`);
  }
  return JSON.parse(readFileSync(SERVER_INFO_PATH, "utf8"));
}

async function postCtl(pathname, body) {
  const info = readServerInfo();
  const res = await fetch(`http://127.0.0.1:${info.port}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text();
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return parsed;
}

function parseCtlArgs(rest) {
  const out = { positional: [], flags: {} };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const v = (rest[i + 1] && !rest[i + 1].startsWith("--")) ? rest[++i] : "true";
      out.flags[k] = v;
    } else {
      out.positional.push(a);
    }
  }
  return out;
}

async function runCtl(argv) {
  if (!argv.length) {
    console.error("Usage: play_song.mjs ctl <action> [args]");
    process.exit(2);
  }
  const [head, sub, ...rest] = argv;
  const { positional, flags } = parseCtlArgs(rest);

  const send = async (action, args) => {
    const r = await postCtl("/cmd", { action, args });
    process.stdout.write(JSON.stringify(r) + "\n");
  };

  if (head === "play") {
    return send("play", { start: positional[0] ? parseFloat(positional[0]) : null, end: positional[1] ? parseFloat(positional[1]) : null });
  }
  if (head === "pause") return send("pause", {});
  if (head === "seek") return send("seek", { t: parseFloat(positional[0] || sub) });
  if (head === "rate") return send("rate", { rate: parseFloat(positional[0] || sub) });
  if (head === "loop") {
    return send("loop", {
      a: parseFloat(sub),
      b: parseFloat(positional[0]),
      times: flags.times ? parseInt(flags.times, 10) : null,
    });
  }
  if (head === "clear-loop") return send("clear-loop", {});
  if (head === "hide-lyrics") return send("hide-lyrics", {});
  if (head === "show-lyrics") return send("show-lyrics", {});
  if (head === "status") {
    const r = await postCtl("/cmd", { action: "status" });
    process.stdout.write(JSON.stringify(r, null, 2) + "\n");
    return;
  }
  if (head === "stop") {
    try { await postCtl("/cmd", { action: "stop" }); } catch (e) { console.error(e.message); }
    process.stdout.write("stopped\n");
    return;
  }
  if (head === "cancel") {
    const kind = sub || "dialogue";
    const r = await postCtl("/practice/cancel", { kind, reason: flags.reason || "user" });
    process.stdout.write(JSON.stringify(r) + "\n");
    return;
  }
  if (head === "wait") {
    const kind = sub || "shadow";
    const timeout = parseInt(flags.timeout || "600", 10);
    const info = readServerInfo();
    const r = await fetch(`http://127.0.0.1:${info.port}/practice/wait?kind=${encodeURIComponent(kind)}&timeout=${timeout}`);
    const j = await r.json();
    process.stdout.write(JSON.stringify(j, null, 2) + "\n");
    return;
  }
  if (head === "practice") {
    if (sub === "shadow") {
      const linesArg = flags.lines || positional[0] || "";
      const idxs = linesArg.split(",").map((x) => parseInt(x, 10)).filter((n) => !isNaN(n));
      return send("practice", { mode: "shadow", lines: idxs });
    }
    if (sub === "dialogue") {
      const verb = positional[0];
      if (verb === "start") {
        await postCtl("/practice/dialogue/start", {});
        return send("practice", { mode: "dialogue", action: "start", opener: flags.opener || null });
      }
      if (verb === "say") {
        return send("practice", { mode: "dialogue", action: "say", text: positional[1] || flags.text || "" });
      }
      console.error("Usage: ctl practice dialogue start|say ...");
      process.exit(2);
    }
    if (sub === "end") return send("practice", { mode: "end" });
    console.error("Usage: ctl practice shadow|dialogue|end");
    process.exit(2);
  }
  console.error(`Unknown ctl action: ${head}`);
  process.exit(2);
}

// --- Main ------------------------------------------------------------------

function parseArgs(argv) {
  const out = { positional: [], url: null, open: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url") out.url = argv[++i];
    else if (a === "--no-open") out.open = false;
    else out.positional.push(a);
  }
  return out;
}

async function runServer(argv) {
  const args = parseArgs(argv);
  const [artist, title] = args.positional;
  if (!artist || !title) {
    console.error('Usage: play_song.mjs "<artist>" "<title>" [--url <yt-url>] [--no-open]');
    process.exit(2);
  }
  console.error(`Building player for: ${artist} — ${title}`);

  let videoId;
  try {
    videoId = await resolveYouTubeId(artist, title, args.url);
  } catch (e) {
    console.error(`youtube: ${e.message}`);
    process.exit(1);
  }
  if (!videoId) {
    console.error("youtube: could not resolve a video ID. Try passing --url <youtube-url>.");
    process.exit(1);
  }

  let synced = true;
  let lines = [];
  try {
    const targetDuration = await fetchVideoDurationSeconds(videoId);
    if (targetDuration) console.error(`youtube: track length ~${targetDuration}s (matching lyrics to it)`);
    const lrc = await fetchSyncedLyrics(artist, title, targetDuration);
    if (lrc) {
      lines = parseLrc(lrc);
      console.error(`lrclib: synced lyrics found (${lines.length} lines)`);
    } else {
      console.error("lrclib: no synced lyrics, falling back to get_lyrics.mjs");
      synced = false;
    }
  } catch (e) {
    console.error(`lrclib: ${e.message}; falling back to get_lyrics.mjs`);
    synced = false;
  }
  if (!synced) {
    const unsynced = await fetchUnsyncedLyrics(artist, title);
    if (unsynced && unsynced.length) {
      lines = unsynced;
      console.error(`unsynced: ${lines.length} lines (no highlight, no click-to-seek)`);
    } else {
      console.error("unsynced: no lyrics found either; rendering empty lyrics column");
      lines = [];
    }
  }

  await startServer({ artist, title, videoId, lines, synced, autoOpen: args.open });
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === "ctl") {
    return runCtl(argv.slice(1));
  }
  return runServer(argv);
}

main().catch((e) => {
  console.error(`Unexpected error: ${e.stack || e}`);
  process.exit(1);
});
