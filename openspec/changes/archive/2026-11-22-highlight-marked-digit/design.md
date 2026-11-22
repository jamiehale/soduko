# Design

## Context

- `highlightDigit` lives in the selection state (`src/hooks/selection.js`). Today only a digit typed with nothing selected sets it, through the toggling `highlightDigit` action. `mouseDown` and `mouseUp` both build a fresh state, so either one drops it. `clearSelection` and `clearHighlightDigit` remove it.
- `useHighlight(selectedCells, board, highlightDigit)` uses the digit only when the selection is empty; otherwise the value comes from a single selected cell holding a value. Any value projects the areas of every cell holding it; no value falls back to the selection's shared areas.
- `Board.jsx`'s `highlightLevel` already gives selected cells the selected style whatever the highlight value, so nothing changes in rendering.
- Mark and strike keys go through `handleKeyDown` in `App.jsx`, which calls `toggleCellMark`/`toggleCellStrike`.

## Goals / Non-Goals

**Goals:**
- One digit highlight for both sources (typed with no selection, and toggled marks), so rendering and the "follows the board" rule need no new code.

**Non-Goals:**
- Fill pencil marks, undo, and redo don't set or clear the digit highlight.
- No change to `Board.jsx`, the theme, or the saved game.

## Decisions

**Reuse `highlightDigit` for marked digits.** Add a selection action, `markDigit`, that sets `highlightDigit` to N without the toggle-off rule. A second field (say `markedDigit`) was the alternative, but the two never need to coexist: `mouseDown` clears both cases, and a marked digit only exists with a selection. One field keeps `useHighlight` to one rule.

**`useHighlight` prefers the digit whenever it is set.** `highlightValue = highlightDigit ?? singleValue(selectedCells, board)`. The reducer is now what guarantees the digit only exists when it should, so the old "ignore the digit when cells are selected" branch goes. Projected areas then replace the selection's shared areas, as the spec asks, with no extra code.

**`mouseUp` keeps `highlightDigit`.** So a mark typed mid-drag still shows after release. `mouseDown` still drops it, so a new press clears any digit highlight. A digit typed with no selection can't survive to a `mouseUp` because the `mouseDown` before it cleared it.

**`App.jsx` wiring.** After `toggleCellMark` or `toggleCellStrike`, dispatch `markDigit(N)`. After `setCellValue` on the single selected cell, dispatch `clearHighlightDigit`, so the cell's own value (or none) takes over. A Shift+digit on a single cell holding a value still sets the digit highlight even though the board doesn't change: one rule for every mark key is simpler to explain and test.

## Risks / Trade-offs

- [Holding the mouse on the one already-selected cell, typing a mark, and releasing deselects the cell (existing behavior), leaving the digit highlight with no selection] → It then behaves like a digit typed with no selection, which is a sensible state. Not worth special-casing.
- [The single-value highlight of a selected cell is replaced by a struck digit on that cell] → Intended; covered by the "Struck mark on a cell holding a value" scenario.
- [Visual baselines] → The visual tests seed marks rather than typing them, so only the Help dialog baseline changes, for its longer text.
