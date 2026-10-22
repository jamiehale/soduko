# Design

## Context

- **`useHighlight(selectedCells, board)`** (`src/hooks/highlight.js`) is a plain function called on every render. It returns `{ highlightRow, highlightColumn, highlightSection, highlightValue }`, each a single index or `undefined`. Each of row, column, and section is set only when every selected cell shares it. `highlightValue` is set only for a single selected cell holding a value.
- **`highlightLevel`** in `src/Board.jsx` maps each cell to a style, in this order:
  1. `selected`: the cell is selected, or holds `highlightValue`
  2. `peer`: the cell's row, column, or section matches
  3. `related`: the cell has mark `highlightValue`
  4. none

  Error precedence is applied afterwards in `Cell`.
- **Unit tests** (`src/hooks/__tests__/highlight.test.js`) assert the exact returned object with `toStrictEqual`.

## Goals / Non-Goals

**Goals:**
- The peer areas of every cell holding the selected value, with no change to the styles, colors, or their precedence.

**Non-Goals:**
- Extending the projection to multi-cell selections, or to a selected cell's pencil marks.
- A distinct color for the projected areas. They use the existing peer style, as the user asked ("those blue affected rows and columns").

## Decisions

**1. The highlight result holds sets of rows, columns, and sections.**
`useHighlight` returns `{ highlightRows, highlightColumns, highlightSections, highlightValue }`, where the first three are arrays (empty when nothing is highlighted). `highlightLevel` tests membership with `R.includes`.
- **Multi-cell selection:** the shared row, column, or section, if any, becomes a one-element array. The behavior is unchanged.
- **Single empty or marked cell:** its own row, column, and section.
- **Single cell holding N:** the unique rows, columns, and sections of every cell whose value is N. `isCellWithValue` and `getCellValue` already cover both clues and entered values. The selected cell is one of those cells, so its own areas are included.

*Alternative:* return a precomputed set of peer cell indices. Rejected: it moves the board geometry into the hook's output, and the row/column/section form keeps the hook's tests readable.

*Alternative:* keep the scalar fields and add `extraRows` and similar. Rejected: two ways to say the same thing, and `Board` would have to merge them.

**2. Precedence stays as is.**
- A cell holding N stays `selected`, even though it now lies inside its own projected areas.
- A mark-N cell inside any projected area becomes `peer`. In practice this rarely happens, because entering N clears mark N from that cell's row, column, and section. It can happen with clues, or when a mark was added after N was entered.
- Errors still win.

**3. Tests.**
- **Unit:** update the existing expectations to the array shape. Add cases for:
  - two cells holding the same value in different rows, columns, and sections (union of both)
  - several values in one row (no duplicate rows)
  - a clue plus an entered value
- **E2E (`cell-selection.spec.js`):**
  - add a scenario that checks a cell in the other 7's row, column, and section is peer, and a cell outside all of them is white
  - the existing "related" test seeds 7s at 0 and 40, and asserts cell 72 (column 0) is white; with this change it becomes peer, so update the assertion and its comment
- **Visual:** `single-selection.png` changes, because cell 1 holds 8 and 8s elsewhere now project. Regenerate only that baseline. Review the new PNG against the spec, and say why in the commit. The other 11 baselines must not change.
- **Screenshot threshold:** at Playwright's default per-pixel `threshold` of 0.2, `#ddf` and `#ffff44` count as white, so the visual suite passed unchanged with the new highlighting. The suite had never detected peer or related highlighting, though the `board-appearance` baseline requirement relies on it. The threshold is set to 0.05 in `playwright.config.js`. At 0.05 the old code passes all 14 baselines and the new code fails only `single-selection.png`. CI confirms the GitHub runner also passes at 0.05.

## Risks / Trade-offs

- **[A value placed many times turns most of the board blue]** → That is the point: the white cells left are the candidates. The selected and related styles stay distinguishable from peer by color.
- **[Mark-N cells inside projected areas lose their yellow highlight]** → Consistent with the existing rule that peer outranks related. Recorded in the spec delta.
