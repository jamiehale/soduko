# Proposal

## Why

A pencil mark or struck mark for a digit that a cell's row, column, or box already holds is pointless: that digit can't go there. Today the app adds it anyway, so a slip of the finger (or a drag across a row that crosses a peer of that value) leaves noise the player then has to clean up by hand.

## What Changes

- When the player adds pencil mark N or struck mark N, a cell is **skipped** if any cell in its row, column, or box holds the value N (given or player, including a value in a conflict).
- This applies to one cell and to a selection:
  - one cell where N is held by a peer: the keystroke is ignored
  - a selection: only the cells where N is held by a peer are skipped; the others get the mark as usual
- The toggle decision ("every cell already has it, so remove it") only looks at the cells that could take the mark. Removing a mark is never blocked: if that decision removes N, it is removed from every selected empty cell that has it, including skipped cells.
- A keystroke that changes no cell adds no undo step. This is new for pencil marks: today a pencil-mark toggle that changes nothing still adds an undo step. Struck marks already behave this way.
- Unchanged:
  - setting a value (it may still conflict, which shows in the conflict style)
  - Fill pencil marks (it already adds only possible digits)
  - existing marks: a struck mark on a digit a peer later receives stays, as before
- Version bumps to the next minor version.

Out of scope: any feedback that a keystroke was ignored (sound, flash, message), and blocking a value that conflicts.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `board-editing`: the pencil-mark and struck-mark toggles skip cells where a peer holds the digit, and neither adds an undo step when nothing changes.

## Impact

- `src/util/board.js`: the shared "candidate cell" test behind both toggles also checks that no peer holds the digit when adding.
- `src/hooks/board.js`: `toggleMark` returns the same state when the board doesn't change, as `toggleStrike` and `fillMarks` already do.
- No change to `App.jsx`, rendering, the saved-game format, or Help (it doesn't describe edge cases).
- Tests: unit tests for the board transforms and the reducer; e2e scenarios in `e2e/board-editing.spec.js`. No visual change.
- The `add-struck-marks` change (merged in PR #26) must be archived first, because this change's delta modifies its struck-mark requirement.
