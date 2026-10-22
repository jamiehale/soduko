# Proposal

## Why

Filling in pencil marks by hand is slow, repetitive bookkeeping: for each empty cell, the player checks its row, column, and box and marks every digit that isn't there yet. The helper can do this in one click, so the player can start from complete pencil marks and spend their time on the solving.

## What Changes

- A new icon button, **Fill pencil marks**, in the control row below the board. It uses MUI's `EditNote` icon (a pencil over lines) and has the tooltip and accessible name "Fill pencil marks".
- Clicking it gives every empty player cell (a player cell with no value) the pencil marks of every digit 1–9 that no cell in its row, column, or box holds as a value. Given cells and cells with player values are untouched.
- The new marks replace any pencil marks the cell already had, including marks the player added or removed by hand.
- If every digit is already in the cell's row, column, or box (only possible when the board has a conflict or a wrong player value), the cell is left with no pencil marks.
- Values that are part of a conflict count like any other value. The button works on a board with a conflict.
- All the new marks are one undo step. Undo restores every cell's previous marks; redo reapplies them.
- If the click would change nothing (every empty cell already has exactly those marks, or there are no empty cells), the board doesn't change and no undo step is added.
- The click is a player board change, so it cancels a pending auto-fill cascade. It does not start one, even if the new marks leave box singles: like a mark toggle, it never triggers auto-fill. The player's next value set scans as usual.
- The Help dialog gets one sentence describing the button.
- Version bumps to 0.6.0.

Out of scope: a keyboard shortcut, filling marks for only the selected cells, and removing marks by other solving techniques (pairs, pointing, and so on).

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `board-editing`: adds requirements for the Fill pencil marks button: which cells it fills, how marks are computed, overwriting existing marks, conflicts, one undo step, and its effect on auto-fill.
- `app-help`: the Help dialog also explains the Fill pencil marks button.

## Impact

- `src/util/board.js`: a pure function that computes a cell's possible digits from its row, column, and box, and one that returns the board with every empty player cell's marks replaced.
- `src/hooks/board.js`: a new reducer action (one history entry, no-op when unchanged) and its action-creator helper.
- `App.jsx`: the new icon button in the control row, and its handler that cancels auto-fill and dispatches.
- `HelpDialog.jsx`: one new sentence.
- `package.json`: version 0.6.0.
- Saved-game format is unchanged; the result is an ordinary history entry.
- Visual baselines: every screenshot is of the whole page, so all of them change for the new button and are regenerated.
- Tests:
  - unit tests for the new board functions and reducer action
  - e2e scenarios in `e2e/board-editing.spec.js` and a Help text check in `e2e/app-help.spec.js`
