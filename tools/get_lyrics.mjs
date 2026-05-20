#!/usr/bin/env node
// get_lyrics.mjs — fetch song lyrics for the song-lesson skill.
//
// Usage:
//   node tools/get_lyrics.mjs "<artist>" "<song title>"
//   node tools/get_lyrics.mjs --url "<genius or letras song URL>"
//
// Tries, in order: Letras (search + scrape), Genius (search + scrape), lyrics.ovh API.
// Prints the chosen source to stderr and clean plain-text lyrics to stdout.
// Exit 0 on success, 1 if every source failed (skill should then stop and ask the learner).

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const TIMEOUT_MS = 12000;

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

// --- HTML cleanup ---------------------------------------------------------

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  ntilde: "ñ", uuml: "ü", Aacute: "Á", Eacute: "É", Iacute: "Í",
  Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", iexcl: "¡", iquest: "¿",
  hellip: "…", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”",
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
}

// Convert an HTML fragment containing <br>, <p>, <div> and inline tags into
// clean newline-separated plain text.
function htmlToText(html) {
  let s = html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  s = decodeEntities(s);
  return s
    .split("\n")
    .map((l) => l.replace(/ /g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// --- Sources --------------------------------------------------------------

async function fromLyricsOvh(artist, title) {
  if (!artist || !title) return null;
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const data = await get(url, { json: true });
  const lyrics = (data.lyrics || "").replace(/\r/g, "").trim();
  if (lyrics.length < 40) return null;
  return { source: "lyrics.ovh API", lyrics };
}

function extractGeniusLyrics(html) {
  const parts = [];
  const re = /<div[^>]*data-lyrics-container="true"[^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = re.exec(html))) parts.push(m[1]);
  if (!parts.length) return null;
  let text = htmlToText(parts.join("\n"));
  // Strip Genius page chrome that leaks into the first container.
  text = text
    .replace(/^[\s\S]*?\bLyrics\s*\n/, "") // "N ContributorsTitle Lyrics"
    .replace(/\d*\.?\d*K?\s*Embed\s*$/i, "") // trailing "1.2KEmbed"
    .replace(/^You might also like\s*$/gim, "")
    .trim();
  return text.length >= 40 ? text : null;
}

async function fromGenius(artist, title) {
  const q = [artist, title].filter(Boolean).join(" ").trim();
  if (!q) return null;
  const search = await get(
    `https://genius.com/api/search/multi?q=${encodeURIComponent(q)}`,
    { json: true }
  );
  const sections = search?.response?.sections || [];
  let songUrl = null;
  for (const sec of sections) {
    if (sec.type !== "song") continue;
    const hit = (sec.hits || []).find((h) => h?.result?.url);
    if (hit) { songUrl = hit.result.url; break; }
  }
  if (!songUrl) return null;
  const page = await get(songUrl);
  const lyrics = extractGeniusLyrics(page);
  return lyrics ? { source: `Genius (${songUrl})`, lyrics } : null;
}

async function fromGeniusUrl(url) {
  const lyrics = extractGeniusLyrics(await get(url));
  return lyrics ? { source: `Genius (${url})`, lyrics } : null;
}

function extractLetrasLyrics(html) {
  // Letras puts the lyric in <div class="lyric-original"> with <p> blocks,
  // older layout uses <div class="cnt-letra"> ... <p>...
  const m =
    html.match(/<div[^>]*class="[^"]*lyric-original[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<div[^>]*class="[^"]*cnt-letra[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
  if (!m) return null;
  const text = htmlToText(m[1]);
  return text.length >= 40 ? text : null;
}

async function fromLetras(artist, title) {
  const q = [artist, title].filter(Boolean).join(" ").trim();
  if (!q) return null;
  // Letras' own autocomplete index (JSONP from a Solr backend).
  const raw = await get(
    `https://solr.sscdn.co/letras/m1/?q=${encodeURIComponent(q)}&wt=json`
  );
  const jsonStr = raw.replace(/^[^(]*\(/, "").replace(/\);?\s*$/, "");
  let docs = [];
  try {
    docs = JSON.parse(jsonStr)?.response?.docs || [];
  } catch {
    return null;
  }
  const song = docs.find((d) => d.dns && d.url);
  if (!song) return null;
  const songUrl = `https://www.letras.com/${song.dns}/${song.url}/`;
  const lyrics = extractLetrasLyrics(await get(songUrl));
  return lyrics ? { source: `Letras (${songUrl})`, lyrics } : null;
}

async function fromLetrasUrl(url) {
  const lyrics = extractLetrasLyrics(await get(url));
  return lyrics ? { source: `Letras (${url})`, lyrics } : null;
}

// --- Main -----------------------------------------------------------------

async function tryAll(steps) {
  for (const [label, fn] of steps) {
    try {
      const r = await fn();
      if (r) return r;
      console.error(`  ${label}: no lyrics found`);
    } catch (e) {
      console.error(`  ${label}: ${e.message}`);
    }
  }
  return null;
}

async function main() {
  const argv = process.argv.slice(2);
  let result = null;

  if (argv[0] === "--url") {
    const url = argv[1];
    if (!url) {
      console.error('Usage: get_lyrics.mjs --url "<genius or letras URL>"');
      process.exit(2);
    }
    console.error(`Fetching from URL: ${url}`);
    const isLetras = /letras\.com/i.test(url);
    result = await tryAll([
      [isLetras ? "letras-url" : "genius-url", () =>
        isLetras ? fromLetrasUrl(url) : fromGeniusUrl(url)],
    ]);
  } else {
    const [artist, title] = argv;
    if (!artist || !title) {
      console.error('Usage: get_lyrics.mjs "<artist>" "<song title>"');
      console.error('   or: get_lyrics.mjs --url "<genius or letras URL>"');
      process.exit(2);
    }
    console.error(`Searching lyrics for: ${artist} — ${title}`);
    result = await tryAll([
      ["letras", () => fromLetras(artist, title)],
      ["genius", () => fromGenius(artist, title)],
      ["lyrics.ovh", () => fromLyricsOvh(artist, title)],
    ]);
  }

  if (!result) {
    console.error("\nFAILED: no source returned lyrics. Stop and tell the learner.");
    process.exit(1);
  }

  console.error(`\nSOURCE: ${result.source}\n`);
  process.stdout.write(result.lyrics + "\n");
}

main().catch((e) => {
  console.error(`Unexpected error: ${e.stack || e}`);
  process.exit(1);
});
