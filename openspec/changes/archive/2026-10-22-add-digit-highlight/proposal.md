# Proposal

## Why

To see where a digit already sits and where it can still go, the player has to find a cell holding that digit and click it. If no cell holds it yet, there is no way to see it at all. Typing a digit with nothing selected does nothing today, so that key is free to show the same value highlighting directly.

## What Changes

- With no cell selected, typing a digit N SHALL highlight N exactly as if the player had selected a single cell holding N:
  - every cell holding N in the selected style
  - the row, column, and box of each of those cells, and every other filled cell, in the peer style
  - empty cells elsewhere with pencil mark N in the related style, and cells with struck mark N in the peer style
- If no cell holds N, there are no rows, columns, or boxes to highlight. Filled cells still show in the peer style and pencil marks N in the related style.
- The digit highlight stays until:
  - the player presses Escape
  - the player types the same digit again
  - the player clicks or drags to select cells, which then show their usual highlighting
  - Reset or New Game
- Typing a different digit switches the highlight to that digit.
- The highlight follows the board: a value set, undo, or auto-fill while it is shown updates what's highlighted.
- Typing with a selection works as before (set a value or toggle pencil marks). Shift + digit with no selection still does nothing.
- The digit highlight never changes the board and adds no undo step. It is not saved, so a reload starts without it.
- The Help dialog gets one sentence about it. Version bumps to the next minor version.

Out of scope: a visible indicator of which digit is highlighted (beyond the cells themselves), digit buttons for mouse or touch input, and highlighting more than one digit at once.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `cell-selection`: adds the digit highlight (how it starts, what it shows, what ends it), and Escape also clears it.
- `app-help`: the Help dialog explains typing a digit with nothing selected.

## Impact

- `src/hooks/selection.js`: selection state gains the highlighted digit. A digit action sets or toggles it, and mouse down and clear selection clear it.
- `src/hooks/highlight.js`: uses the highlighted digit as the highlight value when nothing is selected.
- `App.jsx`: a digit with no selection dispatches to the selection state. Reset and New Game clear it.
- `HelpDialog.jsx` and `package.json`: one new sentence and the version bump.
- Saved-game format is unchanged.
- Tests:
  - unit tests for the selection reducer and `useHighlight`
  - e2e scenarios in `e2e/cell-selection.spec.js` and a Help check in `e2e/app-help.spec.js`
  - one new visual baseline; `help.png` changes for the new sentence
