# board-appearance Specification

## Purpose

Fixes the app's visual design: page layout, board geometry, and the color for each cell state. Upgrades must not change how the app looks.

## Requirements

### Requirement: Page layout
The page SHALL show, top to bottom: the title "soduko" with the italic subtitle "(suh-doo-ko)" right-aligned beneath it; the board; then a control row. The control row has New and Reset on the left, the "Solved" indicator in the center, and help, undo, and redo icon buttons on the right. A GitHub link SHALL point to `https://github.com/jamiehale/soduko`.

#### Scenario: Initial page
- **WHEN** the app loads
- **THEN** the title, board, control row, and GitHub link are visible in that arrangement

### Requirement: Board geometry
The board SHALL be a 9×9 grid of 50px square cells. Lines between cells SHALL be 1px light grey, and the outer edge and 3×3 box boundaries SHALL be 3px dark grey. Given and player values are shown in large type (2rem). Pencil marks are shown small, each digit in a fixed position of a 3×3 layout inside the cell.

#### Scenario: Box borders
- **WHEN** the board is displayed
- **THEN** thick borders separate the nine 3×3 boxes and surround the board

### Requirement: Cell state colors
A cell's text color SHALL depend only on its content: given values black, player values and pencil marks #3f51b5. Its background SHALL depend only on its state, in this order of precedence:

| State | Background |
|---|---|
| Error | #ff5252 |
| Selected (or same value as the single selection) | #aaf |
| Peer | #ddf |
| Related mark | #ffff44 |
| None | white |

Highlighting and errors SHALL NOT change text color. Interactive controls SHALL keep their existing colors.

#### Scenario: Error color
- **WHEN** a given cell is in conflict
- **THEN** its background is #ff5252 and its text stays black

#### Scenario: Peer color
- **WHEN** a single cell is selected
- **THEN** its non-selected peers have background #ddf

#### Scenario: Player value text
- **WHEN** a cell holding a player value is selected
- **THEN** its text stays #3f51b5 on the #aaf background

### Requirement: Visual baselines are preserved
The rendered app SHALL match the committed baseline screenshots, within the comparison tolerance, for: the empty board; a board loaded from a puzzle with a single selection showing peer, value, and related highlighting; a multi-cell selection; marks; struck marks next to pencil marks; a conflict; the solved state; and each dialog (New Game Stock and Custom tabs, Reset confirmation, Help). Any intended visual change SHALL update the baselines explicitly.

#### Scenario: Screenshot comparison
- **WHEN** the visual test suite runs against the app
- **THEN** every screenshot matches its committed baseline

### Requirement: Struck marks are struck out
A struck mark SHALL be shown in its digit's pencil-mark position, at pencil-mark size and in the pencil-mark color (#3f51b5), with a red (#ff0000) horizontal line through it. Pencil marks SHALL have no line. A cell may show pencil marks and struck marks together.

#### Scenario: Struck-out digit
- **WHEN** an empty cell has struck mark 5
- **THEN** a 5 is shown in the center position of the cell's 3×3 mark layout, colored #3f51b5, with a red line through it

#### Scenario: Mixed marks
- **WHEN** an empty cell has pencil marks 1 and 9 and struck mark 4
- **THEN** 1 and 9 are shown without a line, and 4 is shown with a red line through it
