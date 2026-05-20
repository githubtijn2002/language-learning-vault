# Learning principles — phases and weak-point mitigations

This is the operating spec for the `song-lesson` skill. Each phase has a known weakness on the median learner's profile (reading is easier than listening; pattern-recognition is faster than retrieval; coverage drifts toward depth-on-one-line). The mitigation is built into the instruction, not optional.

The skill is driven by a local player (`tools/play_song.mjs`) with synced lyrics, a control plane, and Web Speech practice modes. The phase rules below assume the player is running — see `SKILL.md` for the startup contract.

## Order, time, and intent

| # | Phase | Time | Builds | Weakness | Mitigation (binding) |
|---|---|---|---|---|---|
| a | Cold listen | 5 min | Ear training, ambiguity tolerance | Frustrating with the whole song; demotivates if mismatch is huge | **No lyrics on screen.** Agent runs `ctl play 0`. Whole song from start. End with one question: *"5 content words you caught."* No skip-around, no re-listens here. |
| b | Stanza walkthrough | 15 min | Coverage of the full song, gradual decoding | Risk of becoming a reading drill | Iterate non-filler stanzas (5–8 chunks of 2–4 lines). For each, agent runs `ctl loop <start> <end> --times 2`, learner gives a quick translation; agent gives the natural English back and flags **one** thing (vocab / grammar / idiom). Light — no full guess→literal→natural cycle, no correction table. Coverage > depth here. |
| c | High-leverage deep dive | 10 min | Active decoding, vocab inference | Reinforces reading bias if used on whole lyric | Agent picks 3–5 lines from the walkthrough using the selection rules below. For each: `ctl loop` the line once, learner commits a guess **before** anything is shown, then the 3-column table (guess / literal / natural) with **one divergence highlighted**. Seeds candidates for phase (f). |
| d | Grammar dissection | 12 min | Explicit grammar, transfer | Becomes a textbook drill | Cap at 1–3 structures. For each: 1-sentence concept, 2-line formula, **one usable production prompt anchored to something the learner might actually say in real life** (from their `context_map.md` interests / motivation). Never a conjugation table for its own sake. |
| e | Vocab harvest | 5 min | Long-term retention via SRS | SRS discipline; abandonment risk | **Cap at 5 cards per song**, not 10. Every card includes the source-lyric line as mnemonic context. Tag with the song slug. |
| f | Production task | 10 min | Speaking/writing fluency, error surfacing | Needs explicit, structured correction | 3 prompts, increasing difficulty. Correct in **exactly three lines**: (i) corrected preserving meaning, (ii) natural in the target variant, (iii) one specific grammar point flagged. No paragraphs. Append errors to `struggle_log`. |
| g | Cultural footnote | 3 min | Decoding what locals mean vs. say | Light if culture is batched separately | **One specific note per song, max 2 sentences.** Skip if the song has no obvious hook — don't manufacture. |
| h1 | Shadow practice | 8 min | Pronunciation, retrieval under pressure | Reading-only feedback misses production gaps | Agent picks 4–6 lines weighted toward this session's errors + `struggle_log` items not seen in 7 days. Agent runs `ctl practice shadow --lines <i,j,k,...>`. Learner does the in-browser shadow loop; scores append to `vault/practice/<slug>_<date>.md`. Agent reads that file, calls out the two weakest lines, and adds any sub-0.65 items to `struggle_log`. |
| h2 | Conversation | 10 min | Real-time speaking, spaced reactivation | A single prompt doesn't reinforce older material | Agent runs `ctl practice dialogue start --opener "<opening line in target language>"` and converses with the learner **as Claude** (in the target variant register) over 5–7 turns. **Never roleplay as a named real person in the learner's life.** Topic chosen so it naturally pulls in: this session's 5 vocab cards + 3–5 items from `struggle_log` not seen in 7 days + 1–2 grammar concepts touched in the last 14 days. Each turn loop is described in `SKILL.md`. Transcript appended to the same vault practice file. |
| i | Closing listen | 5 min | Consolidation; testing that comprehension has actually moved | Without contextual review, the gains decay overnight | `ctl play 0`. Learner averts their eyes from the screen and tries to follow the song without reading. After, one sentence: *"What landed differently than the cold listen?"* No corrections, no table — just the answer. |

**Total:** 83 min content. Long session ≈ 80 min.

## Mid-session (30 min) version

Run phases **(c) + (d) + (f) + (h1)** only — deep dive + grammar + production + shadow. Drop cold listen, walkthrough, vocab, footnote, dialogue, closing listen. The 30-min session is *focused production with pronunciation pressure*, anchored to lines the learner has seen before.

## Short-session (15 min) version

**No song-lesson.** Run the `review` skill instead. Songs are too expensive a unit for 15 minutes.

## Phase (c) line-selection rules

Pick 3–5 lines satisfying **≥2 of**:

1. Tests a vocab item in `struggle_log` *Vocab gaps* or *Recurring patterns*.
2. Tests a grammar item in `struggle_log` *Grammar weak points*.
3. Generalisable grammar for the target language (e.g. for Spanish: preterite vs. imperfect, ser/estar, por/para, subjunctive triggers, *gustar*-type, reflexives, DO/IO pronouns).
4. Variant register — items from the active `<variant>_register.md` (regional lexicon, address forms, register markers).
5. **Default for early sessions when `struggle_log` is sparse:** high-frequency content vocab at the learner's level not yet logged.

Skip fillers (chorus repeats, "oh oh") and pure-metaphor lines — they don't generalise.

## Tone calibration for songs

Most learners pick up message, subtext, and artistic intent at least as well as in their L1. **Do not over-explain** what the song "is about." Over-thoroughness applies to **cultural landmines**, not to music interpretation.

## Output artefacts (always write these after a long session)

- `vault/sessions/<YYYY-MM-DD>_song_<slug>.md` — session log
- `vault/vocab/songs/<slug>.md` — vocab cards (SRS-formatted)
- `vault/grammar/<concept-slug>.md` — grammar concept(s) covered, one file per concept, reuse if exists
- `vault/culture/<topic-slug>.md` — only if a real footnote applied
- `vault/practice/<slug>_<YYYY-MM-DD>.md` — written automatically by the player during (h1) and (h2). Reference it from the session log.
- `vault/_meta/struggle_log.md` — append phase (f) errors, phase (c) stumbles, and any (h1) shadow scores below 0.65.

## Refining this document

After every 3rd long session, ask the learner: *"what part of the format is not working for you?"* Update mitigations here. The skill reads this file at the start of every run.
