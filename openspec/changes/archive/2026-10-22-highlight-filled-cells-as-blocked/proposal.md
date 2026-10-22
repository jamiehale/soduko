# Proposal

## Why

Selecting a cell that holds N now projects the peer highlight from every cell holding N (`highlight-peers-of-matching-values`). The white cells left over are meant to be the places N can still go. But a filled cell outside those areas also stays white, though N can't go there either, because it already holds a value. The player still has to skip those by eye.

## What Changes

- When exactly one cell is selected and it holds a value N, every cell that holds a value (a clue or an entered value) is shown in the peer style, unless it holds N, in which case it stays in the selected style. The white cells left are exactly the empty cells where N could still go.
- Unchanged:
  - cells holding N stay in the selected style
  - an empty cell with pencil mark N outside every projected area stays in the related (yellow) style
  - selecting an empty or pencil-marked cell, and multi-cell selections, don't mark filled cells
  - error precedence
  - every color
- The single-selection visual baseline changes intentionally and is regenerated.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `cell-selection`: the "Value highlighting" requirement also shows every filled cell in the peer style when a value is selected.

## Impact

- `src/Board.jsx`: `highlightLevel` gains one rule. `useHighlight`'s output is unchanged.
- Tests:
  - new e2e scenarios in `e2e/cell-selection.spec.js`, plus a check of the existing "Remaining placements stay unhighlighted" scenario
  - the visual baseline `single-selection.png`
- Builds on `highlight-peers-of-matching-values` (merged in PR #20 and archived).
