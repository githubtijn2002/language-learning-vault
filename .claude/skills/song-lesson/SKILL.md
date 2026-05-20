---
name: song-lesson
description: Run a song-driven language lesson, driven by the local player at tools/play_song.mjs. Long (≈80m) by default; mid (30m) = phases c/d/f/h1 only; short (15m) defers to the review skill. Conversation practice is always the learner talking to Claude (as Claude) — never roleplay as a named real person in the learner's life.
---

# song-lesson

## Read first (every run, in order)

1. `vault/_meta/context_map.md` — target language, variant, level, motivation, time budget. Note the `target_variant` frontmatter value — it dictates which register file you load in step 4.
2. `vault/_meta/learning_principles.md` — binding phase rules (this is the source of truth for the phase table; the one-line reminders below summarise it).
3. `vault/_meta/struggle_log.md` — historical weak items. Drives phase (c) selection, phase (h1) shadow line picks, and phase (h2) dialogue topic.
4. `vault/_meta/<variant>_register.md` — the variant lexicon and register rules. The template ships with `mexican_register.md` for the Maya example; if you've renamed it (e.g. `tokyo_register.md`, `parisian_register.md`), load that one. **Re-read at the start of phase (h2)** before composing any Claude dialogue turn.

## Inputs (ask only what's missing)

- Song title + artist.
- Energy → intensity A / B / C (default B).
- Duration → long (≈80m, default) / mid (30m) / short (15m → defer to `review`).

## Step 0 — start the player (every run, before phase (a))

**Do this automatically — don't ask permission.** As soon as a song-lesson is confirmed (the learner names a song, or confirms a song-lesson proposed by the `continue` routine), spawn the player server in the background:

```
node tools/play_song.mjs "<artist>" "<song title>"
```

Use the Bash tool with `run_in_background: true`. The server:

- prints its URL on stdout (`http://127.0.0.1:<port>/`) and opens a browser tab,
- writes `tools/.player/.server.json` so `ctl` commands can find it,
- fetches synced lyrics from lrclib.net and (if needed) downloads audio via `yt-dlp` on embed-block.

Confirm the server is up by running `node tools/play_song.mjs ctl status` once before phase (a). If the player doesn't load (e.g. `yt-dlp` missing for an embed-blocked song), tell the learner the exact install command and either pass `--url` to swap to another upload or fall back to a text-only flow.

**Neural TTS:** if the env vars `AZURE_TTS_KEY` + `AZURE_TTS_REGION` are set, the server logs `azure-tts: enabled` and the (h2) voice dropdown will offer real neural voices in the target locale. If not, only browser voices are available — note it but don't block the lesson.

At the end of the session, run `node tools/play_song.mjs ctl stop`.

### `ctl` quick reference (use throughout phases)

```
ctl play [<start> [<end>]]           # seek + optionally loop start↔end
ctl pause
ctl seek <t>
ctl rate <1|0.75|0.5>
ctl loop <a> <b> [--times <n>]
ctl clear-loop
ctl hide-lyrics                       # blank the lyrics column (used in (a) and (i))
ctl show-lyrics                       # restore the lyrics column
ctl practice shadow --lines <i,j,k>  # (h1)
ctl practice dialogue start --opener "<line>"   # (h2) begin
ctl practice dialogue say "<line>"              # (h2) each Claude turn
ctl practice end
ctl status
ctl stop
```

The `/data` endpoint of the running server returns the parsed line list with timestamps — use it to pick start/end seconds and line indices. Read it via:

```
curl -s http://127.0.0.1:<port>/data
```

(The port is in `tools/.player/.server.json`.)

---

## UI conventions (use every phase, no exceptions)

Phase banner (one line, blank line after):

```
─── (X) <name> · <minutes>m ───
```

Ask for input with exactly:

```
→ <one-line question>
```

Corrections always in this 3-column table, nothing else:

```
| Corrected (kept meaning) | Natural <variant> | Flag |
|---|---|---|
```

