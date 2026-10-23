# cell-selection Specification

## Purpose

Defines how a player selects cells with the mouse and keyboard, and how the board highlights the selected cells, their row/column/box peers, and cells related by value.

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
Pressing Escape SHALL clear the selection and any digit highlight without changing the board.

#### Scenario: Escape
- **WHEN** cells are selected and the player presses Escape
- **THEN** no cell is selected and the board is unchanged

### Requirement: Selected cells are highlighted
Every selected cell SHALL be shown in the "selected" style.

#### Scenario: Selected style
- **WHEN** a cell is selected
- **THEN** it is shown with the selected background color

### Requirement: Peer highlighting
If all selected cells share one row, that row's other cells SHALL be shown in the "peer" style. The same applies to a shared column and a shared box. A row, column, or box that the selected cells do not all share SHALL NOT be highlighted.

#### Scenario: Single cell peers
- **WHEN** a single cell is selected
- **THEN** every other cell in its row, column, and box is shown in the peer style

#### Scenario: Multi-cell selection in one row
- **WHEN** three cells in the same row but different boxes are selected
- **THEN** the rest of that row is shown in the peer style, and no column or box is highlighted

### Requirement: Value highlighting
When exactly one cell is selected and it holds a value N (given or player), every other cell holding N SHALL be shown in the "selected" style. The row, column, and box of every cell holding N, every other cell holding a value, and every empty cell with struck mark N SHALL be shown in the "peer" style. Empty cells outside those areas with pencil mark N SHALL be shown in the "related" style. An empty or pencil-marked selected cell SHALL get no value highlighting.

#### Scenario: Matching values
- **WHEN** the single selected cell holds 7
- **THEN** all other cells holding 7 are shown in the selected style

#### Scenario: Peers of every matching value
- **WHEN** the single selected cell holds 7 and another cell holds 7 in a different row, column, and box
- **THEN** the other cells in that cell's row, column, and box are shown in the peer style, as are those of the selected cell

#### Scenario: Filled cells are blocked
- **WHEN** the single selected cell holds 7 and a cell outside every 7's row, column, and box holds a given or player value other than 7
- **THEN** that cell is shown in the peer style

#### Scenario: Struck marks are not related
- **WHEN** the single selected cell holds 7 and an empty cell outside every 7's row, column, and box has struck mark 7
- **THEN** that cell is shown in the peer style, not the related style

#### Scenario: Other struck digits don't block
- **WHEN** the single selected cell holds 7 and an empty cell outside every 7's row, column, and box has struck mark 4 and no mark 7
- **THEN** that cell is not highlighted

#### Scenario: Remaining placements stay unhighlighted
- **WHEN** the single selected cell holds 7
- **THEN** an empty cell that shares no row, column, or box with any cell holding 7, and has no pencil mark 7 or struck mark 7, is not highlighted

#### Scenario: Matching marks
- **WHEN** the single selected cell holds 7 and an empty cell sharing no row, column, or box with any cell holding 7 has pencil mark 7
- **THEN** that cell is shown in the related style

#### Scenario: Matching mark inside a projected area
- **WHEN** the single selected cell holds 7 and an empty cell with pencil mark 7 shares a column with another cell holding 7
- **THEN** that cell is shown in the peer style

#### Scenario: Empty cell selected
- **WHEN** the single selected cell has no value
- **THEN** only its own row, column, and box are shown in the peer style, and no value, mark, or filled-cell highlighting is applied

### Requirement: Errors take precedence over highlighting
A cell in conflict SHALL be shown in the error style whatever its selection or highlight state.

#### Scenario: Selected conflicting cell
- **WHEN** a cell in conflict is selected
- **THEN** it is shown with the error background color

### Requirement: Typing a digit with no selection highlights it
When no cell is selected and no mouse button is held, typing a digit N SHALL show the value highlighting for N, exactly as if a single cell holding N were selected. It SHALL NOT change the board or add an undo step. When no cell holds N, no row, column, or box is highlighted, but the filled-cell and matching-mark highlighting still apply.

#### Scenario: Matching values
- **WHEN** no cell is selected, cells 0 and 40 hold 7, and the player types `7`
- **THEN** cells 0 and 40 are shown in the selected style
- **AND** the other cells in their rows, columns, and boxes are shown in the peer style

#### Scenario: Filled cells and matching marks
- **WHEN** no cell is selected, cells hold 7, a cell outside every 7's row, column, and box holds 3, an empty cell outside those areas has pencil mark 7, and the player types `7`
- **THEN** the cell holding 3 is shown in the peer style and the cell with pencil mark 7 in the related style

#### Scenario: Struck marks are not related
- **WHEN** no cell is selected, an empty cell outside every 7's row, column, and box has struck mark 7, and the player types `7`
- **THEN** that cell is shown in the peer style, not the related style

#### Scenario: No cell holds the digit
- **WHEN** no cell holds 5, a cell holds 3, an empty cell has pencil mark 5, and with no cell selected the player types `5`
- **THEN** no cell is in the selected style, the cell holding 3 is in the peer style, the cell with pencil mark 5 is in the related style, and empty cells without mark 5 are not highlighted

#### Scenario: Board unchanged
- **WHEN** no cell is selected and the player types a digit
- **THEN** no cell's value or marks change and the undo button's enabled state does not change

### Requirement: Changing or clearing the digit highlight
Typing a different digit while a digit is highlighted SHALL switch the highlight to that digit. Typing the highlighted digit again SHALL clear it. Pressing Escape, pressing the mouse on a cell, Reset, and New Game SHALL clear it. The digit highlight SHALL NOT be saved.

#### Scenario: Switch digits
- **WHEN** 7 is highlighted with no selection and the player types `4`
- **THEN** the cells holding 4 are shown in the selected style and the cells holding 7 are not

#### Scenario: Same digit again
- **WHEN** 7 is highlighted with no selection and the player types `7`
- **THEN** no cell is highlighted

#### Scenario: Escape
- **WHEN** 7 is highlighted with no selection and the player presses Escape
- **THEN** no cell is highlighted

#### Scenario: Click a cell
- **WHEN** 7 is highlighted with no selection and the player clicks an empty cell
- **THEN** that cell is selected and only its own row, column, and box are shown in the peer style

#### Scenario: Deselecting does not bring it back
- **WHEN** 7 is highlighted, the player clicks a cell, and then clicks it again to deselect it
- **THEN** no cell is highlighted

#### Scenario: Typing with a selection after a click
- **WHEN** 7 is highlighted, the player clicks an empty player cell, and types `5`
- **THEN** that cell holds 5

#### Scenario: Reset
- **WHEN** 7 is highlighted with no selection and the player confirms Reset
- **THEN** no cell is highlighted

#### Scenario: Reload
- **WHEN** 7 is highlighted with no selection and the page reloads
- **THEN** no cell is highlighted

### Requirement: The digit highlight follows the board
While a digit N is highlighted, the highlighting SHALL reflect the current board, including after undo, redo, Fill pencil marks, and auto-filled values.

#### Scenario: Undo while highlighted
- **WHEN** a player cell holds 7, the player deselects it, types `7`, and clicks undo to remove that value
- **THEN** the cell is no longer shown in the selected style

#### Scenario: Auto-filled value
- **WHEN** a value set starts an auto-fill that places a 7, and the player deselects and types `7` before it fires
- **THEN** after the auto-fill the new 7 is shown in the selected style
