# cell-selection Specification

## Purpose

Defines how a player selects cells with the mouse and keyboard, and how the board highlights the selected cells, their row/column/section peers, and cells related by value.

## Requirements

### Requirement: Click to select a cell
Pressing and releasing the mouse on a cell SHALL make that cell the only selected cell and replace any previous selection.

#### Scenario: Select one cell
- **WHEN** the player clicks a cell
- **THEN** only that cell is selected

#### Scenario: Replace selection
- **WHEN** several cells are selected and the player clicks a different cell
- **THEN** only the clicked cell is selected

### Requirement: Click a selected cell to deselect
Clicking the cell that is currently the only selected cell SHALL clear the selection.

#### Scenario: Deselect by clicking again
- **WHEN** exactly one cell is selected and the player clicks it again
- **THEN** no cell is selected

### Requirement: Drag to select multiple cells
Pressing the mouse on a cell and moving across other cells before releasing SHALL select every cell passed over, including the start and end cells. During the drag, the cells passed so far SHALL already count as selected.

#### Scenario: Drag across a row
- **WHEN** the player presses on row 1 column 1, drags through column 2, and releases on column 3
- **THEN** exactly those three cells are selected

#### Scenario: Hover without pressing
- **WHEN** the mouse moves over cells with no button pressed
- **THEN** the selection does not change

### Requirement: Escape clears the selection
Pressing Escape SHALL clear the selection without changing the board.

#### Scenario: Escape
- **WHEN** cells are selected and the player presses Escape
- **THEN** no cell is selected and the board is unchanged

### Requirement: Selected cells are highlighted
Every selected cell SHALL be shown in the "selected" style.

#### Scenario: Selected style
- **WHEN** a cell is selected
- **THEN** it is shown with the selected background color

### Requirement: Peer highlighting
If all selected cells share one row, that row's other cells SHALL be shown in the "peer" style. The same applies to a shared column and a shared 3×3 section. A row, column, or section that the selected cells do not all share SHALL NOT be highlighted.

#### Scenario: Single cell peers
- **WHEN** a single cell is selected
- **THEN** every other cell in its row, column, and section is shown in the peer style

#### Scenario: Multi-cell selection in one row
- **WHEN** three cells in the same row but different sections are selected
- **THEN** the rest of that row is shown in the peer style, and no column or section is highlighted

### Requirement: Value highlighting
When exactly one cell is selected and it holds a value N (clue or entered), every other cell holding N SHALL be shown in the "selected" style. The row, column, and 3×3 section of every cell holding N, and every other cell holding a value, SHALL be shown in the "peer" style. Empty cells outside those areas with pencil mark N SHALL be shown in the "related" style. An empty or pencil-marked selected cell SHALL get no value highlighting.

#### Scenario: Matching values
- **WHEN** the single selected cell holds 7
- **THEN** all other cells holding 7 are shown in the selected style

#### Scenario: Peers of every matching value
- **WHEN** the single selected cell holds 7 and another cell holds 7 in a different row, column, and section
- **THEN** the other cells in that cell's row, column, and section are shown in the peer style, as are those of the selected cell

#### Scenario: Filled cells are blocked
- **WHEN** the single selected cell holds 7 and a cell outside every 7's row, column, and section holds a clue or an entered value other than 7
- **THEN** that cell is shown in the peer style

#### Scenario: Remaining placements stay unhighlighted
- **WHEN** the single selected cell holds 7
- **THEN** an empty cell that shares no row, column, or section with any cell holding 7, and has no pencil mark 7, is not highlighted

#### Scenario: Matching marks
- **WHEN** the single selected cell holds 7 and an empty cell sharing no row, column, or section with any cell holding 7 has pencil mark 7
- **THEN** that cell is shown in the related style

#### Scenario: Matching mark inside a projected area
- **WHEN** the single selected cell holds 7 and an empty cell with pencil mark 7 shares a column with another cell holding 7
- **THEN** that cell is shown in the peer style

#### Scenario: Empty cell selected
- **WHEN** the single selected cell has no value
- **THEN** only its own row, column, and section are shown in the peer style, and no value, mark, or filled-cell highlighting is applied

### Requirement: Errors take precedence over highlighting
A cell in conflict SHALL be shown in the error style whatever its selection or highlight state.

#### Scenario: Selected conflicting cell
- **WHEN** a cell in conflict is selected
- **THEN** it is shown with the error background color
