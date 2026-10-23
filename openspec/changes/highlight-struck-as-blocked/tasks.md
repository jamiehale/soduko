# Tasks

## 1. Setup

- [x] 1.1 Branch `highlight-struck-as-blocked` from an up-to-date `main` (`add-struck-marks` is already archived). Verify `openspec validate highlight-struck-as-blocked --strict` passes.

## 2. Highlighting

- [x] 2.1 In `src/Board.jsx`, extend the filled-cell check in `highlightLevel` to cover struck mark N, and update its comment (design Decision 1). In `e2e/cell-selection.spec.js`:
  - change "a struck mark for the value is not related" to expect the peer style for cell 70
  - add "other struck digits don't block": a cell outside every 7's areas with struck 4 stays white

  Verify with `npx playwright test e2e/cell-selection.spec.js` and `npm run lint`.
- [x] 2.2 Regenerate `struck-marks.png` with `npx playwright test e2e/visual.spec.js --update-snapshots`. Check that it is the only PNG that changed and that the only visible difference is cell 71 turning light blue. Update the comment above that test ("71's struck 8 is not" → now peer). Verify the visual suite passes without the flag.

## 3. Related change, version, integration

- [x] 3.1 If `add-digit-highlight` is still open, change its `cell-selection` delta scenario "Struck marks are not related" to expect the peer style (design Decision 2). Verify `openspec validate add-digit-highlight --strict` passes.
- [x] 3.2 Bump to the next minor version with `npm version minor --no-git-tag-version`. Verify the Help dialog title shows it.
- [x] 3.3 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, `npm run test:e2e`. In the dev server, load a stock puzzle, Fill pencil marks, strike a digit in a far-off cell, and select a cell holding that digit. Check that the struck cell is light blue and a pencil-marked cell elsewhere is yellow.

## Workflow follow-up

- Open a PR with before/after screenshots (`pr-screenshots` skill), then merge to `main`, which deploys.
- Archive the change to sync the `cell-selection` spec.
