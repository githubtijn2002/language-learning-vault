# Setup

End-to-end setup for a new learner. Should take 30–45 minutes if you also configure Azure TTS; ~15 minutes without.

Sections:

1. [Install the dependencies](#1-install-the-dependencies)
2. [Clone the repo](#2-clone-the-repo)
3. [Set up Obsidian](#3-set-up-obsidian)
4. [Set up Claude Code](#4-set-up-claude-code)
5. [Make the vault yours](#5-make-the-vault-yours)
6. [(Optional) Configure Azure TTS](#6-optional-configure-azure-tts)
7. [Confirm the player works](#7-confirm-the-player-works)
8. [Run your first session](#8-run-your-first-session)
9. [Day-to-day](#9-day-to-day)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Install the dependencies

| Tool | Why | How |
|---|---|---|
| [Obsidian](https://obsidian.md) | Read / edit your vault as a knowledge graph | Free download, any OS. Detailed steps in §3. |
| [Claude Code](https://docs.anthropic.com/claude-code) | The agent that runs lessons | Detailed steps in §4. |
| Node 18+ | Runs the local player + lyrics fetcher | Windows: `winget install OpenJS.NodeJS`. macOS: `brew install node`. Linux: your package manager, or [nvm](https://github.com/nvm-sh/nvm). Verify with `node --version`. |
| `yt-dlp` *(optional)* | Fallback when YouTube blocks the embed for a song | Windows: `winget install yt-dlp.yt-dlp`. macOS: `brew install yt-dlp`. Linux: `pipx install yt-dlp`. |
| Azure Speech key *(optional)* | True neural TTS voices in your target locale | Free F0 tier — 500k chars/month. Detailed steps in §6. |

## 2. Clone the repo

```bash
git clone <this-repo-url> language-learning-vault
cd language-learning-vault
```

If you don't have git, you can also download the repo as a ZIP from GitHub and extract it. The vault doesn't *need* to be a git repo — version control is just a nice-to-have for syncing across machines.

---

## 3. Set up Obsidian

Obsidian treats any folder of Markdown files as a "vault". You're going to point it at the folder you just cloned.

### 3.1 Install Obsidian

1. Go to <https://obsidian.md> and download the installer for your OS.
2. Run the installer. No account is needed; Obsidian works fully offline. (Their paid "Sync" and "Publish" services are optional and unrelated to this template.)
3. Launch Obsidian.

### 3.2 Open the project folder as a vault

On the welcome screen:

1. Click **"Open folder as vault"**.
2. Browse to the `language-learning-vault` folder you cloned in §2 and select it.
3. Click **"Trust author and enable plugins"** when prompted — this template doesn't include any community plugins by default, but the prompt appears the first time you open any folder.

You should now see the file tree on the left: `vault/`, `tools/`, `.claude/`, `CLAUDE.md`, etc.

### 3.3 Install the three recommended plugins

These are *community plugins*. The template assumes they're installed but doesn't ship them — you install once, then they live in your local Obsidian config.

1. Open **Settings** (gear icon, bottom-left) → **Community plugins**.
2. If it's your first time, Obsidian will warn you about third-party plugins. Click **"Turn on community plugins"**.
3. Click **"Browse"** and install these three, one by one:

   | Plugin | What it does | Why it matters |
   |---|---|---|
   | **Spaced Repetition** | Adds `?`-separated flashcards and `<!--SR:-->` review markers directly in your Markdown | Your vocab cards in `vault/vocab/songs/*.md` are written in this plugin's format. Without it, the cards still render but you can't review them inside Obsidian. |
   | **Templater** | Lets you define Markdown templates with variables | Optional but handy if you want to generate session files from a template. |
   | **Dataview** | Treats your vault as a queryable database | Optional. Useful for "show me all vocab tagged with X" type queries later. |

4. For each plugin: click **Install** → **Enable**.

**Flashcard tag convention.** The Spaced Repetition plugin only scans notes that carry a `#flashcards` tag, and it builds *decks* from the tag path. This vault's skills tag card files `#flashcards/<lang>/<type>` — e.g. `#flashcards/spanish/vocab`, `#flashcards/spanish/songs/<slug>` (swap `<lang>` for your target-language slug). Hand-written cards need that tag too, or the plugin won't see them.

**Optional plugins** (nice-to-have, not required):

| Plugin | What it adds |
|---|---|
| Advanced Tables | Auto-formats Markdown tables (struggle_log, correction tables); Tab between cells, sort by column. |
| Tag Wrangler | Rename/merge tags safely (e.g. restructuring `#flashcards/...` decks). |
| Commander | Surface "Review Flashcards" and other commands as one-click buttons. |
| Homepage | Open a dashboard note automatically on launch. |
| LanguageTool | Grammar/spell check on written target-language notes — see §3.6. |

### 3.4 Quick Obsidian sanity check

Open `vault/_meta/context_map.md` in Obsidian. Confirm:

- The frontmatter (lines between `---` markers at the top) renders as a small "Properties" panel.
- `[[playlist]]` and `[[struggle_log]]` are clickable (they should turn into links to other files).
- The right sidebar can show backlinks (which files reference the current one) — toggle with `Ctrl/Cmd + Shift + B` if it's hidden.

If those work, Obsidian is set up. You can close Obsidian or leave it open — Claude Code will edit the same files independently, and Obsidian will pick up changes automatically.

### 3.5 Sync across machines (optional)

The template is just files. You can sync the vault any way you sync files:

- **Git**: commit and push as you would any repo. Add `vault/sessions/` to `.gitignore` if you want sessions private.
- **iCloud / OneDrive / Dropbox**: drop the folder in your sync directory; Obsidian works fine on synced folders.
- **Obsidian Sync (paid)**: $4/mo, end-to-end encrypted. Optional; not required.

### 3.6 (Optional) LanguageTool for writing feedback

The **LanguageTool** community plugin checks grammar + spelling in your written target-language notes — useful for catching agreement/orthography slips in production exercises.

- **Default (public API):** install + enable the plugin; it checks against LanguageTool's public server. Only the text you check (the current note, or your selection) is sent — not your whole vault — but it does leave your machine. Fine for low-sensitivity practice notes.
- **Self-host (private):** if you have Docker —

  ```bash
  docker run -d --name languagetool --restart unless-stopped -p 8081:8081 erikvl87/languagetool
  ```

  Verify with `curl http://localhost:8081/v2/languages`, then set the plugin's server URL to `http://localhost:8081` and disable the public API. Now nothing leaves your machine. (No Docker? Download the LanguageTool server jar — needs Java 17+ — and run `java -jar languagetool-server.jar --port 8081`.)

---

## 4. Set up Claude Code

1. Install Claude Code following the [official instructions](https://docs.anthropic.com/claude-code) for your OS.
2. Sign in to your Anthropic account when prompted.
3. **Select Claude Opus as the model.** This vault is tuned for Opus. Sonnet works but results vary. Avoid Haiku — the skills' multi-file reasoning and structured corrections degrade noticeably. Set the model with `/model` inside Claude Code.
3. Open a terminal at the project root (the `language-learning-vault` folder).
4. Start a Claude Code session: `claude` (or however your install is invoked).

The first time Claude starts in this folder, it will auto-read `CLAUDE.md`. That file in turn tells Claude to load the three source-of-truth files (`context_map.md`, `learning_principles.md`, `struggle_log.md`) every turn. You don't need to do anything special — that's wired up.

**Quick sanity check.** In Claude Code, type:

> *Read the context map and tell me one thing about the learner.*

If Claude responds with something specific (e.g. "Maya is targeting CEFR B1 by September 2027"), the auto-load is working. If it says it can't find the file, double-check that you opened Claude Code in the project root (the folder containing `CLAUDE.md`).

---

## 5. Make the vault yours

The template ships with Maya's content (English speaker → Mexican Spanish, CEFR A2→B1, Mexico City relocation 2027). Replace it.

**Easiest path:** open Claude Code and ask it to run the `setup` skill — it interviews you about your goals and fills `context_map.md` + your variant register file automatically. The manual steps below are the alternative (and a good way to review what `setup` wrote).

### 5.1 Edit `vault/_meta/context_map.md`

This file is the single source of truth. Edit by hand. Sections to fill in:

- **Frontmatter** (top of file, between `---` markers):
  - `level_system`: one of `CEFR` / `JLPT` / `HSK` / `TOPIK` / `ACTFL`. Picks the rubric the `placement` skill uses.
  - `target_language`: e.g. `Spanish`, `Japanese`, `Mandarin`, `Korean`, `French`, `Portuguese`.
  - `target_variant`: e.g. `Mexican (CDMX)`, `Tokyo standard`, `Mainland Mandarin`, `Seoul standard`, `Metropolitan French`, `Brazilian (paulista)`.
  - `source_language`: your L1.
  - `working_language`: the language you want Claude to *talk to you in* (usually = source language, but advanced learners sometimes set this to the target).
- **Learner** — your L1, other languages, current self-assessed level.
- **Target** — target level, target date, success criteria, priority skills, variant.
- **Motivation** — why you're learning. Be specific.
- **Cultural focus** — what's at stake socially.
- **Time budget** — your actual weekly hours.
- **Personal interests** — content hooks Claude can use.
- **Tooling** — list which Obsidian plugins you're using.

### 5.2 Replace `vault/_meta/<variant>_register.md`

The template ships with `mexican_register.md`. Rename it to match your variant (`tokyo_register.md`, `parisian_register.md`, `beijing_register.md`, `cairo_register.md`, ...) and rewrite the content:

- Lexicon: words to prefer vs. avoid for this variant.
- Diminutives / honorifics / register markers specific to the variant.
- Sentence patterns common in the variant.
- Pronunciation notes.
- "Topic banks" for dialogue rotation, anchored to *your* life hooks (from `context_map.md`).

This file is **read by the `song-lesson` skill at the start of every dialogue phase**, so its content directly shapes how Claude speaks to you.

When you rename the file, also update the reference in `.claude/skills/song-lesson/SKILL.md` (search for `register.md` — there's one mention).

### 5.3 Build a playlist

`vault/_meta/playlist.md` is a Markdown table of songs in your target language. Maya's version is a placeholder; replace it with songs you'd actually want to listen to.

If you keep your playlist in Spotify, the easiest path is the Exportify walkthrough — see `vault/_meta/playlist_refresh.md`.

If you don't use Spotify, you can paste an "artist — title" list into a Claude Code session and ask Claude to format it as the table.

### 5.4 Reset Maya's example data

```bash
# Optional — start with a clean slate instead of Maya's example struggle-log rows.
# Open vault/_meta/struggle_log.md and delete the example rows (everything below the "Vocab gaps" header).
# Open vault/_meta/playlist.md and clear the placeholder rows.
```

---

## 6. (Optional) Configure Azure TTS

Skip this section if you're OK using your operating-system's built-in browser voices (usually generic / not native to your target locale; on Windows there's typically only `es-ES` and `es-MX` for Spanish, `ja-JP` for Japanese, etc.). The player still works fully without it — the dialogue phase will use whatever browser voice matches your target locale.

For neural voices in your target locale, the player supports **Azure Cognitive Services Speech**. The free F0 tier gives you 500,000 characters of standard neural TTS per month, which is roughly 4–6 hours of generated audio — far more than dialogue practice consumes.

### 6.1 Create the Azure resource

1. Go to <https://portal.azure.com> and sign in (or create a free Microsoft account — the Azure free tier is separate from any paid Azure account you might already have).
2. In the top search bar, type **"Speech services"** and select it.
3. Click **"+ Create"**.
4. Fill in:
   - **Subscription**: your default subscription (or create one — Azure free trial is fine).
   - **Resource group**: click **"Create new"** and call it `language-learning` (or anything).
   - **Region**: pick one geographically close to you. `westeurope`, `eastus`, `southeastasia`, etc. Note the exact name — you'll need it as `AZURE_TTS_REGION`.
   - **Name**: anything unique. `<yourname>-speech-tts` is fine.
   - **Pricing tier**: **Free F0** (500k chars/month, 1 request/sec).
5. Click **Review + create**, then **Create**. Wait ~30 seconds for the deployment to finish.

### 6.2 Grab the key and region

1. After deployment, click **"Go to resource"** (or find it under your resource group).
2. In the left sidebar of the resource page, click **"Keys and Endpoint"**.
3. Copy **KEY 1** (a long alphanumeric string). This is your `AZURE_TTS_KEY`.
4. Note the **Location/Region** displayed (e.g. `westeurope`, `eastus`). This is your `AZURE_TTS_REGION` — use the short code, not the friendly name (e.g. `westeurope`, not `West Europe`).

### 6.3 Save them to `.env`

Create a file named `.env` at the project root (same folder as `CLAUDE.md`):

```
AZURE_TTS_KEY=<paste your KEY 1 here>
AZURE_TTS_REGION=<paste your region here, e.g. westeurope>
```

**Important**: `.env` is git-ignored by default (see `.gitignore`) — your key never gets committed. **Never paste your key into a chat, a session log, or any file in `vault/`.**

### 6.4 Pick voice IDs for your target locale

Open `tools/play_song.mjs` and find the `AZURE_VOICES` array (around line 82). The default has Mexican Spanish voices (and one Spain-Spanish fallback):

```js
const AZURE_VOICES = [
  { id: "es-MX-DaliaNeural",  lang: "es-MX", name: "Dalia — Mexican (Azure)" },
  { id: "es-MX-JorgeNeural",  lang: "es-MX", name: "Jorge — Mexican (Azure)" },
  { id: "es-ES-ElviraNeural", lang: "es-ES", name: "Elvira — Spain (Azure)" },
];
```

To swap to a different target locale, replace these with voice IDs from the Azure catalogue. Common picks:

| Target | Voice IDs to try first |
|---|---|
| Mexican Spanish | `es-MX-DaliaNeural`, `es-MX-JorgeNeural` (default) |
| Colombian Spanish | `es-CO-SalomeNeural`, `es-CO-GonzaloNeural` |
| Castilian Spanish | `es-ES-ElviraNeural`, `es-ES-AlvaroNeural` |
| Argentine Spanish | `es-AR-ElenaNeural`, `es-AR-TomasNeural` |
| Brazilian Portuguese | `pt-BR-FranciscaNeural`, `pt-BR-AntonioNeural` |
| Metropolitan French | `fr-FR-DeniseNeural`, `fr-FR-HenriNeural` |
| German | `de-DE-KatjaNeural`, `de-DE-ConradNeural` |
| Italian | `it-IT-ElsaNeural`, `it-IT-DiegoNeural` |
| Japanese | `ja-JP-NanamiNeural`, `ja-JP-KeitaNeural` |
| Mandarin (mainland) | `zh-CN-XiaoxiaoNeural`, `zh-CN-YunxiNeural` |
| Korean | `ko-KR-SunHiNeural`, `ko-KR-InJoonNeural` |
| Arabic (MSA) | `ar-EG-SalmaNeural`, `ar-EG-ShakirNeural` |

For the full catalogue (200+ neural voices across 100+ locales) browse the [Voice Gallery](https://speech.microsoft.com/portal/voicegallery). Each voice has a *Listen* button so you can preview before committing.

The `lang` field in each entry must match the voice's locale code (`es-MX`, `ja-JP`, etc.) — the player uses it to set browser-side speech recognition language during dialogue practice.

### 6.5 Test it

Start the player on any song:

```bash
node tools/play_song.mjs "<artist>" "<title>"
```

Check stderr (the terminal output before the URL prints). You should see:

```
azure-tts: enabled (region <yourregion>) — neural voices available
```

If you see `azure-tts: not configured`, the `.env` file isn't being read — make sure it's at the project root and the variable names are exactly `AZURE_TTS_KEY` and `AZURE_TTS_REGION` (no quotes, no spaces around `=`).

Open the player URL in your browser, scroll to the **Voice** dropdown in the dialogue practice section, and you should see your configured voices listed with a ★ next to the locale that matches your target. Pick one, type a test phrase, and play it.

### 6.6 If it costs you money

The F0 free tier resets every month and is generous for dialogue practice. If you somehow exceed it (you'd need to generate ~30+ hours of audio in a month), Azure will start returning HTTP 429s and the player will silently fall back to browser voices. You don't get billed without explicitly upgrading to the paid S0 tier.

---

## 7. Confirm the player works

```bash
node tools/play_song.mjs "<artist>" "<song title>"
```

Pick any song from your playlist. The script should:

1. Resolve a YouTube video ID (cached in `vault/_meta/youtube_ids.json`).
2. Fetch synced lyrics from `lrclib.net` (or fall back to plain lyrics).
3. Print a `http://127.0.0.1:<port>/` URL and open your browser.
4. The browser shows the player with lyrics that highlight in sync with the audio.

Stop the player with `Ctrl+C` or `node tools/play_song.mjs ctl stop`.

If the player fails — `yt-dlp not found`, embed blocked, no synced lyrics — read `tools/README.md` for the recovery paths.

---

## 8. Run your first session

Two natural entry points:

**Placement test (recommended, first time).** In Claude Code:

> *Run the placement skill — I want to know my real level.*

This takes ~60 minutes and produces a baseline band stored under `vault/progress/`. Your `context_map.md` should already have a guess; the placement test calibrates it.

**A song lesson.** Once placed, pick a song and ask Claude:

> *Let's run a song-lesson on <artist> — <title>. Long format.*

The skill runs phases (a)–(i): cold listen → walkthrough → deep dive → grammar → vocab → production → cultural footnote → shadow practice → conversation with Claude → closing listen. Roughly 80 minutes.

---

## 9. Day-to-day

- **Long days (60+ min)**: song-lesson, grammar-lesson when a concept needs sustained isolated focus, or vocab-lesson (25-word batch) to push high-frequency coverage.
- **Mid days (30 min)**: song-lesson phases c/d/f/h1 only (deep dive + grammar + production + shadow), grammar-lesson trimmed to phases b/d/e, or a 15-word vocab-lesson. Drop everything else.
- **Short days (15 min)**: review skill. No new material — just spaced reactivation of items in your struggle log.

After every session, edit `vault/_meta/context_map.md` if anything *durable* changed (your level moved up a band, your target date shifted, you swapped a target song). Don't put session-specific state here.

---

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| Claude doesn't read the vault files | Confirm `CLAUDE.md` has the `@vault/_meta/*.md` lines and that you opened Claude Code in the project root. |
| Obsidian doesn't show the file tree | Check you opened the *folder* (not a single file) as a vault. Settings → About → Vault path should match the cloned folder. |
| Spaced Repetition plugin doesn't see my cards | Make sure each card is in the right format (multi-line basic: a line, then a `?`, then the answer line). The plugin's settings page has a "Tags" field — confirm the tag you used matches. |
| Player URL won't load | Check stderr for the actual error; usually `yt-dlp not found` (install it) or no synced lyrics (the player still works, but lyrics don't highlight). |
| Lyrics column is empty | Some songs aren't in `lrclib.net` or `letras.com` / `genius.com`. The player will keep working — you can still loop sections and practice. |
| Azure TTS dropdown is empty | `.env` not at project root, or wrong variable names, or wrong region code (use short code: `westeurope`, not `West Europe`). Restart the player after creating `.env`. |
| Azure TTS HTTP 401 | Key is wrong or was rotated. Go back to the Azure portal → Keys and Endpoint → copy **KEY 1** again. |
| Azure TTS HTTP 429 | Free tier rate limit (1 request/sec) or monthly quota exceeded. Wait, or switch to browser voices for the rest of the session. |
| Shadow scores feel arbitrary | The browser's Web Speech recognizer is noisy. Don't take any individual score literally; trust trends across 5+ attempts. |
| TTS uses a non-native voice | Azure isn't configured or the voice ID isn't in `AZURE_VOICES`. See §6. |
