# Tasks

## 1. Ignore keys while the game is paused

- [x] 1.1 In `src/App.jsx`, define `isPaused` as `showNewGame || showReset || showHelp`, return early from `handleKeyDown` when it is true, and add it to the `useCallback` dependencies; verify `npm run lint` passes
- [x] 1.2 Add a **paused** row to the CLAUDE.md glossary: "The game ignores keyboard input; true while any dialog is open. Computed, never saved" with `isPaused` in the code column; verify the row sits in the table and the table still renders
- [x] 1.3 Add e2e tests to `e2e/cell-selection.spec.js` for the `cell-selection` delta scenarios (typing a custom puzzle highlights nothing; an existing digit highlight is kept; Escape closes the dialog and keeps the selection; keys work again after Cancel). Type with `pressSequentially`/`keyboard.type`, not `fill()`, so `keydown` fires per key. Verify the new tests fail without 1.1 and pass with it: `npx playwright test e2e/cell-selection.spec.js`
- [x] 1.4 Add e2e tests to `e2e/board-editing.spec.js` for the `board-editing` delta scenarios (one cell selected: no value and undo still disabled; several cells: no pencil mark; Shift+digit with Help open: no struck mark; solved game: value kept and still solved). Verify they fail without 1.1 and pass with it: `npx playwright test e2e/board-editing.spec.js`

## 2. Integration

- [x] 2.1 Run `npx vitest run`, `npm run lint`, and `npm run test:e2e`; verify all pass with no visual baseline changes

## Workflow follow-up

- Archive the change after review and merge.
