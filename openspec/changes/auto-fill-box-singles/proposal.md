# Proposal

## Why

When the player sets a value, the app clears that digit's pencil marks from the cell's row, column, and box. That often leaves a box where only one cell still has a pencil mark for some digit, so the digit must go there. The player then has to spot it and enter it by hand, and each such entry can create more. The helper can do this bookkeeping for them.

## What Changes

- After the player sets a value in a cell (not toggles it off), the app waits 500ms, then scans the whole board for **box singles**: a digit that appears as a pencil mark in exactly one cell of a box, where that box doesn't already hold the digit as a value.
- It sets every box single found in one **bulk set**, as if the player had entered each value: each value clears that digit's marks from its row, column, and box.
- A bulk set is a single undo step. Undo restores each auto-filled cell's pencil marks and every mark the bulk set cleared.
- The scan repeats 500ms after each bulk set, and the cascade continues until a scan finds no box singles.
- Wrong pencil marks can make a bulk set create a conflict. The bulk set still applies and the conflict shows in the existing error style. The cascade stops when the board has a conflict, and it never starts from a board that already has one. The player can undo the bulk set and then their own steps.
- If one cell is the only mark for two digits in its box, it gets the lower digit.
- Any board change by the player (setting a value, toggling marks, undo, redo, reset, new game) cancels a pending cascade. A new value set starts a fresh one. Changing the selection does not cancel it.
- Mark toggles, undo, and redo never start a cascade. A reload doesn't resume one.
- The Help dialog gains a sentence explaining the auto-fill. The help visual baseline changes intentionally and is regenerated.
- Version bumps to 0.5.0.

Out of scope: a setting to turn auto-fill off, and other solving techniques such as a cell with only one pencil mark (naked single), or row and column singles.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `board-editing`: adds requirements for auto-filling box singles after a value set, cascading bulk sets with their timing, one undo step per bulk set, stopping on a conflict, and cancelling on player changes.
- `app-help`: the Help dialog also explains auto-fill.

## Impact

- `src/util/board.js`: new pure functions to find box singles and to set several values at once.
- `src/hooks/board.js`: a new reducer action for a bulk set (one history entry) and its action-creator helper.
- A new hook in `src/hooks/` that runs the timed cascade. `App.jsx` starts it after a value set and cancels it on every other board change.
- `src/HelpDialog.jsx`: one new sentence. `package.json`: version 0.5.0.
- Saved-game format is unchanged; a bulk set is an ordinary history entry.
- Tests:
  - unit tests for the new board functions and reducer action
  - e2e scenarios in `e2e/board-editing.spec.js` using Playwright's clock
  - an `e2e/app-help.spec.js` check for the new sentence
  - a regenerated `help.png` baseline
