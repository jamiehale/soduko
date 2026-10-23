# Tasks

## 1. Setup

- [x] 1.1 Make sure `add-struck-marks` is archived (`openspec list` no longer shows it, and `openspec/specs/board-editing/spec.md` has "Toggle struck marks across a selection"). Then branch `skip-marks-peers-hold` from an up-to-date `main`. Verify `openspec validate skip-marks-peers-hold --strict` passes.

## 2. Board transforms and reducer

- [x] 2.1 In `src/util/board.js`, add `canTakeMark` and the shared `boardWithToggled(has, set, clear)`, and rebuild `boardWithToggledMark` and `boardWithToggledStrike` on it. Remove `allMarkableCellsHave` (design Decision 1). Add tests to `src/util/__tests__/board.test.js`, for both pencil marks and struck marks:
  - one cell whose row, column, or box holds N gets no mark
  - in a selection, blocked cells are skipped and the others get the mark
  - a player value and both values of a conflict count
  - removal: when every taker has N, N is removed from all selected cells, including a blocked cell with a stale struck mark
  - a single blocked cell with a stale struck mark can be cleared
  - every cell blocked and none marked: the board is unchanged

  Verify with `npx vitest run src/util/__tests__/board.test.js`.
- [x] 2.2 In `src/hooks/board.js`, return the same state from `toggleMark` when the board doesn't change (design Decision 2). Add tests to `src/hooks/__tests__/board.test.js`:
  - a pencil-mark toggle on only blocked cells returns the same state object
  - a pencil-mark toggle on only given cells returns the same state object
  - a struck-mark toggle on only blocked cells returns the same state object

  Verify with `npx vitest run src/hooks/__tests__/board.test.js`.

## 3. End-to-end

- [x] 3.1 In `e2e/board-editing.spec.js`, add a "marks skip digits a peer holds" describe block covering each scenario in the change's ADDED requirements:
  - one cell, pencil mark, row holds the digit
  - one cell, struck mark, box holds the digit
  - a drag with one blocked cell
  - a player value counts
  - conflicting values count
  - every cell blocked: undo stays disabled
  - only given cells selected: undo stays disabled
  - redo kept after an ignored keystroke

  Add "Skipped cells don't block removal" to the pencil-mark block and "A struck mark on a digit a peer holds can be removed" to the struck-mark block. Check existing tests that mark cells whose peers hold the digit, and change only their seed cells, never what they assert. Verify with `npx playwright test e2e/board-editing.spec.js`.

## 4. Version and integration

- [x] 4.1 Bump to the next minor version with `npm version minor --no-git-tag-version`. Verify the Help dialog title shows it.
- [x] 4.2 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, `npm run test:e2e`. The visual suite must pass with no baseline changes. In the dev server, load a stock puzzle, drag across a row containing a given 5, type `5` and Shift+5, and check that no cell in that row gets either mark, while cells in another row do.

## Workflow follow-up

- Open a PR. No screenshots: nothing looks different. Merge to `main`, which deploys.
- Archive the change to sync the `board-editing` spec.
