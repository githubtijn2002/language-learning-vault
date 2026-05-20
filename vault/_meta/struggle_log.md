---
maintained_by: [song-lesson, review, placement]
last_updated: 2026-05-20
tags: [meta, struggle-log]
---

# Struggle log

**Single source of truth for what the learner has historically gotten wrong.** Auto-updated by the `song-lesson` skill (after phase f), the `review` skill, and the `placement` skill. Edit by hand to add things sessions wouldn't catch (e.g. words you noticed you stumbled on in a real conversation).

## How the skills use this

- **`song-lesson` phase (c) line selection** biases toward lines that test items below.
- **`song-lesson` phase (h2) dialogue topic** pulls 3–5 items from below (not seen in last 7 days) into the conversation prompt — so old weak items get reactivated through real speech.
- **`review` skill** prioritises items here over generic SRS cards.

## When to "graduate" an item

Move to the *Graduated* section when an item has been answered correctly **3 times in a row across at least 2 different sessions** with no recent error.

---

> **Note on this example data.** The rows below are illustrative for Maya. Delete them and start fresh when you make the vault your own. The columns are load-bearing — the skills read them — but the entries themselves are not.

## Vocab gaps

| Word / phrase | English | First seen | Last seen | Wrong | Streak | Status |
|---|---|---|---|---|---|---|
| ahorita | "right now" (in Mexican Spanish — vague: can mean "in a bit" or "in an hour") | 2026-05-18 | 2026-05-18 | 1 | 0 | new — high-frequency, culturally loaded |
| chido | cool, awesome (Mexican) | 2026-05-18 | 2026-05-18 | 1 | 0 | new — variant lexicon |
| güey / wey | dude / man (very Mexican, casual) | 2026-05-18 | 2026-05-18 | 1 | 0 | new — register-sensitive, avoid with leadership |
| pedo (slang) | "problem / issue / fuss" (vulgar but common in CDMX) | 2026-05-18 | 2026-05-18 | 0 | 0 | seen-but-fragile — only with close peers |
| ¿mande? | "pardon? / sorry?" (Mexican alternative to ¿qué?) | 2026-05-18 | 2026-05-18 | 1 | 0 | new — formal-ish, common with elders |

## Grammar weak points

| Concept | First seen | Last seen | Wrong | Streak | Status |
|---|---|---|---|---|---|
| Preterite vs. imperfect distinction | 2026-05-13 | 2026-05-18 | 2 | 0 | **A2 priority** — chooses preterite where habitual past is meant |
| *Gustar*-type verbs (backwards subject + IO pronoun) | 2026-05-13 | 2026-05-18 | 3 | 0 | **High priority** — produces *yo gusto X* instead of *me gusta X* |
| Ser vs. estar (origin vs. location vs. temporary state) | 2026-05-13 | 2026-05-18 | 2 | 1 | new — A1 gap surfaced |
| Personal *a* before human direct objects | 2026-05-18 | 2026-05-18 | 1 | 0 | new — omitted in *vi mi jefe* (should be *vi a mi jefe*) |
| Subjunctive triggers (*querer que*, *si* clauses, indefinite antecedents) | 2026-05-13 | 2026-05-13 | 1 | 0 | **B1 stretch** — defer until A2 grammar lands |

## Register / colloquial gaps (variant-specific)

| Item | Notes | Status |
|---|---|---|
| usted at work | Mexican workplace defaults to *usted* with leadership + clients; *tú* with peers after onboarding | reference |
| chilango | CDMX-native (sometimes pejorative outside CDMX, neutral inside) | reference |
| órale | "wow / okay / go on" — versatile Mexican filler | new |
| sale | "okay, deal, sounds good" (Mexican; cf. *vale* in Spain) | new |

## Recurring patterns (meta)

| Pattern | Examples seen | Status |
|---|---|---|
| **English→Spanish word order in questions** | *¿Dónde tú vives?* (should be *¿Dónde vives?*) — over-supplying pronouns | active |
| **Gender agreement on adjectives** | *la problema* (should be *el problema*), *el moto* (should be *la moto*) | active — false-friend genders |

## Graduated (out of active rotation)

| Item | Type | Graduated on | Notes |
|---|---|---|---|

---

## Bootstrap notes

The first ~15 entries here come from the initial CEFR placement. As Maya runs song-lessons and reviews, the log grows. For the **next 4 weeks**, phase (c) of `song-lesson` should bias hard toward the three top-priority items:

1. **Preterite vs. imperfect** — lines from the song that contain past-tense narration.
2. ***Gustar*-type verbs** — lines using *me gusta / me encanta / me molesta* type constructions.
3. **Variant lexicon defense** — lines that include Mexican-specific words where a Spain-ism or generic-LatAm word would feel off.

Phase (h2) reinforcement-conversation prompt should pull from this log liberally to drive real speech around the weak points.
