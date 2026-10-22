# Tasks

## 1. Mark computation (pure)

- [x] 1.1 In `src/util/board.js`, add `possibleMarks(cellIndex, board)` and `boardWithFilledMarks(board)` (design Decision 1), in the file's curried Ramda style. Add tests to `src/util/__tests__/board.test.js` covering:
  - a cell whose row, column, and box hold 1, 2, 5, 8, 9 gets 3, 4, 6, 7
  - given values and player values both count
  - every cell of an empty board gets 1–9
  - existing marks are replaced (extra marks removed, missing marks added)
  - a cell that sees all nine digits gets `[]`
  - given cells and player cells with values are returned unchanged
  - a board with a conflict: both conflicting values count

  Verify with `npx vitest run src/util/__tests__/board.test.js` and `npm run lint`.

## 2. Reducer action

- [x] 2.1 In `src/hooks/board.js`, add the `fillMarks` action and the `fillCellMarks(dispatch)` helper (design Decision 2). Add tests to `src/hooks/__tests__/board.test.js`:
  - a fill adds exactly one history entry and clears `future`
  - one undo restores every cell's previous marks; redo reapplies the fill
  - a fill that changes nothing returns the same state object

  Verify with `npx vitest run src/hooks/__tests__/board.test.js`.

## 3. Button and help

- [x] 3.1 In `App.jsx`, add `handleFillMarks` (cancel auto-fill, then `fillCellMarks`) and the `EditNote` icon button with `data-testid="fill-marks"` and a "Fill pencil marks" `Tooltip` in the middle control column, shown when the game isn't solved (design Decisions 3 and 4). Verify `npm run lint` is clean and `npm run build` succeeds.
- [x] 3.2 In `e2e/board-editing.spec.js`, add a "fill pencil marks" describe block covering each scenario in the change's `board-editing` delta spec:
  - marks follow the row, column, and box
  - every empty cell is filled on a freshly loaded puzzle; given cells unchanged
  - player values count and are kept
  - empty board gives 1–9 everywhere
  - selection is kept
  - extra marks removed, missing marks added
  - a cell that sees all nine digits gets no marks
  - works with a conflict, which still shows
  - one undo restores hand-made marks; redo reapplies
  - a second click changes nothing and adds no undo step
  - a fill clears redo
  - with `page.clock`: a fill that leaves a box single doesn't auto-fill it after 500ms; a fill during the auto-fill pause cancels the cascade

  Verify with `npx playwright test e2e/board-editing.spec.js`.
- [x] 3.3 In `HelpDialog.jsx`, add the sentence about the pencil button (design Decision 5), without the word "board". Add its check to the first test in `e2e/app-help.spec.js`. Verify with `npx playwright test e2e/app-help.spec.js`.

## 4. Version and visuals

- [x] 4.1 Bump `package.json` (and `package-lock.json`) to 0.6.0 with `npm version 0.6.0 --no-git-tag-version`. Verify that the help dialog title reads `soduko v0.6.0`.
- [x] 4.2 Regenerate the visual baselines with `npx playwright test e2e/visual.spec.js --update-snapshots`. Compare each new PNG with the old one and confirm the only difference is the new button in the control row (and the new Help sentence in `help.png`). Then verify `npx playwright test e2e/visual.spec.js` passes without the flag.

## 5. Integration check

- [x] 5.1 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e`. In `npm start`, load a stock puzzle, click the pencil button, and verify that every empty cell gets marks, that hovering shows "Fill pencil marks", that one undo clears them, and that setting a value afterwards still auto-fills box singles.

## Workflow follow-up

- Open a PR with before/after screenshots (`pr-screenshots` skill), then merge to `main`, which deploys.
- Archive the change to sync the `board-editing` and `app-help` specs.
