# tools

Local helpers for the `song-lesson` skill. Zero npm dependencies; built-in Node modules only. Tested on Node 18+ (uses global `fetch`); developed on Node 24.

## get_lyrics.mjs

Fetches song lyrics. Replaces direct `WebFetch` of Genius / Letras, which gets 403'd and garbles text.

```
node tools/get_lyrics.mjs "<artist>" "<song title>"
node tools/get_lyrics.mjs --url "<genius or letras song URL>"
```

- Lyrics go to **stdout**; the chosen source and any per-source errors go to **stderr**.
- Tries, in order: Letras (search + scrape) → Genius (search + scrape) → lyrics.ovh API.
- No API keys. Uses a browser User-Agent so the sites don't block it.
- Exit `0` = lyrics found, `1` = every source failed (skill should stop and ask the learner), `2` = bad arguments.

Letras has better coverage for Spanish / Portuguese; Genius is better for English / global; lyrics.ovh is a last-resort fallback. For other languages, lyrics.ovh sometimes has entries that Letras and Genius miss — it's worth keeping in the chain.

## play_song.mjs

Local browser player + control plane for the `song-lesson` skill. Lyrics highlight in sync with the audio, lines are clickable to seek, A↔B looping and slow playback are built in, and there are two interactive practice modes (shadow + dialogue) driven via the Web Speech API. Claude drives the player from chat via a `ctl` sub-command.

### Server mode (long-running)

```
node tools/play_song.mjs "<artist>" "<song title>"
node tools/play_song.mjs "<artist>" "<song title>" --url "<youtube URL>"
node tools/play_song.mjs "<artist>" "<song title>" --no-open
```

- Starts a local HTTP server on `127.0.0.1:<auto-port>`, opens the browser, stays in the foreground. Ctrl+C cleans up.
- Resolves a YouTube video ID (cache: `vault/_meta/youtube_ids.json`, then search scrape). `--url` overrides and updates the cache.
- Fetches synced lyrics from **lrclib.net**. lrclib often returns several versions of a song (studio, radio edit, and **live medleys** that stitch multiple tracks together — e.g. "Te Voy a Amar / Besos Usados"). The player reads the YouTube video's real length and picks the lrclib version whose duration is **closest to that length**, dropping medley-length outliers (> 1.4× the reference). If the video length can't be read, it falls back to the median candidate duration. Falls back to `get_lyrics.mjs` for plain (unsynced) lyrics if lrclib has nothing.
- Audio plays via YouTube IFrame. On embed errors (101 / 150 / 153) the player auto-promotes: server shells `yt-dlp` to download the audio once to `tools/.player/audio/<videoId>.m4a` and the player swaps to a local `<audio>` element. **Requires `yt-dlp` on PATH** for that path (`winget install yt-dlp.yt-dlp` / `brew install yt-dlp`). Songs whose YouTube embed works don't need it. Download success/failure is logged to **stderr** (`yt-dlp: download ok/FAILED <id>`).

#### YouTube "confirm you're not a bot"

YouTube increasingly gates downloads behind a sign-in check (`Sign in to confirm you're not a bot`). When that happens, give `yt-dlp` your cookies via **one** of these env vars before starting the server (nothing is read from a browser unless one is set):

```
YTDLP_COOKIES_FILE=path/to/cookies.txt          # exported cookies (most robust)
YTDLP_COOKIES_FROM_BROWSER=firefox|chrome|edge  # read a live browser profile
```

- **cookies.txt** (recommended): export with a "Get cookies.txt LOCALLY" browser extension while logged into YouTube. Survives browser updates; doesn't need the browser closed. Treat the file as a credential — it's git-ignored.
- **from-browser**: convenient but fragile on Windows — Chromium browsers (Chrome 127+ / recent Edge) encrypt cookies with app-bound DPAPI that yt-dlp often can't decrypt even with the browser closed (yt-dlp issues #7271, #10927). Firefox profiles read reliably.
- Server URL goes to **stdout**; progress + errors to **stderr**.
- Writes runtime state to `tools/.player/.server.json` so `ctl` can find it.

### Control mode (one-shot)

```
node tools/play_song.mjs ctl <action> [args]
```

Actions:

- `play [<start> [<end>]]` — seek to `start`, optionally loop to `end`.
- `pause`
- `seek <t>` — seconds.
- `rate <n>` — 1.0 / 0.75 / 0.5.
- `loop <a> <b> [--times <n>]` — loop between A and B, optionally bounded.
- `clear-loop`
- `hide-lyrics` / `show-lyrics` — blank or restore the lyrics column.
- `practice shadow --lines <i,j,k>` — start shadow practice over given line indices.
- `practice dialogue start [--opener "<line>"]` — switch to dialogue mode, TTS-speaks opener.
- `practice dialogue say "<line>"` — send one Claude dialogue turn.
- `practice end` — return to listen mode.
- `status` — print client count and song metadata.
- `stop` — graceful shutdown.

### Practice logs

Each session appends to `vault/practice/<slug>_<YYYY-MM-DD>.md`: shadow score tables (target / heard / similarity) and dialogue transcripts.

### Neural TTS (optional — Azure)

By default the dialogue voice uses browser-installed voices (typically only one or two for any given locale, and often generic-sounding). For true neural voices in your target locale, set two env vars before starting the server:

```
AZURE_TTS_KEY=<your key>
AZURE_TTS_REGION=<your region, e.g. westeurope>
```

(Drop them in a `.env` file at the project root — already in `.gitignore`.)

Get them from a free Azure "Speech service" resource (F0 tier, 500k chars/month). Full walkthrough in **SETUP.md §6**.

When set, the server logs `azure-tts: enabled`, exposes `/tts` + `/tts/voices`, and the dialogue Voice dropdown offers neural voices. Audio is cached under `tools/.player/tts-cache/`.

**To target a different language/variant**, edit `AZURE_VOICES` in `play_song.mjs` (top of file, lines ~80–95). The defaults are Mexican Spanish. SETUP.md §6.4 has a cheat sheet of common locales.

### Retargeting `player.html` for a different language

The browser-side voice picker (in `player.html`) defaults to filtering for Spanish voices. If your target language is not Spanish:

1. Change `r.lang = "es-MX";` (search the file) to your target locale.
2. Update `targetVoices()` to filter by your target language's prefix (currently `/^es/i`).
3. Update the tier scoring in the same function to prioritize your preferred variant.

Three small edits; no logic changes needed.

## Requirements

- Node 18+. Zero npm dependencies. Built-in `http`, `child_process`, `fs`, `crypto`.
- `yt-dlp` + `ffmpeg` (optional, only needed for embed-blocked videos; auto-found in winget dirs on Windows).
- Browser: Chrome or Edge for practice modes (Web Speech API). Firefox lacks speech recognition.
- Azure Speech key (optional, only for neural TTS voices).
- Windows-only browser auto-open (`start`); on other OSes pass `--no-open` and open the printed URL manually.
