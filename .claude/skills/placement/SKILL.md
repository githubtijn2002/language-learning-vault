---
name: placement
description: Run a 60-minute placement test for the learner's target language. Adapts to the level system declared in vault/_meta/context_map.md (CEFR / JLPT / HSK / TOPIK / ACTFL). Use when the user asks for a placement test, a level check, or "let's do the placement test".
---

# placement

You are running a **60-minute baseline placement test**. Read `vault/_meta/context_map.md` first — specifically the `level_system`, `target_language`, `target_variant`, and `working_language` frontmatter fields. The rubric below adapts to whichever level system is declared.

## Before you start

1. Read `vault/_meta/context_map.md` to know the learner's current self-assessed level, target language, target variant, and which level system to use.
2. Read `vault/_meta/struggle_log.md` if it exists — gives a head start on what to probe.
3. Create today's session file if missing: `vault/sessions/<YYYY-MM-DD>_placement.md` with frontmatter (date, type, duration).
4. Tell the learner the test will take ~60 minutes, comes in 5 sections, and produces an honest band assessment + 3 prioritised weaknesses.

## Running the test

Go through the 5 sections in this order:

1. **Listening (10 min)** — Pick 3 clips of increasing difficulty in the target variant (any free source: YouTube, podcasts, news radio). Write the URL + 2–3 short comprehension questions into the session file **before** the learner watches. They answer in the working language (English by default). Score on comprehension, not transcription.

2. **Reading (8 min)** — Pick two passages of increasing difficulty (a short news headline, a paragraph from a blog or magazine in the variant). Paste them into the session file. The learner reads, answers comprehension questions in the working language. No dictionary.

3. **Grammar (5 min)** — 10 cloze items, mixed across the level system's bands. Score 1 point each. Items marked *stretch* are one band above your initial guess — getting them right boosts the band, getting them wrong doesn't penalise. Author them live based on the target language's high-frequency grammar (conjugations, agreement, prepositions, particles — whatever is structurally weighty in the target language).

4. **Vocabulary (5 min)** — 10 source→target + 5 target→source. Pull from common A1–B1 frequency lists (or the level-system equivalent). Mix in 2–3 variant-specific items (e.g. for Mexican Spanish: *chido*, *órale*; for Tokyo Japanese: 〜ちゃう, ぜんぜん; for Mandarin: 还行, 挺好). Accept reasonable synonyms.

5. **Production (10 min)** — The learner writes 6–8 sentences in the target language on a prompt (e.g. "describe your weekday morning", "what you're looking forward to about <motivation>"). Score on: range (variety of structures), accuracy (grammar / agreement / particles / case where applicable), fluency (does it read as a whole), variant register awareness.

## Scoring

Fill a scoring table at the bottom of the session file. Weighting:

- Listening 30%
- Reading 15%
- Grammar 15%
- Vocab 15%
- Production 25%

### Per-system bands

Choose the rubric matching `level_system` in `context_map.md`:

**CEFR (Spanish, French, German, Portuguese, Italian, Dutch, …)**

- **A1**: catches single words, isolated phrases, present tense only.
- **A2**: catches main idea of slow concrete speech, describes daily life in simple sentences.
- **B1**: follows clear standard speech on familiar topics, narrates past events, recognises some idioms.
- **B2**: follows extended speech on abstract topics, expresses opinions with nuance, uses subjunctive / equivalent advanced grammar correctly in common contexts.

**JLPT (Japanese)**

- **N5**: catches basic phrases, hiragana/katakana fluent, ~100 kanji, present + past plain.
- **N4**: ~300 kanji, particles solid (は・が・を・に・で・と・も), て-form chains, narrates simple events.
- **N3**: ~650 kanji, conditionals (〜たら / 〜ば / 〜と), passive / causative, follows everyday conversation.
- **N2**: ~1000 kanji, keigo basics, follows news / business speech, handles 〜ところ・〜ばかり / aspectual nuance.

**HSK (Mandarin)**

- **HSK 1–2**: 150–300 chars, present tense, basic measure words, single-clause sentences.
- **HSK 3**: 600 chars, 了 / 过 / 着 aspectual usage, comparative 比 structures.
- **HSK 4**: 1200 chars, 把 / 被 constructions, follows everyday conversation on familiar topics.
- **HSK 5**: 2500 chars, idioms (成语) starting to land, follows news in familiar domains.

**TOPIK (Korean)**

- **TOPIK 1 (levels 1–2)**: hangul fluent, 800 words, present / past, polite forms.
- **TOPIK 2 (levels 3–4)**: 2000 words, honorifics, connectors (〜고 / 〜지만 / 〜아서), follows everyday conversation.
- **TOPIK 3 (levels 5–6)**: 4000+ words, abstract topics, news comprehension, formal writing.

**ACTFL (US framework — any language)**

- **Novice (L/M/H)**: memorised phrases, lists, fragments.
- **Intermediate (L/M/H)**: creates with language, asks/answers simple questions, narrates / describes simple topics.
- **Advanced (L/M/H)**: paragraph-length discourse, narration in past/present/future, handles complications.
- **Superior**: extended discourse on abstract topics, supports opinions, hypothesises.

Mark the overall placement as a single band plus a half-step modifier (e.g. CEFR "A2−" or "B1+", JLPT "N4 stretch toward N3").

Append a one-line summary to `vault/progress/<level_system>_<YYYY-MM>.md` (create if needed) with the overall band and per-section bands.

## Output

End with:

- **Overall band** (e.g. "A2−" / "N4" / "HSK 2 stretch") and a one-paragraph honest read.
- **Top 3 specific weaknesses** to prioritise in the next 4 weeks. Be concrete (e.g. "preterite/imperfect contrast in Spanish", "particle drop in Japanese embedded clauses", "tone sandhi on 一 / 不 in Mandarin").
- **Next placement re-test date** — 8 weeks from today.
- Append the top 3 weaknesses to `vault/_meta/struggle_log.md` (under the relevant section) so the `song-lesson` and `review` skills start biasing toward them immediately.
