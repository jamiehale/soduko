## MODIFIED Requirements

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
The rendered app SHALL match the committed baseline screenshots, within the comparison tolerance, for: the empty board; a board loaded from a puzzle with a single selection showing peer, value, and related highlighting; a multi-cell selection; marks; a conflict; the solved state; and each dialog (New Game Stock and Custom tabs, Reset confirmation, Help). Any intended visual change SHALL update the baselines explicitly.

#### Scenario: Screenshot comparison
- **WHEN** the visual test suite runs against the app
- **THEN** every screenshot matches its committed baseline
