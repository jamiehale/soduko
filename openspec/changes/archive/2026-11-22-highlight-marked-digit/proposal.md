# Proposal

## Why

Selecting a cell that holds a value, or setting a value, shows the value highlighting for that digit: matching values, their rows, columns, and boxes, and related cells. Toggling a pencil mark or struck mark shows none of that, so the player can't see where the digit they are marking already sits or which other cells are marked with it.

## What Changes

- Toggling pencil mark N or struck mark N on the selection (adding or removing, on one cell or many, during a drag or after) gives a digit highlight of N: the same value highlighting as a selected cell holding N.
- While that digit highlight shows, the peer areas are the rows, columns, and boxes of every cell holding N, not the selection's shared row, column, or box. Selected cells keep the selected style.
- The digit highlight lasts until the next mouse press on a cell, Escape, Reset, or New Game. Toggling another digit switches it. Setting or clearing a value on the single selected cell drops it, so the cell's own value (if any) takes over.
- The highlight survives the mouse release that ends the drag it was typed in.
- The Help dialog says that toggling marks highlights the digit.
- Version goes to 0.13.0.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cell-selection`: value highlighting also comes from a digit highlight set by toggling marks, with a selection present; the digit highlight's start and end rules cover marks.
- `app-help`: the Help dialog explains that toggling marks highlights the digit.

## Impact

- `src/hooks/selection.js`: new action to set the digit highlight without toggling; `mouseUp` keeps it.
- `src/hooks/highlight.js`: the digit highlight applies with a selection too.
- `src/App.jsx`: mark and strike keys set the digit highlight; a value set clears it.
- `src/HelpDialog.jsx`, `package.json` version.
- Unit tests for the selection reducer and `useHighlight`; e2e tests in `e2e/cell-selection.spec.js` and `e2e/app-help.spec.js`. The Help dialog visual baseline changes for the longer text; no other baseline changes, and no saved-game format change (the digit highlight is never saved).
