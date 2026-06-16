# language-learning-vault

A Claude Code + Obsidian template for learning a foreign language at your own pace, driven by songs and spaced repetition.

This template is **opinionated**. It assumes:

- You learn a language better when the work is fun and contextual, not when you grind decks.
- You want a single canonical record of what you've learned, what you struggle with, and what you've practised — kept as Markdown in an Obsidian vault.
- You're happy to use Claude Code as your tutor: it reads the vault, runs structured lessons, logs what you got wrong, and quizzes you on it later.
- You're willing to install one local Node script (`tools/play_song.mjs`) that gives Claude a player it can control — synced lyrics, A↔B loops, in-browser shadow scoring, dialogue practice with TTS.

The template ships with a **sample learner**, *Maya* — a native English speaker learning Mexican Spanish for a job relocation to Mexico City in 2027 (CEFR A2 → B1). Maya's content is illustrative; replace it with your own when you make the vault yours.

---

## What's in here

```
README.md                  ← this file
SETUP.md                   ← step-by-step: install, configure, customize
LICENSE                    ← MIT
CLAUDE.md                  ← agent instructions (auto-loaded by Claude Code)
.claude/skills/
  song-lesson/             ← long-form lesson driven by a song
  grammar-lesson/          ← 60-minute focused drill on one grammar concept
  placement/               ← initial level test (CEFR / JLPT / HSK / TOPIK / ACTFL)
  review/                  ← 15-minute spaced-repetition session
vault/
  _meta/                   ← canonical truth: context, principles, struggle log, register, playlist
  sessions/                ← one dated file per study session
  vocab/songs/             ← vocab cards keyed by song slug
  grammar/                 ← one file per grammar concept
  culture/                 ← cultural footnotes
  practice/                ← auto-written by the player (shadow scores, dialogue transcripts)
  reviews/                 ← review session logs
  progress/                ← periodic CEFR/JLPT/HSK band snapshots
tools/
  play_song.mjs            ← local browser player + control plane
  get_lyrics.mjs           ← lyrics fetcher (Letras → Genius → lyrics.ovh)
  player.html              ← player UI
  README.md                ← tools documentation
```

## Quickstart

1. **Clone** this repo and open the folder in [Obsidian](https://obsidian.md) as a vault.
2. **Install** [Claude Code](https://docs.anthropic.com/claude-code) and open the same folder.
3. **Edit `vault/_meta/context_map.md`** — replace Maya's profile with yours. This file is the source of truth for everything else.
4. **(Optional) replace `vault/_meta/{target}_register.md`** with one for the variant of the language you're learning. The default is `mexican_register.md`.
5. **Start a session** in Claude Code:
   - First time: ask Claude to run the `placement` skill — produces a baseline level.
   - Day-to-day: pick a song from `vault/_meta/playlist.md` and ask Claude to run `song-lesson "<artist>" "<title>"`.
   - Short days: ask Claude to run the `review` skill (15 min, no new material).

Full details in **[SETUP.md](SETUP.md)**.

## Model recommendation

Run this vault in **Claude Opus**. It is what the skills, phase pacing, and correction style were tuned against. **Sonnet** is technically doable but results vary. **Haiku should be avoided** — the multi-file reasoning the skills rely on degrades too much.

## How it works

- **`CLAUDE.md`** tells Claude Code what this project is and how to behave. It auto-loads the three source-of-truth vault files (`context_map`, `learning_principles`, `struggle_log`) every turn.
- **`vault/_meta/context_map.md`** is *your* profile — language, level, source language, target, motivation, time budget, interests, playlist link. Everything Claude does should be grounded in this file.
- **`vault/_meta/struggle_log.md`** accumulates the things you get wrong. Skills bias line-selection and review toward what's recorded here, so old weak spots keep coming back until they stick.
- **Skills** are reusable lesson recipes. Each one is a Markdown file in `.claude/skills/<name>/SKILL.md`. They follow a fixed structure (read these files first, run these phases, write these artefacts).
- **The player** (`tools/play_song.mjs`) is a tiny local HTTP server that exposes a browser UI for synced lyrics + a `ctl` command Claude can call to seek, loop, start shadow practice, or run a TTS dialogue. No cloud dependency for the player itself; YouTube + lrclib.net for audio + lyrics.

## Generalizing beyond Spanish

The template supports any language. The pieces that need to know which language you're learning are:

| File | What changes |
|---|---|
| `vault/_meta/context_map.md` | Target language, variant, level system, motivation, source language |
| `vault/_meta/<variant>_register.md` | Replace `mexican_register.md` with a file for your variant (`tokyo_register.md`, `parisian_register.md`, etc.). Same shape: lexicon prefer/avoid, register hierarchy, pronunciation notes, topic banks |
| `.claude/skills/placement/SKILL.md` | Reads `level_system` from `context_map.md` — works with CEFR, JLPT, HSK, TOPIK, ACTFL out of the box |
| `vault/_meta/playlist.md` | Songs in your target language |
| `tools/play_song.mjs` voice list | Azure neural voices for your target locale (Mexican is the default; swap voice IDs for `ja-JP`, `fr-FR`, `zh-CN`, etc.) |

Songs as a primary medium work well for languages with rich popular music traditions (Spanish, French, Portuguese, Korean, Japanese, Mandarin, Italian, Arabic, ...). For languages where you'd rather work from TV episodes, podcasts, or books, swap `song-lesson` for a media-lesson variant — the phase structure (cold listen → walkthrough → deep dive → grammar → vocab → production → shadow → conversation → closing listen) generalizes cleanly.

## Privacy

- The vault is local Markdown. Nothing leaves your machine unless *you* push it.
- The player fetches lyrics from `lrclib.net` and `letras.com` / `genius.com`, and resolves YouTube IDs by scraping search results. No user accounts, no API keys for any of that.
- Optional Azure TTS (true neural voices for your target locale) requires *your* Azure Speech key — set via env var, never committed. See `.gitignore` for the patterns that keep secrets out.
- If you want your `vault/sessions/` private, add it to `.gitignore` (the default `.gitignore` keeps it tracked — that's how Maya's example sessions ship — but you can change that for your fork).

## License

MIT. Use it, fork it, remix it.

## Credits

Conceived by [Tijn van der Krol](https://github.com/) while learning Colombian Spanish in 2026. Generalized into a template so other learners can run the same workflow for their language.
