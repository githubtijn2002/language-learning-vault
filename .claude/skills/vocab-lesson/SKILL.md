---
name: vocab-lesson
description: Run a systematic high-frequency vocabulary session in the target language — choose 5 / 15 / 25 new words, learn them first in isolation (form-meaning), then in scaffolded sentences, looping until they land, then feed them to spaced review. Evidence-based (thematic batching, productive recall, successive relearning). Use when the learner asks to "learn words", "vocab lesson", "new vocab", or to build toward a high-frequency conversational target. Complements song-lesson phase (e) (incidental harvest) and review (reactivation of old items).
---

# vocab-lesson

The vault's **systematic vocabulary engine** toward the learner's high-frequency conversational target (set in `context_map.md`). Song-lessons harvest incidentally (≤5/song); `review` reactivates old items; **this skill acquires new high-frequency words deliberately and durably.** Every rule below traces to SLA evidence (see the evidence map at the bottom) — don't "simplify" them away.

## Read first (every run, in order)
1. `vault/_meta/context_map.md` — target language + variant, level, vocab target, time budget, L1 + prior languages (interference sources).
2. `vault/_meta/learning_principles.md` — tone, the correction-table format, struggle_log discipline (update **silently**).
3. `vault/_meta/struggle_log.md` — source of *known/strong* items for scaffolding, and of interference patterns to flag. Don't re-teach graduated items.
4. `vault/_meta/<variant>_register.md` — only if a target word has a variant-specific sense; use the variant sense.

## Inputs (ask only what's missing)
- **Batch size → session length:** **5** (~20–30 min) / **15** (~45–60 min) / **25** (~75–90 min, a stretch — may split into two ~12-word sub-batches if recall is poor). Default **15**.
- **Word source** (see below).

### Word source (do NOT fabricate frequency rankings)
In priority order:
1. **Seeded high-frequency list** for the target language under `vault/vocab/frequency/` (ranked `word count`, spoken register preferred). Take the **next unlearned band** (coverage tracked in `vault/vocab/sessions/`). Process each pulled band: lemmatise inflected forms; skip function words the learner already knows, proper names / noise, and obvious cognates the learner already owns (flag false-friends instead). *(If no frequency list exists yet, see SETUP.md for how to source one for your language; until then use sources 2–4.)*
2. **Song-harvest carry-over** — words flagged but not yet drilled from recent `vault/vocab/songs/*.md`.
3. **Learner-supplied words** — a list they give you.
4. **struggle_log "new" vocab gaps** not yet solidified.

## Batch composition rules (binding — the evidence-critical part)
- **Batch thematically or unrelated — NEVER as a semantic category.** Co-hyponyms (all colours, all family-members, all body-parts), synonyms, and antonyms *interfere* and slow initial learning, worst at lower levels (Tinkham; Waring; Erten & Tekin; Nakata & Suzuki). A *scenario* theme (e.g. "meeting the family": greet / introduce-self / in-law / welcome / get-to-know) is fine; a *category* set (all relatives by type) is not.
- **Never co-locate false-friends or look-alikes in the same batch** — from the learner's L1 or a closely related prior language noted in `context_map.md`. Flag each false-friend with an explicit contrast anchor at introduction ("L1 *X* → target *Y*").
- **Scaffold weak new words with KNOWN words** (struggle_log graduates / prior sessions), not with other new related words.
- **Mix a few review-pool items** (old SRS / struggle_log items) so repetitions of any one new word are spaced by 2–3 intervening items within the session (Kornell).

## UI conventions (match song-lesson / grammar-lesson)
Phase banner: `─── (X) <name> · <minutes>m ───` (blank line after).
Ask with: `→ <one-line question>`.
Corrections in this exact table, nothing else:
```
| # | Learner's answer | Corrected | Natural (variant) | Flag |
|---|---|---|---|---|
```
No fluff ("great!", "nice"). Banner → content → next banner. No emojis.

---

## Phases

### (A) Isolation — form-meaning · ~30% of session
Establish the form↔meaning link efficiently. For each word:
- Present **target → L1** (receptive), then immediately **L1 → target** (productive — the direction that serves speaking).
- Give the **audio / pronunciation cue** (target-locale voice if available) and part of speech. Show **one** real example sentence but don't study it yet.
- **No culture/collocation/morphology elaboration here** — semantic overload during form-encoding suppresses form retention (Barcroft TOPRA). Keep it lean.
- A word **advances to (B)** on **one correct productive (L1→target) recall**. Words not recalled stay in the (A) queue and recycle.

