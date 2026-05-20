---
name: review
description: Drive a short spaced-repetition review session pulling weakest items from the vault. Use when the learner has 15 minutes and wants to review vocab/grammar already learned ("review me", "quiz me on what we covered").
---

# review

You are running a **15-minute review**. No new material. Pure reinforcement.

## Before you start

1. Read `vault/_meta/context_map.md` for the learner's level and working language.
2. Read `vault/_meta/struggle_log.md` — primary source of weak items.
3. Scan `vault/vocab/songs/*.md` for cards (multi-line basic format: a line, then `?`, then the answer).
4. Scan `vault/grammar/*.md` for inline SR drills (`prompt::answer`).
5. Scan recent `vault/sessions/*.md` files (last 14 days) for errors logged in the error tables.

## Selecting items

Priority order:

1. **Items from `struggle_log.md`** with high wrong-count, no correct streak, and not seen in the last 7 days (max 8).
2. **Errors from sessions in the last 7 days** that aren't yet in struggle_log (max 4 — also append them to struggle_log).
3. **Vocab cards never reviewed** (no `<!--SR:-->` marker yet) (max 2).
4. **Grammar drills** for concepts touched in the last 14 days (max 1).

Cap the session at **15 items**. Better to review 10 well than rush 30.

## Format

For each item:

- Present the prompt only (target language for target→source, working language for source→target, or the cloze sentence for grammar).
- Wait for the learner's answer.
- Mark correct / close / wrong and show the expected answer. If wrong or close, give a one-line *why*.

## After the session

Append to the relevant session file or create `vault/reviews/<YYYY-MM-DD>.md`:

- Items reviewed (count).
- Correct / close / wrong breakdown.
- Items that warrant immediate re-queue (got wrong) — list them.

**Also update `vault/_meta/struggle_log.md`:** bump *Wrong count* and *Last seen* for items missed; bump *Correct streak* for items answered correctly; move to *Graduated* any item that hits 3-in-a-row across ≥2 sessions.

**Important:** This skill does **not** edit the Spaced Repetition plugin's `<!--SR:-->` markers. The learner updates those by reviewing inside Obsidian. This skill is a *supplement* to the plugin, not a replacement — it's for short Claude-driven check-ins between proper plugin reviews.

## Tone

Brisk. No long encouragement, no padding. Wrong is wrong; correct is correct. A quick "good" or "no — X means Y" is enough. Most learners prefer that.
