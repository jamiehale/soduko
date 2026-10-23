# Tasks

## 1. Selection state

- [x] 1.1 Branch `add-digit-highlight` from an up-to-date `main`. Verify `package.json` reads 0.9.0 and `openspec validate add-digit-highlight --strict` passes.
- [x] 1.2 In `src/hooks/selection.js`, add `highlightDigit` to the state, the `highlightDigit` and `clearHighlightDigit` actions, and helpers of the same names. Make `clearSelection` clear the digit, expose `highlightDigit` from `useSelection`, and keep `mouseDown` dropping it (design Decision 1). Add tests to `src/hooks/__tests__/selection.test.js`:
  - sets a digit
  - the same digit again clears it
  - a different digit switches it
  - `mouseDown` clears it
  - `clearSelection` clears it
  - `clearHighlightDigit` clears it and keeps the selection

  Verify with `npx vitest run src/hooks/__tests__/selection.test.js`.

## 2. Highlight

- [x] 2.1 In `src/hooks/highlight.js`, take `highlightDigit` as a third argument and use it as the highlight value when the selection is empty (design Decision 2). Add tests to `src/hooks/__tests__/highlight.test.js`:
  - a digit with no selection projects the rows, columns, and boxes of every cell holding it, with `highlightValue` set
  - a digit no cell holds gives empty areas and `highlightValue` set
  - no selection and no digit gives `{}`
  - a selection ignores the digit

  Verify with `npx vitest run src/hooks/__tests__/highlight.test.js`.

## 3. Wiring

- [x] 3.1 In `App.jsx`:
  - pass `highlightDigit` from `useSelection` to `useHighlight`
  - in the plain-digit branch, call `highlightDigit` when no mouse button is held and the selection is empty
  - call `clearHighlightDigit` in `handleNewGame`

  (design Decision 3.) Verify `npm run lint` and `npm run build` pass.
- [x] 3.2 In `e2e/cell-selection.spec.js`, add a "digit highlight" describe block covering each scenario in the change's `cell-selection` delta:
  - matching values and their areas
  - filled cells and matching marks
  - struck marks shown as peers, not related
  - no cell holds the digit
  - board and undo unchanged
  - switch digits; same digit clears; Escape clears
  - a click selects normally
  - deselecting doesn't bring the digit back
  - typing after a click sets a value
  - Reset clears it; a reload clears it
  - undo while highlighted
  - an auto-filled value lights up (with `page.clock`)

  Verify with `npx playwright test e2e/cell-selection.spec.js`.

## 4. Help, version, visuals

- [x] 4.1 In `HelpDialog.jsx`, add "With nothing selected, type 1-9 to highlight that digit." after the struck-mark sentence, and add its check to `e2e/app-help.spec.js`. Verify with `npx playwright test e2e/app-help.spec.js`.
- [x] 4.2 Bump to 0.10.0 with `npm version minor --no-git-tag-version`. Verify the Help dialog title reads `soduko v0.10.0`.
- [x] 4.3 In `e2e/visual.spec.js`, add a "digit highlight" screenshot (`digit-highlight.png`): `PUZZLE` with `highlightOptions`, no selection, `8` typed. Generate it and `help.png` with `npx playwright test e2e/visual.spec.js --update-snapshots`, check that only those two PNGs changed, and review them. Then verify the visual suite passes without the flag.
- [x] 4.4 In CLAUDE.md's Input semantics, add that a digit with nothing selected highlights that digit (`highlightDigit` in the selection state). Verify by reading the section.

## 5. Integration check

- [x] 5.1 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, `npm run test:e2e`. In the dev server, load a stock puzzle, type a digit with nothing selected, and check that:
  - it matches clicking a cell holding that digit
  - typing it again clears it
  - clicking a cell then typing sets a value

## Workflow follow-up

- Open a PR with before/after screenshots (`pr-screenshots` skill), then merge to `main`, which deploys.
- Archive the change to sync the `cell-selection` and `app-help` specs.