### (B) Sentence scaffolding — rising load · ~45% of session
Three sub-stages; only words that passed (A) enter here:
- **B1 — read in a known frame:** show a target-language sentence using the target word with all *other* words known; the learner translates to their L1. (Scaffolded, receptive.)
- **B2 — produce:** give an L1 sentence; the learner produces the target, **committing their attempt before** you show the model (generation effect). Highest-leverage step for the speaking goal.
- **B3 — combine:** put **at most 2 already-passed new words** in one sentence (never two co-hyponyms; deliberately interleave words from different sub-batches — desirable difficulty). Never exceed 2 new items per sentence (working-memory ceiling).
- Correct in the table above. Append every error to `struggle_log` **silently**. For interference errors, the Flag must name the L1↔target contrast.

### (C) Mastery loop · ~15% of session
- A word **passes the session** when it has **1 correct productive recall (A) + 1 correct production (B2)**.
- Failed/shaky words **recycle** through (A)/(B). **Do not retire a word after a single pass** (Kornell & Bjork — premature dropping hurts).
- Stop when most of the batch has passed (or time's up). Report the pass/recycle split.

### (D) Spaced-review hand-off · ~10% of session
- **Passed words →** create SRS-formatted cards in `vault/vocab/sessions/<slug-or-date>.md` (vault's multi-line card format), **including the pronunciation / audio cue** and the source example sentence as mnemonic context. **Tag the file `#flashcards/<lang>/vocab`** (mandatory — the deck tag the Spaced Repetition plugin scans for; `<lang>` = the target-language slug from `context_map.md`). Initial interval 1–3 days.
- **Failed words →** note them to re-open next session in (A).
- **Successive relearning:** these words need a correct recall across **~3 spaced sessions** before intervals grow toward 1–2 weeks (Cepeda). **The schedule must be system-driven, not left to "whenever."**
- **Constraint (mirrors `review`):** this skill prepares cards + logs; it does **not** edit the Spaced Repetition plugin's `<!--SR:-->` markers — the learner runs the plugin reviews. Say so if relevant.

---

## Always write at end of session
- `vault/vocab/sessions/<YYYY-MM-DD>.md` — the session log: words covered, pass/recycle split, the cards created, errors. **Must contain the inline tag `#flashcards/<lang>/vocab`** so the Spaced Repetition plugin discovers the cards.
- SRS cards (in the vault card format) for passed words — with pronunciation cue + source sentence.
- `vault/_meta/struggle_log.md` — append (B) errors and any word that failed to pass; bump *Last seen*; **update silently**.

## End-of-session message (exact shape, no more)
```
Logged: <session-path>
Batch: <N> words — passed <P>, recycling <R>
Into SRS: <P> cards (review in 1–3 days)
Watch: <1–2 weakest / interference-prone items>
Next move: <one line — e.g. "next 15-word band, or shadow these in a song-lesson">
```

## Tone
Brisk, explicit, pattern-based. Spell out L1↔target contrasts on false-friends (high-leverage when the learner has a related prior language). No conjugation dumps, no emojis, no transitional fluff. Favour correction over encouragement.

## Why these rules (one-line evidence map)
- 5/15/25 = session length, not the key lever — **spacing dominates set size** (Nakata 2015); keep review items in the pool (Kornell 2009).
- Isolation→sentence = involvement-load gradient (Hulstijn & Laufer); decontextualised-first is efficient (Webb; Elgort); keep (A) lean (Barcroft).
- Productive recall, attempt-before-model = testing + generation effects (Rowland; Bjork).
- Thematic-not-semantic batching = interference avoidance (Tinkham; Waring; Erten & Tekin; Nakata & Suzuki).
- Max 2 new/sentence = cognitive-load ceiling (Sweller).
- Don't-retire-after-one + ~3 spaced sessions + system-scheduled = successive relearning (Rawson & Dunlosky); self-scheduled spacing showed no benefit.
- Audio on cards = closes the print-to-speech listening gap.
