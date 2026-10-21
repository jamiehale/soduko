# Spec Delta

## Purpose

Defines how a player selects cells with the mouse and keyboard, and how the board highlights the selected cells, their row/column/section peers, and cells related by value.

## ADDED Requirements

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
When exactly one cell is selected and it holds a value N (clue or entered), every other cell holding N SHALL be shown in the "selected" style. Cells that are not peers and have pencil mark N SHALL be shown in the "related" style.

#### Scenario: Matching values
- **WHEN** the single selected cell holds 7
- **THEN** all other cells holding 7 are shown in the selected style

#### Scenario: Matching marks
- **WHEN** the single selected cell holds 7 and a non-peer empty cell has pencil mark 7
- **THEN** that cell is shown in the related style

#### Scenario: Empty cell selected
- **WHEN** the single selected cell has no value
- **THEN** no value or mark highlighting is applied

### Requirement: Errors take precedence over highlighting
A cell in conflict SHALL be shown in the error style whatever its selection or highlight state.

#### Scenario: Selected conflicting cell
- **WHEN** a cell in conflict is selected
- **THEN** it is shown with the error background color
