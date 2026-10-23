# Design

## Context

- `boardWithSetValue(value, cellIndex, board)` toggles the value, then calls `boardWithRelatedMarksCleared(value, cellIndex)`. That maps every empty player cell sharing a row, column, or box with the source cell through `clearMark(value)`.
- `boardWithSetValues` (bulk sets from auto-fill) reduces over `boardWithSetValue`, so both paths share that one function.
- `clearStrike(mark, cell)` in `src/util/cell.js` removes a struck mark and drops the `strikes` key when it empties. It leaves pencil marks alone.
- Toggling a value off also goes through `boardWithSetValue`, and it clears related marks today too. That only removes marks the earlier value set had already removed, since marks for a digit a peer holds can't be added. Struck marks follow the same path.

## Goals / Non-Goals

**Goals:**
- One-line change in the shared function, so player and auto-fill value sets stay identical.

**Non-Goals:**
- No change to Fill pencil marks, the toggles, or the saved-game format.
- No cleanup of struck marks that older saves already hold for digits a peer holds.

## Decisions

### 1. Clear both kinds of mark in `boardWithRelatedMarksCleared`

Map related empty player cells through `R.compose(clearStrike(mark), clearMark(mark))` instead of `clearMark(mark)`. A digit is never both a pencil mark and a struck mark in one cell, so the order doesn't matter. `clearStrike` drops an empty `strikes` key, so cleared cells are exactly `{ type: 'player', value: [...] }`, which keeps `R.equals`-based no-op checks working.

*Alternative:* a separate `boardWithRelatedStrikesCleared` composed into `boardWithSetValue`. Rejected: two walks over the board for one rule, and bulk sets would need the same composition.

## Risks / Trade-offs

- [A player who struck a digit on purpose loses that note when a peer gets the value] → The note is redundant once the value is placed. Undo brings it back.
- [Struck marks from older saves can still sit on a digit a peer holds] → Harmless. Highlighting already treats them as peers, and the toggle can still remove them.

## Migration Plan

No data migration. Deploy is the normal push to `main`; rollback is reverting the commit.
