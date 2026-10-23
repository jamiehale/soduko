# Tasks

## 1. Setup

- [x] 1.1 Branch `clear-struck-marks-on-set` from an up-to-date `main`. Verify `openspec validate clear-struck-marks-on-set --strict` passes.

## 2. Clearing

- [x] 2.1 In `src/util/board.js`, make `boardWithRelatedMarksCleared` clear struck mark N as well as pencil mark N (design Decision 1). In `src/util/__tests__/board.test.js`:
  - flip "keeps the strikes of related cells" to expect the strike cleared, and the `strikes` key gone
  - add: other struck digits and pencil marks in a related cell are kept
  - add: a struck N outside the row, column, and box is kept
  - add: `boardWithSetValues` (bulk set) clears related struck marks

  Verify with `npx vitest run src/util/__tests__/board.test.js`.

## 3. End-to-end

- [x] 3.1 In `e2e/board-editing.spec.js`:
  - rename "setting a value keeps struck marks in related cells" and flip it: cells in X's row, column, and box with struck 6 lose it, and a cell outside keeps it
  - add "undo brings struck marks back"
  - in the auto-fill tests, add "an auto-filled value clears related struck marks": the `BOX_0_SINGLE` setup plus cell 27 (column 0) with struck 7 and pencil 9; after the bulk set fills 0 with 7, 27 shows pencil 9 and no struck 7 (with `page.clock`)

  Verify with `npx playwright test e2e/board-editing.spec.js`.

## 4. Version and integration

- [x] 4.1 Bump to the next minor version with `npm version minor --no-git-tag-version`. Verify the Help dialog title shows it.
- [x] 4.2 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, `npm run test:e2e`. No visual baseline may change. In the dev server, on a stock puzzle:
  - Fill pencil marks and strike a digit in two cells of one row
  - set that digit in another cell of the row: both strikes go
  - undo: they come back

## Workflow follow-up

- Open a PR. No screenshots are needed, since how things look doesn't change. Merge to `main`, which deploys.
- Archive the change to sync the `board-editing` spec.
