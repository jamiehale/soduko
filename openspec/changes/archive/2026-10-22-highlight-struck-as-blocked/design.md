# Design

## Context

- `highlightLevel` in `src/Board.jsx` picks each cell's style. In order:
  - `selected`: matching value or selected cell
  - `peer`: any filled cell while a value is highlighted
  - `peer`: inside a projected row, column, or box
  - `related`: pencil mark of the highlighted value
- `cellHasStrike(mark, cell)` exists in `src/util/cell.js` (from `add-struck-marks`) and is false for cells without the `strikes` key.
- A digit is never both a pencil mark and a struck mark in one cell, so a cell with struck mark N can't also qualify for `related` through N.

## Goals / Non-Goals

**Goals:**
- One-line rule change in the existing precedence, with no new style or color.

**Non-Goals:**
- No change to `useHighlight`, the theme, or how struck marks are drawn.

## Decisions

### 1. Extend the "filled cells are blocked" check

Change the filled-cell condition to: a value is highlighted, and the cell either holds a value or has a struck mark of that value (`isCellWithValue(cell) || cellHasStrike(highlightValue, cell)`). Update the comment to say both kinds of cell can't take the selected value. Because the check runs before the area and related checks, the result doesn't depend on where the cell sits.

*Alternative:* a new `blocked` style with its own color. Rejected: the player asked for the peer style, and the spec's color table and every baseline would change.

### 2. The typed-digit highlight gets this for free

`add-digit-highlight` feeds the same `highlightValue` into `highlightLevel`, so no extra code is needed there. Its "Struck marks are not related" scenario has to change to expect the peer style, the same way this change rewrites that scenario in the main spec. That edit belongs to that change's artifacts and is listed in this change's tasks.

## Risks / Trade-offs

- [A struck cell outside N's areas now looks the same as a projected peer, so the player can't tell "ruled out by me" from "ruled out by a value" by color alone] → The red strike in the cell tells them apart, and the player asked for the peer style.
- [The `struck-marks.png` baseline changes] → Regenerate it and check that cell 71 is the only difference.

## Migration Plan

No data migration. Deploy is the normal push to `main`; rollback is reverting the commit.
