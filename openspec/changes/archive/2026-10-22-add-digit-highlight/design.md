# Design

## Context

- `src/hooks/selection.js` holds `{ selectedCells, previouslySelectedCells, draggedCells, isMouseDown }` in a reducer. `mouseDown` builds a fresh state object, so any key not in that object is dropped. `clearSelection` empties `selectedCells`.
- `useHighlight(selectedCells, board)` (`src/hooks/highlight.js`) returns `{}` for an empty selection. With one selected cell holding N, it sets `highlightValue: N` and projects the rows, columns, and boxes of every cell holding N (`cellsHolding`).
- `Board.jsx`'s `highlightLevel` turns `highlightValue` into the selected/peer/related styles: matching values are selected, filled cells are peers, and pencil marks of N are related. It doesn't care whether the value came from a selected cell.
- In `App.jsx`'s `keydown` handler, a digit with an empty selection and no mouse button held falls through every branch and does nothing. Reset calls `clearSelection`; New Game does not touch the selection.
- `highlightLevel` already shows a cell with struck mark N in the peer style while N is highlighted (`highlight-struck-as-blocked`), so the typed digit gets that too.

## Goals / Non-Goals

**Goals:**
- Reuse the existing value highlighting unchanged, so a typed digit looks exactly like selecting a cell holding it.
- Keep the digit in client state next to the selection, not in the saved game.

**Non-Goals:**
- No change to `Board.jsx`'s style rules or the theme.
- No change to the saved-game format.

## Decisions

### 1. The digit lives in the selection state

Add `highlightDigit` to the selection reducer's state, with two new actions:
- `highlightDigit` (`{ digit }`): sets it, or clears it when it already equals `digit`.
- `clearHighlightDigit`: clears it.

`mouseDown` already returns a new object without the key, so pressing on any cell clears the digit with no extra code. `clearSelection` (Escape, Reset) also clears it. `useSelection` exposes `highlightDigit`, and there are helpers `highlightDigit(dispatch, digit)` and `clearHighlightDigit(dispatch)`.

*Alternative:* a separate `useState` in `App.jsx`. Rejected: then a mouse press would have to clear it in two places, and the "click ends it" rule would live outside the reducer that already handles clicks and is unit-tested.

### 2. `useHighlight` takes the digit

`useHighlight(selectedCells, board, highlightDigit)`. With an empty selection and a digit, it returns the value-highlight shape: `highlightValue: digit`, plus the rows, columns, and boxes of `cellsHolding(digit, board)`. When no cell holds the digit those lists are empty, which gives the spec's "no cell holds the digit" case with no special branch. With an empty selection and no digit, it still returns `{}`. With a selection, the digit is ignored. In practice the two can't coexist anyway, since a press clears the digit.

### 3. Keyboard handling in `App.jsx`

In the plain-digit branch, add a final case: no mouse button held and an empty selection → `highlightDigit(selectionDispatch, value)`. This doesn't cancel auto-fill, because the board doesn't change (spec: "follows the board"). Shift + digit keeps its early return when nothing is selected.

New Game calls `clearHighlightDigit`, so the new puzzle doesn't open with a stale highlight. It doesn't call `clearSelection`, so it keeps today's selection behavior.

### 4. Help text and version

One `DialogContentText` after the struck-mark sentence: "With nothing selected, type 1-9 to highlight that digit." It avoids the word "board". Bump to 0.10.0.

### 5. Tests

- Unit: the selection reducer (set, toggle off, switch, cleared by `mouseDown` and `clearSelection`, `clearHighlightDigit`) and `useHighlight` with a digit (matching cells projected, no-holder case, empty without a digit, ignored with a selection).
- E2E: a "digit highlight" describe block in `e2e/cell-selection.spec.js` covering each scenario in this change's `cell-selection` delta, asserting through computed backgrounds as the suite does. The auto-fill scenario uses `page.clock`.
- `e2e/app-help.spec.js` checks the new sentence.
- Visual: a new `digit-highlight.png` with a puzzle, no selection, and a typed digit. `help.png` is regenerated.

## Risks / Trade-offs

- [A player who types a digit with nothing selected, expecting it to set a value, sees highlighting instead] → Today that key does nothing, so nothing that worked is lost. Escape or a second press clears it.
- [Nothing on screen names the highlighted digit; with no cell holding it, only marks and filled cells light up] → Same as selecting a cell today. An indicator is out of scope.

## Migration Plan

No data migration. Deploy is the normal push to `main`; rollback is reverting the commit.