(Replace `<variant>` with the learner's `target_variant` — e.g. *Natural Mexican*, *Natural Tokyo*, *Natural Parisian*.)

**No transitional fluff.** No "great!", "let's move on", "nice work". Banner → content → next banner. Brisk.

---

## Phase rules (one-line reminders; full rules in learning_principles.md)

- **(a) 5m — Cold listen.** `ctl hide-lyrics` then `ctl play 0`. End with: *"5 content words you caught."* `ctl show-lyrics` before phase (b).
- **(b) 15m — Stanza walkthrough.** Iterate 5–8 non-filler stanzas. For each: `ctl loop <start> <end> --times 2`, ask the learner to translate, give the natural English back, flag one thing. No correction table here.
- **(c) 10m — Deep dive.** Pick 3–5 lines per selection rules. For each: `ctl loop` the line, learner commits a guess first, then table (guess / literal / natural). Seed phase (f) prompts.
- **(d) 12m — Grammar.** 1–3 structures, each anchored to the learner's real life (interests / motivation from `context_map.md`). Save to `vault/grammar/<slug>.md` (reuse if exists).
- **(e) 5m — Vocab.** Cap 5 cards, append to `vault/vocab/songs/<slug>.md`, always include source lyric.
- **(f) 10m — Production.** 3 prompts, ramping. Correct in the table above. Log each wrong item to **both** the session error table **and** `vault/_meta/struggle_log.md`.
- **(g) 3m — Culture.** One footnote max, 2 sentences, skip if nothing real.
- **(h1) 8m — Shadow.** See below.
- **(h2) 10m — Conversation with Claude.** See below.
- **(i) 5m — Closing listen.** `ctl hide-lyrics` then `ctl play 0`. Ask: *"What landed differently than the cold listen?"* `ctl show-lyrics` after.

## Phase (c) line-selection — see `learning_principles.md`

Read `vault/_meta/struggle_log.md` first. Use the selection criteria there.

## Phase (h1) — Shadow practice

1. Pick 4–6 line indices, weighted toward:
   - lines the learner stumbled on in (c),
   - struggle_log items they produced incorrectly in (f),
   - any struggle_log entry not seen in 7+ days.
2. Run `ctl practice shadow --lines <i,j,k,...>` (indices into the `/data` lines array).
3. The learner does the shadow loop in-browser: Play → Speak → score appears → Next.
4. When they tell you they're done (or after the summary screen), read `vault/practice/<slug>_<YYYY-MM-DD>.md`. The latest `## Shadow — HH:MM:SS` block has the score table.
5. Call out the two weakest lines. Append any line with ratio < 0.65 to `struggle_log` *Pronunciation* (create the section if missing).

## Phase (h2) — Conversation with Claude

**The learner talks to Claude, as Claude.** Do **not** roleplay as any named real person in their life (partner, family member, coworker, friend). The conversation partner is Claude in the target variant register. Topics can be ones the learner might later raise with real people (reinforcement), but the speaker is never them.

**Read the variant register file before starting** (the `<variant>_register.md` you loaded in step 4). Every Claude line should use the prefer-list there, follow the register hierarchy, and avoid the markers from other variants.

**Topic rotation — vary across sessions.** Don't default to the same topic every time. Pick one bank from the variant register file § "Topic banks":

1. song-anchored topic (vocab/grammar from this lesson applied to a related real scenario — preferred when the song has a strong theme),
2. the learner's life hooks (from `context_map.md` § Personal interests),
3. cultural prep (variant-specific norms, food, transit, holidays, address forms),
4. motivation-specific (relocation logistics, family events, work scenarios — only when it fits),
5. free/current (yesterday, weekend, opinion).

The chosen topic must still naturally pull in:

- this session's 5 vocab cards,
- 3–5 items from `struggle_log` not seen in the last 7 days,
- 1–2 grammar concepts touched in the last 14 days.

State the target items in chat **before** starting so the learner knows what to aim for:

```
h2 target items (try to use at least 4):
- <vocab from this song>
- <vocab from struggle log>
- <grammar concept>
- ...
```

Turn loop:

1. **Open dialogue mode:** `ctl practice dialogue start --opener "<your first line in the target variant>"`.
2. The browser TTS-speaks the line and auto-arms the mic. The learner replies; the transcript is appended to `vault/practice/<slug>_<YYYY-MM-DD>.md` under the current `## Dialogue` section.
3. In chat, tell the learner: *"your turn — when you've spoken, type `next`."*
4. When they signal, **read the vault practice file** and take the last `**Learner:**` line.
5. Compose your next turn in plain target variant (no glosses, no English/L1 unless explicitly asked). Send: `ctl practice dialogue say "<next line>"`.
6. Repeat for 5–7 total Claude turns.
7. End with `ctl practice end`. Briefly call out: which target items the learner used vs. missed, one register/grammar note worth keeping.

Voice rules:

- Target variant register per the variant register file. Default to the address form the learner needs most to practice (e.g. *tú* with peers, *usted* with elders/leadership).
- **Calibrate to the learner's level** from `context_map.md`. At A1–A2: 1–2 short sentences per Claude turn, one concrete question, present tense, familiar vocab. Avoid abstract reflection prompts, embedded relatives, low-frequency vocab, subjunctive-heavy phrasing.
- Real-time conversation pace — short turns drive turn-taking. Long monologue from Claude kills the rhythm.
- React naturally to what the learner actually said, not what you hoped they'd say. If they ask for translation help, give it briefly and continue.
- You are Claude. You can mention you're their AI partner if it comes up; never pretend to be a specific person from their life.

## Phase (i) — Closing listen

`ctl play 0`. Optionally `ctl rate 1` to be sure. Learner averts their eyes; you don't comment during. After: one question, one sentence answer, no table.

---

## Tone

Most learners pick up song meaning, subtext, and artistic intent at least as well as in their L1. **Do not over-explain** what the song "is about." Over-thoroughness applies to **cultural landmines**, not to music interpretation.

## Always write at end of session

- `vault/sessions/<YYYY-MM-DD>_song_<slug>.md` (from template).
- `vault/vocab/songs/<slug>.md` (append or create).
- `vault/grammar/<concept-slug>.md` (one file per concept, reuse).
- `vault/culture/<slug>.md` — only if (g) produced something.
- `vault/_meta/struggle_log.md` — append (f) errors, (c) stumbles, (h1) lines scored < 0.65. Update *Last seen* dates on items already in the log.
- `vault/practice/<slug>_<YYYY-MM-DD>.md` — already written automatically by the player; reference it from the session log.

Then: `node tools/play_song.mjs ctl stop`.

## End-of-session message (exact shape, no more)

```
Logged: <session-path>
Wrong this session: <N> → struggle_log
Shadow weakest: <line> (<ratio>), <line> (<ratio>)
Next move: <one concrete action>
```
