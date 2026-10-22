# Tasks

## 1. Box singles and bulk set (pure)

- [x] 1.1 In `src/util/board.js`, add `findBoxSingles(board)` and `boardWithSetValues(placements, board)`, as in design Decision 1, in the file's curried Ramda style. Add tests to `src/util/__tests__/board.test.js` covering:
  - a single mark in a box is found
  - a digit already placed as a value in the box is skipped
  - two marks for a digit in a box give no placement
  - a cell that is single for 3 and 8 gets 3
  - singles in two boxes are both returned, sorted by cell index
  - `boardWithSetValues` sets every placement and clears related marks
  - two placements of the same digit in one row both get set (a conflict)

  Verify with `npx vitest run src/util/__tests__/board.test.js`.
- [x] 1.2 Add `nextBulkSet(board, errorCells)` (design Decision 3) with unit tests: it returns `[]` when `errorCells` is non-empty, and the box singles otherwise. Verify that `npx vitest run` passes and `npm run lint` is clean.

## 2. Reducer action

- [x] 2.1 In `src/hooks/board.js`, add the `setMany` action and the `setCellValues(dispatch, placements)` helper (design Decision 2). Add tests to `src/hooks/__tests__/board.test.js`:
  - empty placements return the same state object
  - a bulk set adds exactly one history entry and clears `future`
  - one undo restores the auto-filled cells' marks and the related marks the bulk set cleared
  - redo reapplies the bulk set

  Verify with `npx vitest run src/hooks/__tests__/board.test.js`.

## 3. Timed cascade

- [x] 3.1 In `src/util/cell.js`, add the `isValueSet(value, cell)` predicate (a player cell whose value isn't `value`) with tests in `src/util/__tests__/cell.test.js`. Verify with `npx vitest run src/util/__tests__/cell.test.js`.
- [x] 3.2 Add `src/hooks/auto-fill.js` with `useAutoFill({ board, dispatch })` returning `{ start, cancel }` (design Decision 4). Add a short comment in the style of `window-event.js` explaining the refs. Verify `npm run lint` is clean.
- [x] 3.3 Wire it into `App.jsx` (design Decision 5):
  - `cancel()` before every digit-key dispatch
  - `start()` after a single-cell value set where `isValueSet` held before the dispatch
  - `cancel()` in `handleUndo`, `handleRedo`, `handleReset`, and `handleNewGame`

  Verify `npm run lint` is clean and `npm run build` succeeds.
- [x] 3.4 In `e2e/board-editing.spec.js`, add an "auto-fill box singles" describe block. Install `page.clock` before `open`, and seed pencil-mark layouts on the default puzzle with `open(page, undefined, { values, marks })`. Cover each scenario in the change's `board-editing` delta spec:
  - the fill happens at 500ms, not at 499ms
  - box singles across the board fill together
  - a box single from before the value set fills
  - a box that already holds the digit is skipped
  - no fill after toggling a value off, toggling marks, or a set with no singles
  - auto-filled values clear related marks
  - the lower digit wins in a cell single for two digits
  - a second round at 1000ms, and the cascade ends
  - one undo per bulk set, undo twice back to before the player's set, and redo without a further cascade
  - a bulk set that creates a conflict shows the conflict style and stops the cascade
  - no cascade after a player set that leaves a conflict
  - undo out of a conflict
  - undo and a mark toggle during the pause cancel the cascade; a selection change doesn't

  Verify with `npx playwright test e2e/board-editing.spec.js`.
- [x] 3.5 Run the rest of the e2e suite (`npm run test:e2e`) and confirm that no existing test changes because of auto-fill (design Risks). If one does, adjust its seed so that it no longer leaves a box single, and note why in the commit.

## 4. Version

- [x] 4.1 Bump `package.json` (and `package-lock.json`) to 0.5.0 with `npm version 0.5.0 --no-git-tag-version`. Verify that the help dialog title reads `soduko v0.5.0`.
- [x] 4.2 Run the visual suite and confirm that no baseline changes. Verify with `npx playwright test e2e/visual.spec.js`.

## 5. Integration check

- [x] 5.1 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e`. In `npm start`, on a stock puzzle, pencil-mark a box so that setting a value leaves a box single. Verify that it fills after about half a second, that a following round fills half a second later, and that undo steps back one round at a time.

## Workflow follow-up

- Open a PR, then merge to `main`, which deploys.
- Archive the change to sync the `board-editing` spec.
