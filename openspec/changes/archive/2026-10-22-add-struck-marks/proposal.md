# Proposal

## Why

Many solving techniques (pointing pairs, box/line reduction, and so on) don't place a value; they rule a digit out of other cells. Today the player can only show that by removing a pencil mark, which looks the same as a mark that was never there and is undone by the next Fill pencil marks click. A visible "not this digit" mark lets the player record the deduction and keep it.

## What Changes

- New term: a **struck mark** is a digit the player has ruled out for an empty player cell. It shows in the digit's pencil-mark position, in the pencil-mark color, with a red line through it.
- **Shift + digit** toggles that digit's struck mark on the selected empty player cells. It works the same way as pencil marks across a selection: one cell, a drag selection, or while the mouse is still held. If every selected empty player cell already has that struck mark, it is removed from all of them; otherwise it is added to all of them. Given cells and cells holding a value are skipped. The physical digit keys are used, so it works on any keyboard layout.
- In one cell, a digit is either a pencil mark, a struck mark, or neither:
  - adding struck mark N replaces pencil mark N
  - adding pencil mark N (plain digit) replaces struck mark N
  - setting a value replaces all of the cell's pencil marks and struck marks
- Toggling struck marks is one undo step, cancels a pending auto-fill cascade, and never starts one. A toggle that changes no cell adds no undo step.
- **Value highlighting:** a cell with struck mark N is not shown in the related style when the selected cell holds N.
- **Auto-fill box singles:** a struck mark does not count as a pencil mark. A cell with pencil mark N is still a box single when another cell in its box has struck mark N.
- **Fill pencil marks:** a cell's struck marks stay as they are, and those digits are not added as pencil marks. The cell's other digits are filled as usual.
- Struck marks are saved with the game and survive reload, undo, and redo. Reset clears them. Games saved by earlier releases load unchanged (they have no struck marks).
- The Help dialog explains Shift + digit. Version bumps to 0.7.0.

Out of scope: clearing struck marks when a peer is given that digit as a value (they stay until the cell gets a value, is reset, or the player toggles them off), any automatic detection of pointing pairs or other techniques, a separate button or mode for struck marks, and touch input.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
- `board-editing`: adds toggling struck marks across a selection, how they interact with pencil marks and values, and their effect on auto-fill box singles and Fill pencil marks.
- `cell-selection`: value highlighting skips cells whose mark for the value is a struck mark.
- `board-appearance`: how a struck mark is drawn, and a new visual baseline for it.
- `game-persistence`: struck marks are saved and reloaded.
- `app-help`: the Help dialog explains Shift + digit.

## Impact

- Cell model (`src/util/cell.js`): an empty player cell gains an optional list of struck marks. Saves without it stay valid, so `migrateSavedGame` doesn't change.
- `src/util/board.js`: a toggle transform for struck marks; the pencil-mark toggle, value set, and `boardWithFilledMarks` respect them.
- `src/hooks/board.js`: a new reducer action and action-creator helper.
- `App.jsx`: Shift + digit in the `keydown` handler.
- `MarkedCell.jsx`, `Cell.jsx`, `src/theme.js`: the struck-out rendering and its red.
- `HelpDialog.jsx`, `package.json` (0.7.0), and the CLAUDE.md glossary.
- Tests: unit tests for the cell and board functions and the reducer action; e2e scenarios in `board-editing`, `cell-selection`, `game-persistence`, and `app-help` specs; `e2e/helpers.js` learns to read and seed struck marks; one new visual baseline, and `help.png` changes for the new sentence.
