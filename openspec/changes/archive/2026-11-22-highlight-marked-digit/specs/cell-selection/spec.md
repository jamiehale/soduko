# Spec Delta

## ADDED Requirements

### Requirement: Toggling a mark highlights its digit
When the player toggles pencil mark N or struck mark N on the selected cells, the board SHALL show the value highlighting for N, exactly as if a single cell holding N were selected, while the selected cells keep the selected style. This holds whether the toggle adds or removes the mark, for one cell or many, and during a drag. It SHALL NOT add an undo step beyond the toggle itself.

#### Scenario: Pencil mark on several cells
- **WHEN** cells 0 and 40 hold 7, the player drag-selects three empty cells in row 9, and types `7`
- **THEN** cells 0 and 40 are shown in the selected style
- **AND** the other cells in their rows, columns, and boxes are shown in the peer style
- **AND** the three selected cells are shown in the selected style

#### Scenario: Matching marks become related
- **WHEN** an empty cell outside every 7's row, column, and box has pencil mark 7, the player selects several other empty cells, and types `7`
- **THEN** that cell is shown in the related style

#### Scenario: Struck mark
- **WHEN** a cell holds 4, the player selects one empty cell, and holds Shift and types `4`
- **THEN** the cell holding 4 is shown in the selected style and the selected cell has struck mark 4

#### Scenario: Removing a mark
- **WHEN** the selected cells all have pencil mark 7, a cell holds 7, and the player types `7`
- **THEN** the selected cells no longer have pencil mark 7 and the cell holding 7 is shown in the selected style

#### Scenario: Pencil mark on one cell during a drag
- **WHEN** a cell holds 3, the player presses the mouse on an empty cell, types `3` while holding the button, and releases
- **THEN** the pressed cell has pencil mark 3, it is selected, and the cell holding 3 is shown in the selected style

#### Scenario: Struck mark on a cell holding a value
- **WHEN** the single selected cell holds 7, a cell holds 4, and the player holds Shift and types `4`
- **THEN** the cell holding 4 is shown in the selected style and the other cells holding 7 are not

#### Scenario: No cell holds the digit
- **WHEN** no cell holds 5, a cell holds 3, the player selects several empty cells, and types `5`
- **THEN** the cell holding 3 is shown in the peer style and no row, column, or box is highlighted for 5

### Requirement: Changing the marked digit highlight
With cells selected, toggling a mark of another digit SHALL switch the digit highlight to that digit, and toggling a mark of the highlighted digit again SHALL keep it. Setting or clearing a value on the single selected cell SHALL clear the digit highlight.

#### Scenario: Switch marked digits
- **WHEN** several cells are selected, the player types `7` and then `4`
- **THEN** the cells holding 4 are shown in the selected style and the cells holding 7 are not

#### Scenario: Same marked digit again
- **WHEN** several cells are selected, a cell holds 7, and the player types `7` twice
- **THEN** the cell holding 7 is shown in the selected style

#### Scenario: Setting a value after a struck mark
- **WHEN** a cell holds 4, the single selected cell is empty, the player holds Shift and types `4`, and then types `6`
- **THEN** the selected cell holds 6, the cells holding 6 are shown in the selected style, and the cell holding 4 is not

#### Scenario: Clearing a value after a struck mark
- **WHEN** the single selected cell holds player value 6, a cell holds 4, the player holds Shift and types `4`, and then types `6`
- **THEN** the selected cell is empty and the cell holding 4 is not shown in the selected style

## MODIFIED Requirements

### Requirement: Peer highlighting
If all selected cells share one row, that row's other cells SHALL be shown in the "peer" style. The same applies to a shared column and a shared box. A row, column, or box that the selected cells do not all share SHALL NOT be highlighted. While a digit highlight from toggling a mark shows, the rows, columns, and boxes of the cells holding that digit SHALL be highlighted instead of the selection's.

#### Scenario: Single cell peers
- **WHEN** a single cell is selected
- **THEN** every other cell in its row, column, and box is shown in the peer style

#### Scenario: Multi-cell selection in one row
- **WHEN** three cells in the same row but different boxes are selected
- **THEN** the rest of that row is shown in the peer style, and no column or box is highlighted

#### Scenario: Marked digit replaces the selection's areas
- **WHEN** three empty cells in row 1 and box 1 are selected, no cell in row 1 or box 1 holds 5, a cell at row 6 column 8 holds 5, and the player types `5`
- **THEN** the other cells in row 6, column 8, and that cell's box are shown in the peer style
- **AND** the unselected empty cells in row 1 and box 1 with no pencil mark 5 or struck mark 5 that share no row, column, or box with a cell holding 5 are not highlighted

### Requirement: Value highlighting
When exactly one cell is selected and it holds a value N (given or player), every other cell holding N SHALL be shown in the "selected" style. The row, column, and box of every cell holding N, every other cell holding a value, and every empty cell with struck mark N SHALL be shown in the "peer" style. Empty cells outside those areas with pencil mark N SHALL be shown in the "related" style. Selecting an empty or pencil-marked cell SHALL give no value highlighting.

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
- **WHEN** the player clicks a cell that has no value
- **THEN** only its own row, column, and box are shown in the peer style, and no value, mark, or filled-cell highlighting is applied

### Requirement: Changing or clearing the digit highlight
Typing a different digit while a digit is highlighted with no selection SHALL switch the highlight to that digit. Typing the highlighted digit again with no selection SHALL clear it. Pressing Escape, pressing the mouse on a cell, Reset, and New Game SHALL clear it. Releasing the mouse to end a drag SHALL NOT clear it. The digit highlight SHALL NOT be saved.

#### Scenario: Switch digits
- **WHEN** 7 is highlighted with no selection and the player types `4`
- **THEN** the cells holding 4 are shown in the selected style and the cells holding 7 are not

#### Scenario: Same digit again
- **WHEN** 7 is highlighted with no selection and the player types `7`
- **THEN** no cell is highlighted

#### Scenario: Escape
- **WHEN** 7 is highlighted with no selection and the player presses Escape
- **THEN** no cell is highlighted

#### Scenario: Escape after marking
- **WHEN** several cells are selected, the player types `7`, and then presses Escape
- **THEN** no cell is selected or highlighted

#### Scenario: Click a cell
- **WHEN** 7 is highlighted with no selection and the player clicks an empty cell
- **THEN** that cell is selected and only its own row, column, and box are shown in the peer style

#### Scenario: Click a cell after marking
- **WHEN** several cells are selected, the player types `7`, and then clicks an empty cell
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
