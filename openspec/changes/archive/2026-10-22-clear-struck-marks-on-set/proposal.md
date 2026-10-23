# Proposal

## Why

Setting value N in a cell clears pencil mark N from its row, column, and box, but leaves struck mark N behind. Once N is placed, a struck N in a peer says nothing new, so it is just clutter the player has to remove by hand. It also leaves the peer in a state the rest of the app has to work around: a struck mark for a digit a peer holds.

## What Changes

- Setting value N in a cell SHALL remove struck mark N, as well as pencil mark N, from every empty player cell in the same row, column, or box.
- This applies to values the player enters and to values set by auto-fill (bulk sets), since a bulk set clears marks "as a player-entered value does".
- Undo restores the struck marks along with everything else, as it already does for pencil marks.
- This reverses the "Setting a value keeps struck marks in related cells" rule from `add-struck-marks`.
- Unchanged:
  - struck marks for other digits
  - cells outside the row, column, and box
  - Fill pencil marks, which still keeps every struck mark
- Version bumps to the next minor version.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `board-editing`: setting a value, by the player or by auto-fill, clears that digit's struck marks from related cells. The rule that kept them is removed.

## Impact

- `src/util/board.js`: `boardWithRelatedMarksCleared` also clears the struck mark. Both player value sets and bulk sets go through it.
- Tests:
  - unit: the "keeps the strikes of related cells" test flips to expect clearing
  - e2e: "setting a value keeps struck marks in related cells" in `e2e/board-editing.spec.js` flips too, plus a new auto-fill case
- No change to rendering, the saved-game format, Help, or visual baselines.
- Some existing scenarios describe a struck mark on a digit a peer holds ("Struck mark for a digit a peer holds" under Fill pencil marks, and "A struck mark on a digit a peer holds can be removed"). A value set can no longer produce that state, but saves from earlier versions can still hold it, so those scenarios stay as they are.
