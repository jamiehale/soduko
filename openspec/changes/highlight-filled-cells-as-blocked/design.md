# Design

## Context

- **`useHighlight`** (`src/hooks/highlight.js`) returns `highlightRows`, `highlightColumns`, `highlightSections`, and `highlightValue`. `highlightValue` is set only when the single selected cell holds a value.
- **`highlightLevel`** in `src/Board.jsx` decides each cell's style in this order: `selected` (selected, or holds `highlightValue`), then `peer` (in a highlighted row, column, or section), then `related` (has mark `highlightValue`), then none.
- **`isCellWithValue`** in `src/util/cell.js` is true for clues and entered values, and false for empty or pencil-marked cells.

## Goals / Non-Goals

**Goals:**
- With a value selected, the unhighlighted cells are exactly the empty cells where that value could still go, given the rows, columns, and sections.

**Non-Goals:**
- A separate color for "blocked because filled". The user asked for the existing blue.
- Deeper candidate analysis, such as pencil marks or naked or hidden singles. This is a helper, not a solver.

## Decisions

**1. One extra rule in `highlightLevel`, checked after `selected` and before the row/column/section test:**
```
if (!R.isNil(highlightValue) && isCellWithValue(cell)) return 'peer';
```
- **Order:** cells holding N are caught by the earlier `selected` rule, so they keep the darker style.
- **Pencil marks:** pencil-marked cells fail `isCellWithValue`, so their related or none style is unchanged.
- **Errors:** applied in `Cell`, and still override.

*Alternative:* have `useHighlight` return a list of blocked cell indices. Rejected: the rule depends only on the cell itself and `highlightValue`, which `highlightLevel` already has. Adding output to the hook would duplicate what the board already knows.

**2. Tests.**
- **E2E** (`e2e/cell-selection.spec.js`), with a seed of 7s at 0 and 40:
  - an entered value and a clue outside every 7's areas are peer
  - selecting an empty cell leaves a far-off filled cell white
  - the existing "stays unhighlighted" test still uses an empty cell
- **Unit:** none. `useHighlight` doesn't change, and `highlightLevel` lives in a component module. Its behavior is covered end-to-end, which is the project's pattern for `Board`.
- **Visual:** `single-selection.png` changes, because PUZZLE's clues outside the 8s' areas turn blue. Regenerate only that baseline at the current 0.05 threshold, review it, and explain in the commit. The "text color follows content" test in `visual.spec.js` also changes: it expected the entered value at cell 13 to stay white with an 8 selected. It now expects the peer background, with its text color still indigo.

## Risks / Trade-offs

- **[Late in a puzzle almost the whole board is blue]** → Intended. The few white cells are the candidates for N, and the selected 8s stay distinguishable by their darker blue.
- **[A filled cell in conflict with N]** → It still shows the error style, because errors take precedence.
