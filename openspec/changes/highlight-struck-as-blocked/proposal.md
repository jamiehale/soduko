# Proposal

## Why

When a cell holding N is selected, value highlighting shows where N can't go: the peer style covers the rows, columns, and boxes of every N, and every filled cell. A struck mark N says the same thing about its cell: the player has ruled N out there. Today such a cell outside those areas stays white, so it looks like an open spot for N. Showing it in the peer style makes the remaining spots for N stand out.

## What Changes

- While value highlighting shows a digit N, an empty cell with struck mark N SHALL be shown in the peer style, like a filled cell. Today it is left unhighlighted.
- This applies wherever value highlighting applies: a single selected cell holding N, and the typed-digit highlight if `add-digit-highlight` lands.
- Unchanged:
  - pencil mark N still makes a cell related (yellow)
  - struck marks for other digits have no effect
  - an empty or pencil-marked selected cell still gets no value highlighting
  - colors and the order of styles are the same

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `cell-selection`: in value highlighting, a cell with struck mark N is shown in the peer style instead of being left unhighlighted.

## Impact

- `src/Board.jsx`: `highlightLevel` treats struck mark N like a filled cell.
- Tests:
  - the e2e test "a struck mark for the value is not related" in `e2e/cell-selection.spec.js` now expects the peer style
  - the `struck-marks.png` visual baseline changes, since cell 71's struck 8 turns light blue
- The planned `add-digit-highlight` change has a "Struck marks are not related" scenario that says such a cell is not highlighted. It needs to say peer style instead.
- Version bumps to the next minor version.
