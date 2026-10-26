# Tasks

## 1. Setup

- [x] 1.1 Branch `auto-set-in-trigger-box` from an up-to-date `main`. Verify `openspec validate auto-set-in-trigger-box --strict` passes.

## 2. Limit the scan to the trigger box

- [x] 2.1 In `src/util/board.js`, give `nextBulkSet` a `box` argument that keeps only that box's placements (design Decision 1). Update `src/util/__tests__/board.test.js`:
  - existing `nextBulkSet` tests pass a box
  - singles in the given box are returned; singles in other boxes are not
  - two singles in the box come back sorted by cell, with the lower-digit rule
  - still `[]` when there are conflicts

  Verify with `npx vitest run src/util/__tests__/board.test.js`.
- [x] 2.2 In `src/hooks/auto-set.js`, make `start(cellIndex)` fix the trigger box for the cascade. In `App.jsx`, call `startAutoSet(cellIndex)` (design Decision 2). Verify `npm run lint` and `npm run build`.

## 3. End-to-end

- [x] 3.1 Rewrite the auto-set tests in `e2e/board-editing.spec.js` so each one triggers from a cell in the box it expects to change. For example, `BOX_0_SINGLE` becomes a value set inside box 0 that removes the other cell's mark. Keep each test's name and what it checks. Then add tests for the new scenarios:
  - a single in another box is left
  - a single the value set creates in another box (same row) is left
  - "Box singles across the board": only the trigger-box single is set
  - the cascade stays in the trigger box
  - the conflict scenario, using a seeded stale mark

  Use `page.clock` as the existing tests do. Also run `e2e/cell-selection.spec.js` and fix the "lights up an auto-set value" seed if it now triggers from another box. Verify with `npx playwright test e2e/board-editing.spec.js e2e/cell-selection.spec.js`.

## 4. Docs, version, integration

- [x] 4.1 In CLAUDE.md, add a "trigger box" glossary row and mention it in the "auto-set" and "cascade" rows (design Decision 3). Verify by reading the glossary.
- [x] 4.2 Bump to the next minor version with `npm version minor --no-git-tag-version`. Verify the Help dialog title shows it.
- [x] 4.3 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, `npm run test:e2e`. No visual baseline may change. In the dev server, load a stock puzzle and Fill pencil marks. Set a value and check that:
  - only cells in that value's box are auto-set
  - a single left in another box stays as a pencil mark

## Workflow follow-up

- Open a PR. No screenshots are needed, since how things look doesn't change. Merge to `main`, which deploys.
- Archive the change to sync the `board-editing` spec.
