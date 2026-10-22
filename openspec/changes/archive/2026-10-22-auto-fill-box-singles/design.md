# Design

## Context

- The board state is `{ board, history, future }` in `boardReducer` (`src/hooks/board.js`). Every action that changes the board pushes the whole previous board onto `history`, so one action is one undo step.
- `boardWithSetValue(value, cellIndex, board)` (`src/util/board.js`) toggles a player cell's value and clears that digit's marks from its row, column, and box.
- `App.jsx`'s `keydown` handler dispatches `set` or `toggleMark`. Undo, redo, reset, and new game are dispatched from button and dialog handlers in the same file.
- `useGame(board)` derives `errorCells` (conflicts) each render. It is a plain function of the board.
- Unit tests run in Vitest's `node` environment and call reducers and plain-function hooks directly. Hooks that use React state or refs aren't unit-tested. Timing behavior is covered in e2e.

## Goals / Non-Goals

**Goals:**
- Keep the box-single search and the bulk set pure and unit-testable, in the Ramda style of `src/util/board.js`.
- Keep timers out of the reducer. The reducer stays synchronous and deterministic.
- Make the 500ms timing testable in e2e without real waits.

**Non-Goals:**
- No change to the saved-game format or `migrateSavedGame`.
- No visual indication that a cell was auto-filled. It looks like any player value.

## Decisions

### 1. Pure functions in `src/util/board.js`

- `findBoxSingles(board)` returns a list of `{ cellIndex, value }`, sorted by `cellIndex`. For each box and each digit 1–9, it skips the digit if any cell in the box holds it as a value. Otherwise, if exactly one cell in the box has the digit as a pencil mark, that cell and digit form a placement. Digits are visited in ascending order and placements are de-duplicated by `cellIndex` keeping the first, so a cell that is single for two digits gets the lower one.
- `boardWithSetValues(placements, board)` reduces `boardWithSetValue` over the placements. Each target is an empty player cell, and the targets are distinct, so the toggle-off branch never applies. A placement whose mark an earlier placement cleared is still set: the placements were fixed before any were applied, which is what lets a bulk set create a conflict.

*Alternative:* re-scan after each single placement inside one bulk set. Rejected: the user asked for every single found in one scan to be set at once, with each later round a separate, timed bulk set.

### 2. New `setMany` reducer action, one history entry

`{ type: 'setMany', payload: { placements } }` returns `state` unchanged when `placements` is empty. Otherwise it applies `boardWithSetValues`, prepends the previous board to `history`, and clears `future`. Undo and redo then need nothing new: undo restores the whole previous board, including every cleared mark. The action-creator helper is `setCellValues(dispatch, placements)`, next to `setCellValue`.

*Alternative:* have the reducer compute the box singles itself (an `autoFill` action with no payload). Rejected: the cascade hook would still have to know whether anything was found in order to schedule the next round, so it would compute the singles anyway. Passing explicit placements keeps the reducer a plain applier and the action testable with hand-made placements.

### 3. `nextBulkSet(board, errorCells)` decides each round

A pure function in `src/util/board.js` returns `[]` when `errorCells` is non-empty, and otherwise `findBoxSingles(board)`. This is the whole "should the cascade continue" rule, so it is unit-tested. An empty result ends the cascade. The hook gets `errorCells` from `findErrorCells(board)`, the conflict computation `useGame` already did, now exported from `src/hooks/game.js`.

### 4. `useAutoFill({ board, dispatch })` in `src/hooks/auto-fill.js` runs the timers

- The hook keeps the latest `board` in a ref, updated each render as `useWindowEvent` does with its handler, and holds a single timeout id in a ref.
- It returns `{ start, cancel }`:
  - `cancel()` clears the pending timeout.
  - `start()` cancels, then schedules `step` in 500ms.
- `step` reads the board ref and computes `nextBulkSet(board, findErrorCells(board))`. If the result is empty, it stops. Otherwise it dispatches `setCellValues`, writes `boardWithSetValues(placements, board)` back to the ref, and schedules `step` again in 500ms. Writing the result back means the next round doesn't depend on React having rendered in between. Without it, a round that fires before the render re-reads the old board and applies the same bulk set twice. The e2e clock exposed this by running two rounds in one `runFor`.
- An unmount effect cancels.

Reading from refs means the timer always sees the current board, never a stale closure. Using one timeout slot means a new `start()` replaces any cascade in progress.

*Alternative:* an effect that watches `board` and schedules the next round whenever it changes. Rejected: the effect can't tell a player's value set from an undo, redo, or mark toggle without extra state, and those must not start a cascade.

### 5. `App.jsx` starts and cancels

- In the digit branch of `handleKeyDown`, call `cancel()` before every dispatch. On the single-cell path, call `start()` after `setCellValue` only when the action is a value set: the target is a player cell whose current value isn't the typed digit. Use a predicate in `src/util/cell.js`, e.g. `isValueSet(value, cell)`. Typing on a given cell changes nothing, so it neither cancels nor starts.
- `handleUndo`, `handleRedo`, `handleReset`, and `handleNewGame` call `cancel()`.
- Escape and the mouse handlers don't touch the cascade, so selection changes don't cancel it.

### 6. E2E timing with Playwright's clock

The board-editing specs for this capability call `page.clock.install()` before `open(...)`, then `page.clock.runFor(499)` and `page.clock.runFor(1)` to assert just before and at each 500ms boundary. They build the needed pencil-mark layouts with `open`'s `marks`/`values` seeding on the default puzzle, so no new fixture is needed.

## Risks / Trade-offs

- [Auto-fill acts on the player's pencil marks, which may be wrong] → It never runs on a board with a conflict. Each bulk set is one undo step, and conflicts it creates are shown at once.
- [Surprise for players who didn't expect automatic changes] → The 500ms pause makes each round visible, and undo reverses it. A setting to turn it off is out of scope (see proposal).
- [Existing e2e tests that set a value with marks seeded might now trigger auto-fill and change cells they assert on] → They assert immediately after the keypress, before 500ms of real time passes. Run the full suite and adjust seeds if any test that waits (for example, visual tests) picks up a fill.
- [Clock installation may affect MUI transitions in the same test] → Install the clock only in the auto-fill tests, which open no dialogs.
- [A save written mid-cascade reloads without the remaining rounds] → Accepted. The spec says a reload doesn't resume, and the next player value set re-scans the whole board.

## Migration Plan

No data migration. Deploy is the normal push to `main`. Rollback is reverting the commit.
