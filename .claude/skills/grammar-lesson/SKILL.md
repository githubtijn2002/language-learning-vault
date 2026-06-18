---
name: grammar-lesson
description: Run a focused 60-minute grammar deep dive in the target language on a **new** concept (or one barely introduced). Teach the form contrastively against the learner's L1 (and any prior-language interference noted in context_map), then drill recognition → translation → open production. Text-only — no player. Vocab is incidental, anchored to the concept. Use when the learner asks for a "grammar lesson", "grammar drill", or names a specific concept (preterite vs imperfect, ser/estar, subjunctive, gustar-type, particles, declensions, etc.).
---

# grammar-lesson

A 60-minute text-only drill for **introducing or consolidating a grammar concept the learner hasn't fully met yet**. Complements `song-lesson` (which only touches grammar in its 12-minute phase d): use this when a concept needs sustained, isolated focus.

## What this skill is — and is not

**grammar-lesson teaches new material.** Its job is to introduce or consolidate a concept the learner hasn't seen in depth, or has met only glancingly in a song. Output: a new (or expanded) `vault/grammar/<slug>.md` and a first solid set of production attempts on the target form.

**`review` reactivates old material.** It pulls items already in `struggle_log` and re-tests them. No new concept files, no formula teaching.

**Do not** turn this skill into a struggle_log replay. If the proposed concept is already in `vault/grammar/` with a streak ≥ 2 and recent contact, **route to `review` instead** and say so explicitly.

## Read first (every run, in order)

