# Tasks

## 1. Highlight model

- [x] 1.1 Change `useHighlight` in `src/hooks/highlight.js` to return `highlightRows`, `highlightColumns`, and `highlightSections` arrays, as in design Decision 1. For a single selected cell holding N, they are the union over every cell holding N. Keep the point-free Ramda style. Update `highlightLevel` in `src/Board.jsx` to test membership. Update the existing unit tests in `src/hooks/__tests__/highlight.test.js` to the array shape. Add the union, de-duplication, and clue-plus-entered-value cases. Verify that `npx vitest run` passes and `npm run lint` is clean.

## 2. Behavior tests

- [ ] 2.1 In `e2e/cell-selection.spec.js`, add a test for "Peers of every matching value" and "Remaining placements stay unhighlighted". Update the existing related-marks test, where cell 72 now shares column 0 with the 7 at cell 0, and add a "Matching mark inside a projected area" assertion. Verify that `npx playwright test e2e/cell-selection.spec.js` passes.

## 3. Visual baseline

- [ ] 3.1 Run the visual suite and confirm that only `single-selection.png` differs. Regenerate that one baseline with `npx playwright test e2e/visual.spec.js -g "single selection" --update-snapshots`. Review the new PNG: every 8's row, column, and section is peer, the 8s are selected, and marks follow the precedence. Verify that the full `npm run test:e2e` passes, then commit with a message saying why the baseline changed.

## 4. Integration check

- [ ] 4.1 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e`. Also check the behavior by hand in `npm start`, by selecting a placed value on a stock puzzle. Verify that all pass and the highlight matches the spec.

## Workflow follow-up

- Merge to `main`, which deploys, then archive the change to sync the `cell-selection` spec.
