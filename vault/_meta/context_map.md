---
level_system: CEFR
target_language: Spanish
target_variant: Mexican (CDMX)
source_language: English
working_language: English
---

# Context map

Single-glance reference for Claude at the start of any session. Edit this directly when facts change — it is the source of truth.

> **Replacing Maya?** This entire file is an example. Rewrite each section with your own profile. The frontmatter fields above are load-bearing — the `placement` skill reads `level_system`, and other skills read `target_language` + `target_variant` to know which register file to load.

## Learner

- **L1:** English · **Working language with Claude:** English
- **Other languages:** High school French (A2, rusty); a bit of conversational Italian from holidays.
- **Spanish now:** **A2− overall** (CEFR self-assessment; confirmed in placement). Per-skill: Reading A2, Listening A1+, Grammar A1+, Vocab A2, Production A1+. **Specific gaps live in [[struggle_log]]** — skills bias line-selection and review toward what's recorded there.
- **Cognitive notes:** none particular. Prefers crisp explanations to long ones; doesn't mind being told she's wrong.

## Target — September 2027

- **B1 minimum, B2 stretch.** ~16 months from start (May 2026 → September 2027).
- **Concrete success criteria:**
  - Function at work in Spanish for routine tasks (small talk, meeting attendance, written messages) without falling back to English every five minutes.
  - Navigate daily life in Mexico City — rent, groceries, doctor, gym, neighbours — without anxiety.
  - Get jokes when they're aimed at her and have at least three Spanish-language jokes that consistently land.
- **Priority skills (in order):** listening → speaking → grammar correctness → reading → writing.
- **Variant:** Mexican Spanish, specifically **Mexico City / chilango** register. Standard Latin American baseline, with CDMX colloquialisms layered in. Avoid Iberian and Caribbean markers.

## Motivation

- **Job relocation:** moving to Mexico City in September 2027 to lead a data team at her company's regional HQ. Indefinite stay; she expects to settle in.
- **No partner / family ties** in Mexico. She's going alone and wants Spanish to be the foundation of her social life there, not an obstacle to it.
- **Workplace stakes:** her team will be ~70% Spanish-native. English is the official language but informal communication, jokes, gossip, and after-hours hangouts will be in Spanish. She wants to be on the inside of those, not outside.

## Cultural focus

- US directness/efficiency vs. Mexican relational warmth and indirectness.
- Workplace formality — when *usted* is required (clients, leadership, older colleagues), when *tú* is normal (peers, after a few weeks).
- Greetings (cheek kiss with women in social settings, handshake or fist-bump in professional ones), introduction conventions, formal-event etiquette.
- Food norms — table manners, sobremesa, who pays, what to bring to a house.
- Religion (largely Catholic but secular in workplace), drinking norms (less binge, more long evenings).
- **Rude landmines** prioritised over cute mistakes. The first six months at a new job are when first impressions form.
- Cultural prep notes may name specific stereotypes about Americans — they are prep, not assumptions about how she'll be received personally.

## Time budget

- **Mon–Sun: 4× 30min + 2× 15min ≈ 2h 30min/week.**
- Session shapes:
  - **Long (60m, weekend):** full song-lesson or full deep dive on grammar + culture.
  - **Mid (30m, weekday):** focused chunk — vocab harvest + short production task.
  - **Short (15m):** spaced review only, no new material.

## Quiz intensity

Variable. Long days: ramp toward C-level (Spanish-only, brutal) as level grows. Mids: B (firm, produce + correct). Shorts: A (gentle translate-and-confirm) — or pure SR review.

## Conversation practice

- **Language exchange app** (HelloTalk / Tandem) — Maya has two regular partners (one in Guadalajara, one in CDMX). Both C1 English, learning English in return. ~2× 45min calls per week.
- Every song-lesson ends with a "talk to your exchange partner" prompt: ask them about X using Y phrase from the song.
- **Future Mexican coworkers** — once she's in CDMX (Sep 2027), all conversation practice shifts to them.

## Songs

- Playlist: see [[playlist]]. Maya has been building it from Spotify "Made for Mexico" + suggestions from her exchange partners. Mostly indie / pop / rock; some norteño for variant range.
- Early picks: TBD after first three song-lessons.

## Personal interests (content hooks)

- Cooking — mostly Italian and Mediterranean; learning Mexican techniques is a stated goal.
- Trail running and hiking — she's eyeing Iztaccíhuatl, Nevado de Toluca, and the Ajusco trails once in CDMX.
- Indie video games (story-heavy: Disco Elysium, Pentiment, Hades).
- Mid-century Latin American literature (Bolaño, García Márquez, Aira) — currently reading them in English; would like to graduate to Spanish over the next 3 years.
- Data work — runs a data team at a B2B SaaS company.

## Tooling stack

- **Obsidian vault** at this folder. Plugins: Spaced Repetition, Templater, Dataview.
- **Claude Code skills** at `.claude/skills/`: `song-lesson`, `grammar-lesson`, `placement`, `review`.
- **Lyrics fetch:** `tools/get_lyrics.mjs` (Node) — `song-lesson` uses it instead of WebFetching Genius/Letras. See `tools/README.md`.
- **Playlist tracklist** at [[playlist]]. Exported from Spotify via [Exportify](https://exportify.net). Re-export and overwrite that file when the playlist changes.
- **No Anki**, no external SRS, no Python helpers. Everything in the vault.
