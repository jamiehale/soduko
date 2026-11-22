# Tasks

## 1. Selection state

- [x] 1.1 In `src/hooks/selection.js`, add a `markDigit` reducer action (and `markDigit(dispatch, digit)` helper) that sets `highlightDigit` to the digit with no toggle-off; make `mouseUp` keep `highlightDigit`. Add tests to `src/hooks/__tests__/selection.test.js`: `markDigit` sets the digit, the same digit twice keeps it, a different digit switches it, it survives the `mouseUp` that ends a drag, and `mouseDown`/`clearSelection` still clear it. Verify with `npx vitest run src/hooks/__tests__/selection.test.js`

## 2. Highlight

- [x] 2.1 In `src/hooks/highlight.js`, use `highlightDigit` whenever it is set, with or without a selection, falling back to the single selected cell's value. Replace the "ignores the typed digit when cells are selected" test in `src/hooks/__tests__/highlight.test.js` with tests that a digit with a multi-cell selection projects the areas of every cell holding it (not the selection's shared areas), that it replaces a single selected cell's own value, and that a digit no cell holds gives empty areas. Verify with `npx vitest run src/hooks/__tests__/highlight.test.js`

## 3. Keyboard wiring

- [x] 3.1 In `src/App.jsx`'s `handleKeyDown`, call `markDigit` after `toggleCellMark` and after `toggleCellStrike`, and call `clearHighlightDigit` after `setCellValue`. Verify `npm run lint` passes
- [x] 3.2 Add e2e tests to `e2e/cell-selection.spec.js` for the delta scenarios in "Toggling a mark highlights its digit", "Changing the marked digit highlight", "Marked digit replaces the selection's areas", "Escape after marking", and "Click a cell after marking". Assert through computed colors, as the existing highlight tests do. Verify they fail without 3.1 and pass with it: `npx playwright test e2e/cell-selection.spec.js`

## 4. Help and version

- [x] 4.1 In `src/HelpDialog.jsx`, extend the digit-highlight line to say that toggling pencil marks or struck marks also highlights that digit; extend the matching check in `e2e/app-help.spec.js`. Verify with `npx playwright test e2e/app-help.spec.js`
- [x] 4.2 Bump `version` in `package.json` and `package-lock.json` to 0.13.0 (`npm version 0.13.0 --no-git-tag-version`); verify the Help dialog title reads "soduko v0.13.0" in the dev server

## 5. Integration

- [x] 5.1 Run `npx vitest run`, `npm run lint`, and `npm run test:e2e`; verify all pass. The only baseline change is the Help dialog screenshot, for the longer help text (`npx playwright test e2e/visual.spec.js -g "help, version masked" --update-snapshots`)

## Workflow follow-up

- Archive the change after review and merge.