1. `vault/_meta/context_map.md` — target language, variant, current level + level_system, target level + deadline, L1, prior languages (for interference patterns).
2. `vault/_meta/learning_principles.md` — binding tone, correction format, struggle_log discipline.
3. `vault/_meta/struggle_log.md` — used as a **filter** (don't re-teach things the learner has already landed) and as a **gap signal** (a concept that surfaced but never had a full lesson is a strong candidate).
4. `ls vault/grammar/` — list of concepts already with a written file. Existing-file + low streak = continuation candidate; existing-file + streak ≥ 2 + recent contact = leave alone.
5. `vault/_meta/grammar_arc.md` — the **sequence map**. Drives Lane 1 below, and you write its Status column back at session end (single-writer rule — see *Always write*). If it's still a bare template (never populated), fall back to your knowledge of the language's standard progression and flag that the arc should be set up.

## Inputs (ask only what's missing)

- **Concept.** If the learner didn't name one, propose **3 candidates** per the selection rules below. Multiple-choice, one recommended, with a one-line rationale per option (level-appropriate / surfaced-but-untaught / sibling-of-active-item).
- **Intensity** A / B / C. Default **B** (firm — produce + correct).
- Duration assumed **long (60m)**. If the learner says 30m, run phases (b)+(d)+(e) only and tell them you're trimming. 15m → tell them grammar-lesson is the wrong tool and defer to `review`.

## Concept selection — propose 3, one from each lane

Bias toward **new material**. Pull one candidate from each lane, in this priority order:

**Lane 1 — Level-appropriate next concept (the default driver).**
**Read `vault/_meta/grammar_arc.md`.** The next concept is the **earliest `not-started` / `introduced` item in the current stage** whose prerequisites are `landed` or better. Items unlocked by an expander/refresher chain (arc § *Expander / refresher chains*) are equally valid Lane-1 candidates. Honor the prerequisite-clean rule (don't propose advanced subjunctive forms if present subjunctive triggers are still wobbly; don't propose keigo if te-form isn't solid; don't propose Genitiv if Akkusativ / Dativ are still hit-and-miss).

If the arc is missing or still a bare template, fall back to your knowledge of the standard grammar progression for the target language at the level-system's bands (CEFR / JLPT / HSK / TOPIK / ACTFL), propose the earliest unmet concept, and flag that the arc should be populated (via `setup`). If you're uncertain of the progression, name the uncertainty, propose the nearest concept you *are* sure about, and let the learner correct course.

**Lane 2 — Surfaced-but-untaught.**
Scan `struggle_log` for grammar items that appear once or twice but **have no `vault/grammar/<slug>.md` file yet** — i.e. the learner has touched the concept in a song / production turn but never had it formally introduced. These are the highest-leverage gaps.

**Lane 3 — Sibling of an active struggle_log item.**
A concept that *complements* something currently active in struggle_log without being a re-teach. Example for Spanish: if *ser/estar* is active, propose *por/para* (sibling: small-set contrast). For Japanese: if は/が is active, propose を/に contrast. The lesson teaches the sibling; the active item benefits from collateral exposure.

**Do not** propose:

- Concepts already in `vault/grammar/` with streak ≥ 2 and < 30 days since last seen → route to `review`.
- Concepts above the prerequisite line for the learner's current level.
- Concepts the learner nailed in a recent song-lesson phase (d) within the last 7 days.

## UI conventions (same as song-lesson)

Phase banner:

```
─── (X) <name> · <minutes>m ───
```

Ask with:

```
→ <one-line question>
```

Corrections always in this exact table — no prose corrections:

```
| # | Learner's answer | Corrected | Natural (variant) | Flag |
|---|---|---|---|---|
```

No fluff ("nice!", "great job"). Banner → content → next banner.

---

## Phases (60m total content)

### (a) Frame — 4m

- **One** sentence: what the concept is.
- **One** sentence: why the learner keeps missing it — cite the specific struggle_log row, the L1-interference pattern from context_map, or the prior-language false-friend (e.g. PT→ES, EN→DE). Be specific.
- State the success criterion for this session in one line (e.g. *"12/15 trigger calls correct, 0 form errors on the target conjugation"*).
- No examples yet.

### (b) Form + contrast — 10m

- Show the formula in a code block. Maximum 4 lines.
- Contrast table — exactly 3 columns: **Target | L1 | Trap** (substitute the L1 / interference language from context_map). 4–6 rows.
- List irregulars / stem-changes / exceptions inline. **No conjugation table dumps** — only the forms the learner will actually produce this session.
- If `vault/grammar/<slug>.md` already exists, **read it first** and refer back to its formula instead of rewriting.

### (c) Recognition drill — 10m

- 8–10 short sentences in the target language. The learner does not translate — they call the form / trigger.
  - Example for preterite-vs-imperfect: paste sentence, learner says "pret" or "imp" + why.
  - Example for ser/estar: learner calls *ser* or *estar* for each blank.
  - Example for German cases: learner calls Nominativ / Akkusativ / Dativ / Genitiv.
- Run them all, then one compact table with answers + hit/miss.
- This phase surfaces concept gaps cheaply, before production load is added.

### (d) Translation drill — 20m

- **12–15 L1→target sentences**, ramping:
  - 1–4: bare concept, short, present-tense scaffolding around it.
  - 5–10: concept + 1 distractor (gender/agreement/word-order/article).
  - 11–15: concept embedded in 2-clause sentences anchored to the learner's life (pull from `context_map.md` § interests + motivation — work, hobbies, the people the trip/move targets).
- Learner translates each. Correct in the table above. **Hold collateral errors for the table — don't break flow with prose.**
- Track separately: **trigger-call accuracy** (concept call right/wrong) vs **form accuracy** (conjugation/inflection right/wrong) vs **collateral errors** (gender, vocab, L1-bleed). The verdict in (f) needs all three numbers.

### (e) Open production — 12m

- 3 prompts ramping in difficulty. Each must:
  - Force the target concept naturally (not as fill-in-the-blank).
  - Be anchored to a real scenario from the learner's life — people, hobbies, work, the trip / move / exam in `context_map.md`.
- Learner writes 1–3 sentences per prompt. Correct in the table.
- For at least one prompt, ask the learner to read their corrected sentence out loud once (no scoring — just so the form leaves their mouth).

### (f) Verdict + log — 4m

- One paragraph max. State the three numbers from (d): trigger calls X/Y, form errors Z, collateral errors W.
- Say plainly whether the concept is **wobbly / landing / landed / graduating**. Use struggle_log's graduation rule (3 clean streaks across ≥2 sessions).
- Suggest next move (one line). Options: another contact in the next song-lesson phase (c) / a follow-up grammar-lesson on a sibling concept / move to `review`.

---

## Always write at end of session

1. **Session log** — `vault/sessions/<YYYY-MM-DD>_grammar_<slug>.md`. Shape:

   ```
   # <YYYY-MM-DD> — Grammar: <concept>

   **Type:** grammar drill (<long|mid>, ~<N>m)
   **Trigger:** <why this concept now — struggle_log row or explicit request>

   ## Concept covered
   <bullets>

   ## Forms taught
   <list — only the forms produced this session>

   ## Drill — <N> sentences
   Trigger-call accuracy: X/Y
   Form accuracy: Z err
   Collateral errors:
   - #<n>: <description>

   ## Production — 3 prompts
   - **P1.** <prompt> → <result + errors>
   - **P2.** ...
   - **P3.** ...

   ## Verdict
   <one paragraph>

   ## struggle_log changes
   - <bullets>

   ## Suggested next moves
   - <bullets>
   ```

2. **Grammar concept file** — `vault/grammar/<slug>.md`. Create if missing (use `vault/grammar/_template.md` if one exists, else inline a header with frontmatter for concept/slug/level/first_seen/tags). Append to *Examples* and *Common mistakes / my mistakes* if the file already exists. **Never overwrite** an existing entry's *One-sentence concept* or *Formula* without asking.

3. **`vault/_meta/struggle_log.md`** — update **silently** (do not narrate "logging this" mid-session):

   - Target concept: bump *Last seen*, increment streak if clean, reset to 0 if any in-session miss.
   - Each collateral error: append to its existing row (bump *Wrong*, update *Last seen*, append note) or add a new row.
   - If a row's streak hits 3 across ≥2 sessions, move it to *Graduated*.
   - If a new pattern emerged ≥2 times this session, add to the recurring-patterns section.

4. **`vault/_meta/grammar_arc.md`** — mirror the (f) verdict into the target concept's **Status** column, in the *same* write as struggle_log. Use the arc's status vocabulary (`not-started` → `introduced` → `landing` → `landed` → `graduated`). **This skill is the only writer of arc status.** If the verdict graduates the concept and the next stage's *Gate* is now met, note it in the verdict line so `placement` picks it up. Don't narrate this write (same silent-update discipline as struggle_log). Skip if the arc is still a bare unpopulated template.

5. **No new culture/vocab files** unless the concept genuinely required a vocab anchor (e.g. teaching gustar-type requires the IO-pronoun mini-set — that's fine, append to `vault/vocab/grammar/<slug>.md`).

## End-of-session message (exact shape)

```
Logged: <session-path>
Concept: <slug> — <wobbly|landing|landed|graduating>
Drill: triggers <X/Y> · forms <Z err> · collateral <W err>
Next move: <one line>
```

## Tone

- Brisk. Pattern-match explanations work better than prose lectures.
- **Do** spell out L1 / prior-language contrasts when the concept invites interference (false friends, orthographic swaps, false-cognate verb forms). That's high-leverage.
- **Don't** dump full conjugation / declension tables. Only the forms the learner will produce this session.
- No emojis. No transitional fluff.
