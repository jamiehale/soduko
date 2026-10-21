# Tasks

## 1. Baseline and cleanup

- [x] 1.1 Commit the in-progress yarn → npm switch (`package.json`, `package-lock.json`, `yarn.lock` removal). Verify with `npm ci`, which succeeds from a clean `node_modules`.
- [x] 1.2 Add `.nvmrc` pinning Node 24. Prefix the `start` and `build` scripts with `NODE_OPTIONS=--openssl-legacy-provider`. Verify that `npm run build` succeeds and `npm start` serves the app on http://localhost:3000 under the local Node.
- [x] 1.3 Remove the Netlify badge from `README.md` (keep the `https://soduko.me` "Try it out" link) and the Netlify mention from `CLAUDE.md`, and replace the README's yarn commands with npm. Verify that `grep -ri netlify --exclude-dir=node_modules --exclude-dir=.git --exclude=package-lock.json .` finds nothing outside `openspec/`.

## 2. Reducer and derived-state unit tests

- [x] 2.1 Export `boardReducer` from `src/hooks/board.js` and `selectionReducer` from `src/hooks/selection.js` as named exports, leaving the default exports unchanged. Verify that `CI=true npm test` still passes all 85 existing tests.
- [x] 2.2 Add `src/hooks/__tests__/board.test.js` covering `newGame`, `reset`, `toggleMark`, `set`, clue-cell no-op with no history entry, and `undo`/`redo`, including that a new change clears `future` and that undo/redo on an empty stack is a no-op. Use only `describe`/`it`/`expect`. Verify with `CI=true npm test`.
- [x] 2.3 Add `src/hooks/__tests__/selection.test.js` covering click-select, click-again-to-deselect, drag selection, mouseOver without a drag, and `clearSelection`. Also cover that the hook reports dragged cells as selected mid-drag (through the exported reducer's state plus the same derivation). Verify with `CI=true npm test`.
- [x] 2.4 Add `src/hooks/__tests__/game.test.js` (conflicts by row, column, and section; clue vs entered; marks ignored; solved vs one-blank vs one-wrong) and `src/hooks/__tests__/highlight.test.js` (single cell, multi-cell in one row/column/section, value highlight only for a single cell with a value). Call `useGame`/`useHighlight` directly. Verify with `CI=true npm test`.

## 3. Playwright behavior tests

- [ ] 3.1 Add `@playwright/test` as a dev dependency, `playwright.config.js` (Chromium only, fixed viewport, `webServer` running `npm start` with `BROWSER=none` on port 3000, `reuseExistingServer`), and a `test:e2e` script. Install Chromium with `npx playwright install chromium`. Verify that `npm run test:e2e` runs an empty suite cleanly.
- [ ] 3.2 Add `data-testid="board"` to the board container and `data-cell="<index>"` to each cell container. Verify in the browser DOM that 81 `[data-cell]` elements exist, and that `CI=true npm test` passes.
- [ ] 3.3 Add `e2e/helpers.js`: build a stored state from puzzle strings, seed it via `addInitScript`, locate cells by `[data-cell]`, read a cell's value/marks/background color, and drag across a list of cells by moving to each cell's center. Verify it through the first spec file in 3.4.
- [ ] 3.4 Add `e2e/board-editing.spec.js` covering every scenario in `specs/board-editing/spec.md` (value entry/replace/toggle-off, clue immutability, related-mark clearing, multi-cell and hold-to-mark toggles, mark ordering, undo/redo/redo-cleared, reset confirm/cancel). Verify that `npm run test:e2e` passes.
- [ ] 3.5 Add `e2e/cell-selection.spec.js` covering every scenario in `specs/cell-selection/spec.md`, asserting highlight state through computed background colors. Verify that `npm run test:e2e` passes.
- [ ] 3.6 Add `e2e/game-status.spec.js` covering every scenario in `specs/game-status/spec.md`, using a seeded near-solved board for the solved scenarios. Verify that `npm run test:e2e` passes.
- [ ] 3.7 Add `e2e/puzzle-loading.spec.js` and `e2e/app-help.spec.js` covering every scenario in those specs, driving the real New Game and Help dialogs. Verify that `npm run test:e2e` passes.

## 4. Persistence and saved-game compatibility

- [ ] 4.1 Write `e2e/capture-fixture.js`, a standalone script that is not matched by the test runner. Run it against the current app to produce `e2e/fixtures/saved-game-v0.2.2.json`, a stock puzzle with entered values, marks, and at least one undo and one redo step available. Verify the JSON contains `board`, `history`, and `future`, and commit it.
- [ ] 4.2 Add `e2e/game-persistence.spec.js` covering reload mid-game, history surviving reload, first visit with empty storage, corrupt JSON, and loading the v0.2.2 fixture (board matches, undo restores the earlier state). Verify that `npm run test:e2e` passes.

## 5. Visual baselines

- [ ] 5.1 Add `e2e/visual.spec.js` with `toHaveScreenshot()` for each state listed in `specs/board-appearance/spec.md` (empty board, single selection with peer/value/related highlighting, multi-cell selection, marks, conflict, solved, New Game Stock and Custom tabs, Reset confirmation, Help with the version masked). Also add explicit computed-color assertions for each row of the cell-state color table. Use `animations: 'disabled'` and `maxDiffPixelRatio: 0.01`.
- [ ] 5.2 Generate the baselines with `npx playwright test e2e/visual.spec.js --update-snapshots`, review each image by eye against the running app, and commit them. Verify that a second `npm run test:e2e` run passes with no snapshot changes.

## 6. Documentation and integration check

- [ ] 6.1 Update `CLAUDE.md`: unit-test vs e2e commands (`npm run test:e2e`, a single spec, `--update-snapshots` and when to use it), where the tests live, the `data-cell` hooks, the local-storage seeding helper, and the temporary OpenSSL flag. Verify each documented command runs as written.
- [ ] 6.2 From a clean checkout, run `npm ci`, `CI=true npm test`, `npm run test:e2e`, and `npm run build`. Verify that all pass with no snapshot updates.

## Workflow follow-up

- Archive this change before starting `migrate-to-vite-vitest`, so the new specs land in `openspec/specs/` as the baseline the later changes must preserve.
