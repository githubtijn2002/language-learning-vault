---
name: setup
description: First-run configuration. Interview a new learner about their goals and populate the vault's source-of-truth files (context_map.md and the variant register file) from their answers, then hand off to the placement test. Use when the vault still contains the template's example learner, or when the learner asks to "set up", "make the vault mine", or "configure for my language".
---

# setup

One-time skill that turns the **template** into **this learner's vault**. It replaces the shipped example learner (the template's `context_map.md` + `<variant>_register.md`) with the learner's real profile, gathered through a short interview, and writes it to the source-of-truth files. After this, every other skill reads those files and behaves correctly for the target language.

## When to run
- The shipped `context_map.md` still describes the template's example learner (placeholder name / language), **or**
- the learner explicitly asks to set up or reconfigure.

If `context_map.md` is already personalised and the learner didn't ask to redo it, **don't run** — say it's already set up and route to `placement` or a lesson.

## Read first
1. `vault/_meta/context_map.md` — to detect placeholder content and see the field structure to fill.
2. `SETUP.md` — the manual steps (plugin install, optional Docker/LanguageTool, optional Azure TTS) you'll point the learner to for anything outside the vault files.

## Do NOT
- Install plugins or run shell tools yourself — those are manual; point the learner to `SETUP.md`.
- Invent the learner's level — gather a self-assessment here; the `placement` skill calibrates it properly afterwards.
- Fabricate language facts. If unsure about a variant's register/lexicon, say so and ask, or leave a clearly-marked TODO in the register file for a later pass.
- Fabricate a grammar progression. When populating the arc (below), only commit to the standard sequence you're confident of for the target language at its level system; leave a clearly-marked TODO for bands you're unsure of rather than inventing concepts or ordering.

## Interview (ask in small batches — multiple-choice where the option set is clear, free text otherwise)
Gather, then confirm back before writing anything:
1. **Target language** and **variant** (dialect/region) — the variant drives the register file and locale-specific guidance.
2. **L1** (native language) and **other languages** known, with rough levels — these are the interference sources every correction-giving skill needs.
3. **Level system** for the language — CEFR / JLPT / HSK / TOPIK / ACTFL (pick the standard for that language) and **current self-assessed level**.
4. **Target level + date**, and **concrete success criteria** (what they want to *do* with the language).
5. **Motivation** — why, and for whom. Be specific (a trip, family, work, an exam).
6. **Cultural focus** — social stakes, etiquette, register norms that matter to them.
7. **Time budget** — realistic weekly hours and how they split into long / mid / short sessions.
8. **Personal interests** — content hooks (music, sport, fiction, a work domain) that skills can anchor examples to.
9. **Priority skills** — rank listening / speaking / reading / writing / grammar.

## Write (only after the learner confirms the summary)
1. **`vault/_meta/context_map.md`** — fill the frontmatter (`level_system`, `target_language`, `target_variant`, `source_language`, `working_language`) and every section (Learner / Target / Motivation / Cultural focus / Time budget / Personal interests / Tooling) from the answers. Convert relative dates to absolute `YYYY-MM-DD`.
2. **Variant register file** — create `vault/_meta/<variant>_register.md` (rename the shipped example if present). Scaffold: lexicon to prefer/avoid, register markers (formality / honorifics / diminutives), common sentence patterns, pronunciation notes, and topic banks anchored to the learner's interests. Fill what you can confidently; leave clearly-marked TODOs for variant details you're unsure of. If you renamed the file, update the one `register.md` reference in `song-lesson/SKILL.md`.
3. **Grammar arc** — populate `vault/_meta/grammar_arc.md` (it ships as a bare framework). From the declared `level_system`, create one stage section per band from the learner's current band up to (and one beyond) their target, ordered with the standard grammar progression for the target language. Set every concept `not-started`, give each a prerequisite and a stage **Gate**, and fill the expander/refresher chains for that language. Leave clearly-marked TODOs for any band/progression you're unsure of (see *Do NOT*). The framework parts (status vocabulary, single-writer rule, retest trigger) are universal — leave them as-is.
4. **SRS deck language** — record in `context_map.md` Tooling that flashcard files use `#flashcards/<lang>/<type>` (replace `<lang>` with the target-language slug). The `vocab-lesson` and `song-lesson` skills read this convention.
5. **Reset example data** — clear the template's example `struggle_log.md` rows and `playlist.md` placeholders. **Confirm before deleting.**

## Hand-off (end-of-session message, exact shape)
```
Vault configured: <target language> (<variant>), <L1> speaker, <level_system> <current>→<target> by <date>.
Wrote: context_map.md, <variant>_register.md, grammar_arc.md
Manual steps left (see SETUP.md): install plugins; (optional) Docker + LanguageTool; (optional) Azure TTS.
Next move: run the `placement` skill to calibrate your real level.
```

## Tone
Warm but efficient — this is onboarding, not a lesson. Multiple-choice to cut typing where the option set is clear; free text for motivation and success criteria. No emojis. Confirm the full summary back to the learner before writing anything.
