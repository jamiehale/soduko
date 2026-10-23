# Tasks

## 1. Cell model

- [x] 1.1 In `src/util/cell.js`, add `getCellStrikes`, `cellHasStrike`, `setStrike`, and `clearStrike`. Make `setMark` remove strike N, and make `setPlayerValue`/`clearPlayerValue` drop the `strikes` key (design Decision 1). Add tests to `src/util/__tests__/cell.test.js` covering:
  - a cell without the key has no strikes
  - `setStrike` keeps the list sorted and unique and removes mark N
  - `setMark` removes strike N
  - `clearStrike` drops the key when the list empties
  - setting or clearing a value leaves no `strikes` key
  - `cellHasMark` is false for a struck digit

  Verify with `npx vitest run src/util/__tests__/cell.test.js` and `npm run lint`.

## 2. Board transforms and reducer

- [x] 2.1 In `src/util/board.js`, add `boardWithToggledStrike` (sharing the generalized all-have check with `boardWithToggledMark`) and make `boardWithFilledMarks` keep strikes and skip struck digits (design Decision 2). Add tests to `src/util/__tests__/board.test.js` covering:
  - toggle: add, mixed adds, all-marked removes, given and filled cells skipped, other marks kept
  - a pencil-mark toggle replaces strike N and treats it as unmarked
  - a value set keeps peers' strikes
  - fill: strikes kept, struck digits not added, a strike for a digit a peer holds is kept
  - `findBoxSingles`: a single pencil mark next to strikes is found; a lone strike is not

  Verify with `npx vitest run src/util/__tests__/board.test.js`.
- [x] 2.2 In `src/hooks/board.js`, add the `toggleStrike` action and `toggleCellStrike(dispatch, cells, mark)` (design Decision 3). Add tests to `src/hooks/__tests__/board.test.js`:
  - one history entry, `future` cleared
  - undo restores marks and strikes; redo reapplies them
  - a toggle that changes nothing returns the same state object

  Verify with `npx vitest run src/hooks/__tests__/board.test.js`.

## 3. Rendering and test helpers

- [x] 3.1 Add `colors.strike.line: '#ff0000'` to `src/theme.js`. Pass strikes from `Cell.jsx` to `MarkedCell.jsx` and render each struck digit as a struck `Mark` through a `$struck` transient prop (design Decision 5). Verify `npm run lint` and `npm run build` pass, and that the existing visual suite (`npx playwright test e2e/visual.spec.js`) still passes unchanged.
- [x] 3.2 Extend `e2e/helpers.js`:
  - `buildBoard` takes a `strikes` option
  - `cellState` returns `marks` (unstruck) and `strikes` (struck, by computed `text-decoration-line`)
  - add a `cellStrikes` shortcut

  Verify the whole e2e suite still passes with `npm run test:e2e`.

## 4. Keyboard input

- [x] 4.1 In `App.jsx`'s `keydown` handler, handle Shift + `Digit1`–`Digit9` first: cancel auto-fill, then `toggleCellStrike` on the selected cells; never start auto-fill (design Decision 4). Verify `npm run lint`.
- [x] 4.2 In `e2e/board-editing.spec.js`, add a "struck marks" describe block covering each scenario in the change's `board-editing` delta:
  - toggle on one cell, a drag selection, and while the mouse is held
  - mixed adds, all-marked removes, other marks kept, filled cells skipped
  - no undo step when nothing changes
  - struck replaces a pencil mark and back; struck counts as unmarked for a mark toggle
  - setting the struck digit as a value, then clearing it, leaves no marks
  - a peer keeps its struck mark when a value is set
  - undo and redo
  - Fill pencil marks: keeps struck marks (including one for a digit a peer holds), and undo restores both kinds of mark
  - with `page.clock`:
    - a box single next to struck marks is auto-filled
    - a lone struck mark is not auto-filled
    - a toggle that leaves a box single doesn't start auto-fill
    - a toggle during the pause cancels the cascade

  Check the struck line's color once (red). Verify with `npx playwright test e2e/board-editing.spec.js`.
- [x] 4.3 In `e2e/cell-selection.spec.js`, add the "Struck marks are not related" scenario, asserting the cell's background is white. In `e2e/game-persistence.spec.js`, add "Struck marks survive reload". Verify with `npx playwright test e2e/cell-selection.spec.js e2e/game-persistence.spec.js`.

## 5. Help, docs, version, visuals

- [x] 5.1 In `HelpDialog.jsx`, add a sentence after the pencil-marks paragraph, for example: "Hold Shift and type 1-9 to strike out that digit in the selected cells." Don't use the word "board". Add its check to `e2e/app-help.spec.js`. Verify with `npx playwright test e2e/app-help.spec.js`.
- [x] 5.2 In CLAUDE.md, add a glossary row for **struck mark** (`strikes`) and mention the optional `strikes` key in the Board model section. Verify by reading the updated sections.
- [x] 5.3 Bump to 0.7.0 with `npm version 0.7.0 --no-git-tag-version`. Verify the Help dialog title reads `soduko v0.7.0`.
- [x] 5.4 In `e2e/visual.spec.js`, add a "struck marks" screenshot (`struck-marks.png`) showing pencil marks and struck marks together, with a single selection that makes one of them related. Generate it and `help.png` with `npx playwright test e2e/visual.spec.js --update-snapshots`, check that only those two PNGs changed (`git status e2e/visual.spec.js-snapshots`), and review them. Then verify `npx playwright test e2e/visual.spec.js` passes without the flag.

## 6. Integration check

- [x] 6.1 Run the full gate: `npx vitest run`, `npm run lint`, `npm run build`, `npm run test:e2e`. In `npm start`, load a stock puzzle, click Fill pencil marks, drag across a row and press Shift+digit, and check that:
  - the digits show struck in red
  - selecting a cell with that value doesn't highlight the struck cells
  - a second fill keeps them
  - undo removes them

## Workflow follow-up

- Open a PR with before/after screenshots (`pr-screenshots` skill), noting the AZERTY limitation from design Risks, then merge to `main`, which deploys.
- Archive the change to sync the `board-editing`, `cell-selection`, `board-appearance`, `game-persistence`, and `app-help` specs.
