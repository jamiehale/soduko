# Proposal

## Why

Today a value set starts a scan of the whole board, so auto-set can place values anywhere: in boxes the player wasn't looking at, from singles that were already there, and in a cascade that spreads across the puzzle. The player wants auto-set to stay local and only finish off the box they are working in.

## What Changes

- The **trigger box** is the box holding the cell whose value the player just set.
- Every auto-set scan looks only at the trigger box. That includes the first scan 500ms after the value set, and every later round of the cascade.
- A box single anywhere else is never auto-set, even if the player's value set is what created it (for example by clearing a mark in the same row or column).
- Within the trigger box nothing else changes:
  - a digit pencil-marked in exactly one empty cell, with no cell of the box holding it, is set
  - struck marks don't count
  - a cell single for two digits takes the lower one
  - several singles in the box are set together in one bulk set
  - each round is one undo step
  - the cascade ends when a round finds nothing in the trigger box
- Unchanged:
  - only a player value set starts a scan; toggling a value off, toggling marks, Fill pencil marks, undo, and redo don't
  - conflicts stop the cascade
  - any player board change cancels it
  - a new value set starts a new cascade with its own trigger box
- Version bumps to the next minor version.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `board-editing`: auto-set scans only the trigger box, in the first round and in every round of the cascade. The scenarios that relied on singles in other boxes are rewritten.

## Impact

- `src/util/board.js`: `nextBulkSet` takes the trigger box and returns only that box's singles.
- `src/hooks/auto-set.js`: `start(cellIndex)` remembers the trigger box for the whole cascade.
- `App.jsx`: passes the set cell's index to `startAutoSet`.
- Tests:
  - unit tests for `nextBulkSet` with a box
  - most existing auto-set e2e tests in `e2e/board-editing.spec.js` need new seeds, because they place singles outside the box of the cell they set; their intent stays the same
  - new e2e cases show that singles outside the trigger box are left alone
- No change to rendering, Help, the saved-game format, or visual baselines.
- CLAUDE.md glossary: a new "trigger box" row, and the "auto-set" and "cascade" rows mention it.
