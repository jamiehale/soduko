# Proposal

## Why

The board's keyboard handler listens on `window` and runs whether or not a dialog is open. Typing a custom puzzle in the New Game dialog highlights each typed digit on the board behind it. Worse, if a cell was selected before the dialog opened, each digit typed sets that cell's value (or toggles pencil marks across a multi-cell selection) and adds undo steps. The board behind a dialog should stay as it was.

## What Changes

- Add a **paused** state to the game. While the game is paused, it ignores keyboard input: digits, Shift plus a digit, and Escape do nothing to the board, the selection, or the digit highlight. This applies whether or not the game is solved.
- The game is paused while any dialog is open (New Game, Reset confirmation, Help). Dialogs can then use normal form controls without the board reacting.
- Escape closes the dialog and leaves the selection alone. MUI's dialog already stops Escape from reaching the board; a test now guards that.
- When the last reason to pause goes away, keyboard input works as before.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cell-selection`: while the game is paused, typing a digit or pressing Escape does not change the selection or the digit highlight.
- `board-editing`: while the game is paused, typing a digit or Shift plus a digit does not change the board.

## Impact

- `src/App.jsx`: computes `isPaused` from the dialog state; the `keydown` handler returns early while the game is paused.
- `CLAUDE.md`: new glossary entry for **paused**.
- `e2e/cell-selection.spec.js`, `e2e/board-editing.spec.js`: new tests that type into an open dialog and check the board, selection, and highlight are unchanged.
- No change to the saved-game format; the paused state is not saved.
