# Spec Delta

## Purpose

Fixes the app's visual design: page layout, board geometry, and the color for each cell state. Upgrades must not change how the app looks.

## ADDED Requirements

### Requirement: Page layout
The page SHALL show, top to bottom: the title "soduko" with the italic subtitle "(suh-doo-ko)" right-aligned beneath it; the board; then a control row. The control row has New and Reset on the left, the "Solved" indicator in the center, and help, undo, and redo icon buttons on the right. A GitHub link SHALL point to `https://github.com/jamiehale/soduko`.

#### Scenario: Initial page
- **WHEN** the app loads
- **THEN** the title, board, control row, and GitHub link are visible in that arrangement

### Requirement: Board geometry
The board SHALL be a 9×9 grid of 50px square cells. Lines between cells SHALL be 1px light grey, and the outer edge and 3×3 section boundaries SHALL be 3px dark grey. Clues and entered values are shown in large type (2rem). Pencil marks are shown small, each digit in a fixed position of a 3×3 sub-grid inside the cell.

#### Scenario: Section borders
- **WHEN** the board is displayed
- **THEN** thick borders separate the nine 3×3 sections and surround the board

### Requirement: Cell state colors
Cells SHALL use these text and background colors:

| State | Text | Background |
|---|---|---|
| Clue | black | white |
| Entered value / marks | #3f51b5 | white |
| Selected (or same value) | white | #aaf |
| Peer | #3f51b5 | #ddf |
| Related mark | #3f51b5 | #ffff44 |
| Error | white | #ff5252 |

Interactive controls SHALL keep their existing colors (indigo #3f51b5 primary, matching the board text).

#### Scenario: Error color
- **WHEN** a cell is in conflict
- **THEN** its background is #ff5252

#### Scenario: Peer color
- **WHEN** a single cell is selected
- **THEN** its non-selected peers have background #ddf

### Requirement: Visual baselines are preserved
The rendered app SHALL match the v0.2.2 baseline screenshots, within the comparison tolerance, for: the empty board; a puzzle with a single selection showing peer, value, and related highlighting; a multi-cell selection; marks; a conflict; the solved state; and each dialog (New Game Stock and Custom tabs, Reset confirmation, Help). Any intended visual change SHALL update the baselines explicitly.

#### Scenario: Screenshot comparison
- **WHEN** the visual test suite runs against the app
- **THEN** every screenshot matches its committed baseline
