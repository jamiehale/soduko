# Design

## Context

- The board state is `{ board, history, future }` in `boardReducer` (`src/hooks/board.js`). Each action that changes the board prepends the previous board to `history`, so one action is one undo step. `setMany` already returns `state` unchanged when it has nothing to do.
- `src/util/board.js` has the position helpers (`rowFromCount`, `columnFromCount`, `boxFromCount`) and a private `shouldClear(cellIndex, i)` that is true when `i` shares a row, column, or box with `cellIndex`.
- `src/util/cell.js` has `isPlayerCellWithMarks`, `isCellWithValue`, and `getCellValue`. Marks are stored sorted and unique.
- `App.jsx` wires `useAutoFill`'s `cancel()` into every player board change. The control row is a `Grid` with three `size={4}` columns: New/Reset, the "Solved" text, and the help/undo/redo icon buttons.
- Cells are 50px, so each control column is about 150px wide. The right column's three 40px icon buttons use 120px of it.
- Every visual baseline is a full-page screenshot, so any change to the control row changes all of them.

## Goals / Non-Goals

**Goals:**
- Keep the mark computation pure and unit-tested, in the curried Ramda style of `src/util/board.js`.
- Reuse the existing history mechanism, so undo and redo need no new code.

**Non-Goals:**
- No change to the saved-game format or `migrateSavedGame`.
- No change to how auto-fill finds box singles.

## Decisions

### 1. Pure functions in `src/util/board.js`

- `possibleMarks(cellIndex, board)` returns the digits 1–9 that no other cell sharing a row, column, or box with `cellIndex` holds as a value (given or player), in ascending order. It reuses `shouldClear` for the peer test (renamed `isPeer` if that reads better at both call sites) and `isCellWithValue`/`getCellValue` for the values.
- `boardWithFilledMarks(board)` maps each cell: an empty player cell (`isPlayerCellWithMarks`) gets `makeCell('player', possibleMarks(i, board))`; every other cell is returned as is. All marks are computed from the input board, so the order of cells doesn't matter. A cell with no possible digit gets `[]`, which is how the spec's "no marks" case falls out with no special branch.

### 2. New `fillMarks` reducer action, one history entry

`{ type: 'fillMarks' }` computes `boardWithFilledMarks(state.board)`. If the result `R.equals` the current board, it returns `state` unchanged (no undo step, redo kept). Otherwise it prepends the previous board to `history` and clears `future`. The action-creator helper is `fillCellMarks(dispatch)`.

*Alternative:* compute the marks in `App.jsx` and dispatch them with a payload, as `setMany` does. Rejected: auto-fill needs the payload because its timer must know what it found, but nothing here does. Computing in the reducer always uses the current board, never one from a stale closure.

### 3. Button in the middle column of the control row

A fourth icon button doesn't fit in the right column (160px of buttons in about 150px), and the left column's two text buttons leave no room either. The middle column holds only the "Solved" text, so the button goes there, centered. When the game is solved it shows "Solved" instead of the button: a solved board has no empty cells, so the button would do nothing.

- Icon: `EditNote` from `@mui/icons-material` (a pencil over lines), already installed.
- `data-testid="fill-marks"` for tests, as the other icon buttons have.
- Wrapped in an MUI `Tooltip` titled "Fill pencil marks", which also gives the button its accessible name. A new, unfamiliar icon needs a label more than help/undo/redo do.

*Alternatives:* `size="small"` on all four right-column buttons, which changes the existing buttons' look; or a fourth `Grid` column, which narrows the others and moves New/Reset. Both change more of the existing layout than the middle column does.

### 4. `App.jsx` handler

`handleFillMarks` calls `cancelAutoFill()`, then `fillCellMarks(boardDispatch)`. It doesn't call `startAutoFill()`, so a fill never starts a cascade (spec: "Filling pencil marks does not start auto-fill"). It doesn't touch the selection.

### 5. Help text

One new `DialogContentText` after the pencil-marks paragraph, for example: "Click the pencil button to fill every empty cell with the pencil marks its row, column, and box allow." It avoids the word "board", which the Help dialog must not use.

### 6. Tests

- Unit: `possibleMarks` and `boardWithFilledMarks` in `src/util/__tests__/board.test.js`; the `fillMarks` action in `src/hooks/__tests__/board.test.js`.
- E2E: a "fill pencil marks" describe block in `e2e/board-editing.spec.js`, seeding layouts with `open(page, puzzle, { values, marks })`. The auto-fill scenarios (no cascade after a fill, fill cancels a pending cascade) use `page.clock` as the existing auto-fill tests do.
- `e2e/app-help.spec.js` checks the new sentence.
- Visual: regenerate every baseline with `--update-snapshots`, check that each PNG differs only by the new button in the control row, and say so in the commit.

## Risks / Trade-offs

- [A fill overwrites marks the player removed by reasoning (pairs, pointing, and so on)] → Undo restores them in one step. The spec asks for overwrite.
- [After a click the button keeps keyboard focus, so Enter or Space fills again] → The second fill changes nothing and adds no undo step. Digit keys still go to the window `keydown` handler.
- [The button disappears when the game is solved, which shifts nothing else but may surprise] → The button would be useless then, and "Solved" already took that slot.
- [Visual baselines all change at once, which could hide an unintended diff] → Review each new PNG against the old one before committing.
- [Pencil marks computed from a wrong player value are wrong] → Same as by hand; the fill uses the values on the board, conflicts included, as the spec says.

## Migration Plan

No data migration. Deploy is the normal push to `main`. Rollback is reverting the commit.
