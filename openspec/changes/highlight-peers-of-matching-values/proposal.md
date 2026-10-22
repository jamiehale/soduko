# Proposal

## Why

Selecting a cell that holds a value shows the blue peer highlight (row, column, and 3×3 section) for that one cell only. Every other cell holding the same value is shown in the selected style, but without its peers. The question a player is usually asking is "where can this digit still go?", and the answer is the cells outside the peers of *every* cell holding that digit. Today the player has to work that out by eye.

## What Changes

- When exactly one cell is selected and it holds a value N, the row, column, and section of **every** cell holding N are shown in the peer style, not just those of the selected cell. The white cells left over are exactly where N can still be placed.
- Pencil-mark highlighting follows the existing precedence. A cell with mark N that falls inside any of those peer areas is shown as a peer, not as related. Only marks N outside every peer area stay yellow.
- Unchanged:
  - multi-cell selections, which still highlight only the row, column, or section all selected cells share
  - an empty or pencil-marked selected cell
  - error precedence
  - every color
- The single-selection visual baseline changes intentionally and is regenerated.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `cell-selection`: the "Value highlighting" requirement extends peer highlighting to every cell holding the selected value.

## Impact

- `src/hooks/highlight.js`: the highlight result describes sets of rows, columns, and sections instead of a single one of each.
- `src/Board.jsx`: the peer test uses those sets.
- Tests:
  - unit tests in `src/hooks/__tests__/highlight.test.js`
  - e2e tests in `e2e/cell-selection.spec.js`, where one existing assertion changes: a cell that shares a column with the other 7 becomes a peer
  - the visual baseline `single-selection.png`
- No change to saved-game data or any other capability.
