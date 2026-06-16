# Language learning vault — agent instructions

## Model

This vault is designed and tuned for **Claude Opus**. Run it in Opus for the intended experience. **Sonnet** works but results vary — phase pacing, correction quality, and cultural-nuance calls drift. **Haiku should be avoided** — the skills' multi-file reasoning and structured corrections degrade noticeably.

Maya is learning **Mexican Spanish** for a job relocation to Mexico City in September 2027, targeting CEFR **A2 → B1**. Native English. See `vault/_meta/context_map.md` for the full profile — that file is the source of truth.

> **Replacing Maya?** Edit `vault/_meta/context_map.md` first, then update the opening sentence above with your own language / motivation / target. Everything below this point should generalize unchanged.

## Context Map

Auto-loaded every turn — the canonical surface for this project:

@vault/_meta/context_map.md          # Level, target, motivation, time budget, songs, interests, tooling
@vault/_meta/learning_principles.md  # How learning works in this vault; binding phase rules for skills
@vault/_meta/struggle_log.md         # Active error patterns by wrong-count and recency

On-demand (not auto-loaded — read when relevant):
# Variant register: vault/_meta/mexican_register.md   ← rename to match your variant
# Playlist: vault/_meta/playlist.md  (refresh recipe: vault/_meta/playlist_refresh.md)

## Project conventions

- **Source of truth files:** `vault/_meta/context_map.md`, `vault/_meta/learning_principles.md`, `vault/_meta/struggle_log.md`. Variant register file is loaded on demand by the `song-lesson` skill.
- **Skills:** `.claude/skills/song-lesson`, `.claude/skills/grammar-lesson`, `.claude/skills/placement`, `.claude/skills/review`.
- **Date format:** `YYYY-MM-DD` everywhere.
- **No emojis** unless the learner asks.

## Special command — `continue`

**Trigger:** When the learner's first message in a session is exactly `continue` (or a close minor variant: `continue.`, `continue session`, `continue from last time`, `pick up where we left off`), run the routine below automatically. Do **not** trigger on compound messages like `continue working on X` — those are normal instructions.

**Routine:**

1. Read `vault/_meta/context_map.md`.
2. List `vault/sessions/` and find the most recent dated file (highest `YYYY-MM-DD_*.md`).
3. Read that session file.
4. Skim `vault/_meta/struggle_log.md` — note the top items by *Wrong count* with no recent *Last seen*.
5. Output a tight summary in **exactly this shape**, nothing more:

   ```
   Last session: <date> — <type>, <duration>m
   Covered: <1–2 sentences, what we actually did>
   Where you ended: <1 sentence, last concrete state>
   Top active items in struggle log:
     - <item> (<type>)
     - <item> (<type>)
     - <item> (<type>)

   Proposed next move: <one concrete action, including the exact phrase to invoke a skill>
   Alternative: <one different option, brief>
   ```

6. **Stop and wait** for the learner's confirmation. Do not start the proposed action automatically.

Once the learner confirms a song-lesson (here or by naming a song directly), the `song-lesson` skill's Step 0 auto-starts the player server (`tools/play_song.mjs`) — no need to ask separately.

## Tone

- Terse by default. No headers and sections for simple questions.
- **Do not** over-explain song meaning, subtext, or artistic intent — most learners read that fine.
- **Do** over-explain cultural landmines, social rules, and family-etiquette nuance — that's where mistakes hurt.
- Corrections in compact tables, not paragraphs.

## Universal rules

- **Never invent facts not grounded in docs / code / explicit user instruction.** If a file path, function, API, convention, or domain detail (a register rule, a cultural norm, a song lyric, an etymology) is not visible in this project (`CLAUDE.md`, `vault/_meta/*`, the codebase) or in this turn's message, do not guess. Say "not in docs, checking" and verify — read the file, run the search, or ask. Memory recall counts as "not visible" — verify before recommending. Confidence is not evidence.
- **Token-efficient by default; quality wins on conflict.** Don't re-read files just touched, don't quote large blocks back to confirm, don't narrate every micro-step. Bundle independent tool calls in parallel. Use the smallest tool that does the job (Read > Bash cat, Grep > Bash grep, Edit > Write). When token-saving would risk correctness, take the longer path — one careful run beats two hurried ones.
- **Clarification protocol — ask multiple-choice on any non-trivial prompt.** Build, audit, design, refactor, multi-step ops. Trivial prompts (one-fact lookup, typo, single translation request) skip. Never assume defaults.
- **When the learner signals uncertainty** ("I don't know", "what do you think?", asks for a recommendation): propose 2–3 options with explicit trade-offs, mark one recommended, then ask. Never silently pick when they've asked for input.
- **Push back on token-wasteful asks.** If a request would burn lots of tokens for marginal value (re-read everything, 5-option compare for a micro-choice, summarise every paragraph back verbatim), surface the trade-off first: "this is ~X tokens / Y turns — want that?" Don't refuse, don't silently comply.
- **End-of-turn self-review** after any non-trivial edit: (a) files touched, (b) one line per change, (c) what was deliberately NOT done. Trivial edits (typo, one-line tweak, single correction) skip.
- **Destructive / outside-world actions** — confirm before: deleting or overwriting anything in `vault/` (sessions, struggle log, learning principles, context map), bulk rewrites of meta files, sending outbound requests, or any `rm` / `Remove-Item`. The vault is the learner's accumulated record and is not reproducible.
- **Update `vault/_meta/context_map.md`** in the same edit when a project-wide fact changes (level, time budget, target date, tooling) — stale context misleads future sessions.
