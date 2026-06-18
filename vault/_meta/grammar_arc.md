---
tags: [grammar, arc, meta]
target_level: <fill from context_map.md>
---

# Grammar arc — <target language>

**The ordered map of grammar concepts from the learner's current band to their target band, where they are on it, and what comes next.** This file is the source of truth for *sequence*. `struggle_log.md` is the source of truth for *per-item mastery state*; this file mirrors that state into a stage map so there's a single-glance "where am I / what's next / when do I retest."

> **Template note.** This file ships as a skeleton. The **stages and concept lists below are language-specific** — they are populated by the `setup` skill (or by hand) from the learner's declared `level_system` in `context_map.md`, ordered current→target band, using the standard grammar progression for the target language. The *framework* (status vocabulary, single-writer rule, gates, expander chains, retest trigger) is universal and should not be edited per-language. Delete this note once populated.

## How this file is used

- **`grammar-lesson` Lane 1** (the default concept driver) reads this file. The next concept = the earliest `not-started` / `introduced` item **in the current stage** whose prerequisites are `landed` or better. Expander/refresher chains (below) are valid candidates too.
- **`placement`** reads the stage **gates** to decide whether a re-test is due ahead of the time-based clock.

## Single-writer rule (staleness guard)

**Only `grammar-lesson` writes the Status column here** — at session end, in the *same* write that updates `struggle_log.md`. No other skill touches arc status. `struggle_log` is authoritative; if the two disagree, `struggle_log` wins and this file is corrected on the next grammar-lesson. Don't hand-edit status during a session.

## Status vocabulary (universal)

| Status | Meaning | struggle_log equivalent |
|---|---|---|
| `not-started` | not yet taught | (no row) |
| `introduced` | a grammar file exists / met glancingly; no solid production | wobbly |
| `landing` | producing it, still slips under load | landing |
| `landed` | clean recent production, streak building | landed / streak ≥2 |
| `graduated` | 3 clean streaks across ≥2 sessions | Graduated section |

---

## Stages

Stages are named by the **level system's bands** (`level_system` in `context_map.md`):
- **CEFR** (Spanish/French/German/…): A1 · A2 · B1 · B2 · C1 · C2
- **JLPT** (Japanese): N5 · N4 · N3 · N2 · N1
- **HSK** (Mandarin): 1–2 · 3 · 4 · 5 · 6
- **TOPIK** (Korean): 1–2 · 3–4 · 5–6
- **ACTFL**: Novice · Intermediate · Advanced · Superior

Create one section per band **from the learner's current band up to (and one beyond) their target**. Each stage: a concept table + an **Expanders/refreshers** block + a **Gate** line.

### Stage — <band N> (e.g. A2 core / JLPT N4)
**Gate:** <objective, countable condition that signals "ready to test the next band up", e.g. "≥6 concepts `landed`" or "particles は/が/を/に all `landed`">.

| Concept | Prereq | File | Status |
|---|---|---|---|
| <concept> | <prereq or —> | [[grammar/<slug>]] or — | not-started |
| … | | | |

*(repeat a stage section per band)*

---

## Expander / refresher chains (binding)

From `learning_principles.md` block-then-interleave (block one side of a contrast until solid, then interleave with its pair across *later* sessions — within-session interleaving of a new contrast hurts; across-session helps). When the left item reaches the named status, the right item becomes a valid Lane-1 candidate. Populate per language, e.g.:
- Spanish: *ser/estar* `landed` → pair with *por/para*; present subjunctive `landed` → imperfect subjunctive + si-clauses.
- Japanese: は/が `landed` → を/に contrast; て-form `landed` → て-form chains + 〜ている.
- A recurring/regressed item → **scheduled refresher micro-drill**, not a re-teach (pull into a song-lesson phase (c) or a review block).

## Re-test trigger (read by `placement`)

Re-test when **EITHER** is true, whichever comes first:
- the time-based clock has elapsed (8 weeks since the last placement), **OR**
- the current stage's **Gate** is met.

Record the next trigger as **both** the date and the active stage gate, so a future session can tell which is closer.
