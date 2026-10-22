# Tasks

## 1. Highlight rule

- [x] 1.1 In `src/Board.jsx`, add the filled-cell rule to `highlightLevel` after the `selected` check, as in design Decision 1, importing `isCellWithValue`. Verify that `npx vitest run` passes and `npm run lint` is clean.

## 2. Behavior tests

- [x] 2.1 In `e2e/cell-selection.spec.js`, add the "Filled cells are blocked" scenario (an entered value and a clue outside every 7's areas are peer) and an "Empty cell selected" check that a far-off filled cell stays white. Confirm that the existing "stays unhighlighted" test targets an empty cell. Verify that `npx playwright test e2e/cell-selection.spec.js` passes and that the new filled-cell test fails without the 1.1 rule.

## 3. Visual baseline

- [ ] 3.1 Run the visual suite and confirm that only `single-selection.png` differs. Regenerate it with `npx playwright test e2e/visual.spec.js -g "single selection" --update-snapshots`. Review it: every clue and entered value outside the 8s' areas is peer, the 8s are selected, and the yellow mark at row 7, column 7 is unchanged. Verify that the full `npm run test:e2e` passes, then commit with a message saying why the baseline changed.

## 4. Integration check

- [ ] 4.1 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e`. On a stock puzzle, select a placed value. Verify that the white cells are exactly the empty cells outside every matching value's row, column, and section.

## Workflow follow-up

- Merge to `main`, which deploys, then archive the change to sync the `cell-selection` spec.
