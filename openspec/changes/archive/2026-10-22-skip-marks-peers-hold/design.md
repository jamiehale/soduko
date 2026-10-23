# Design

## Context

- `boardWithToggledMark` and `boardWithToggledStrike` in `src/util/board.js` share one shape:
  - `allMarkableCellsHave(predicate, cellIndices, board)` checks the selected empty player cells
  - if they all have the mark, clear it from the selection; otherwise set it on the selection
  - both go through `boardWithCandidateCells(fn, cellIndices, board)`, which applies `fn` to the selected empty player cells
- `possibleMarks(cellIndex, board)` already returns the digits no peer holds as a value, given or player, conflicts included. Fill pencil marks uses it.
- The `toggleStrike` and `fillMarks` reducer actions return the same state when the board doesn't change; `toggleMark` always pushes history.
- `boardWithMarkSet`/`boardWithMarkCleared` are exported and used by unit-test helpers to seed marks, so they shouldn't gain the peer check.

## Goals / Non-Goals

**Goals:**
- One rule, in one place, for both kinds of mark.
- Reuse `possibleMarks` so "a peer holds N" means exactly what Fill pencil marks means.

**Non-Goals:**
- No change to `App.jsx`: the keystroke still dispatches, and the reducer makes it a no-op.
- No change to value sets, Fill pencil marks, or marks already on the board.

## Decisions

### 1. Filter the cells that can take the mark before deciding

A private helper `canTakeMark(mark, board)(cellIndex)` checks that the cell is an empty player cell and that `possibleMarks(cellIndex, board)` includes `mark`. Both toggles become one private function, `boardWithToggled(has, set, clear)`:
- `takers` = the selected cells that can take the mark
- if every taker satisfies `has(mark)` (true when there are no takers), apply `clear(mark)` to all selected empty player cells, so stale marks on skipped cells go too
- otherwise apply `set(mark)` to the takers only

`boardWithToggledMark = boardWithToggled(cellHasMark, setMark, clearMark)` and `boardWithToggledStrike = boardWithToggled(cellHasStrike, setStrike, clearStrike)`. `allMarkableCellsHave` is no longer needed.

*Alternative:* check peers inside `setMark`/`setStrike`. Rejected: cell helpers don't know the board, and the toggle decision has to ignore skipped cells anyway.

*Why clearing covers skipped cells:* a cell can hold a struck mark on a digit a peer later receives (struck marks survive value sets). If removal looked only at takers, the player could never clear it.

### 2. `toggleMark` becomes a no-op when nothing changes

Add the same `R.equals(board, state.board)` guard that `toggleStrike` uses. This also fixes today's empty undo step for a pencil-mark toggle on only given or filled cells.

### 3. Cost

`possibleMarks` scans the 81 cells for each selected cell, at most 81 × 81 checks per keystroke. That's fine at this size.

## Risks / Trade-offs

- [The player gets no sign that a keystroke was ignored] → The mark simply doesn't appear, which reads as "not possible". Feedback is out of scope.
- [A wrong player value now also blocks marks for that digit across its row, column, and box] → Same as Fill pencil marks; the conflict style or undo shows the real problem.
- [This changes the struck-mark requirement from `add-struck-marks`] → Archive `add-struck-marks` before this change, so the MODIFIED requirement exists in the main spec.

## Migration Plan

No data migration. Deploy is the normal push to `main`; rollback is reverting the commit.
