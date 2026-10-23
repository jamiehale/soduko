# Spec Delta

## ADDED Requirements

### Requirement: Marks skip digits a peer holds
Adding pencil mark N or struck mark N SHALL skip every cell whose row, column, or box holds the value N, given or player, including a value in a conflict. Other selected cells SHALL get the mark as usual. Removing a mark SHALL never be skipped.

#### Scenario: One cell, digit held in its row
- **WHEN** the player holds the mouse on an empty cell whose row holds the value 8 and types `8`
- **THEN** the cell shows no pencil mark 8

#### Scenario: One cell, struck mark
- **WHEN** a single empty cell whose box holds the value 3 is selected and the player types Shift+3
- **THEN** the cell shows no struck mark 3

#### Scenario: Selection with some cells blocked
- **WHEN** the player drags across three empty cells, one of which shares a column with a cell holding 6, and types `6`
- **THEN** the other two cells show pencil mark 6 and that cell does not

#### Scenario: Player value counts
- **WHEN** a player cell holds 5 and the player selects an empty cell in its row and one outside its row, column, and box, and types Shift+5
- **THEN** only the cell outside shows struck mark 5

#### Scenario: Conflicting values count
- **WHEN** two cells in a row both hold 2 (a conflict) and the player marks an empty cell in that row with pencil mark 2
- **THEN** the cell shows no pencil mark 2

### Requirement: A mark toggle that changes nothing adds no undo step
A pencil-mark or struck-mark toggle that changes no cell, because every selected cell is skipped, is a given cell, or holds a value, SHALL NOT change the board, add an undo step, or clear the redo steps.

#### Scenario: Every selected cell blocked
- **WHEN** every selected empty cell has a peer holding 4 and the player types `4`
- **THEN** no cell changes and the undo button's enabled state does not change

#### Scenario: Only given cells selected
- **WHEN** the only selected cells are given cells and the player types a digit while several cells are selected
- **THEN** no cell changes and the undo button's enabled state does not change

#### Scenario: Redo kept
- **WHEN** the player undoes a change and then types a digit that every selected cell skips
- **THEN** redo is still enabled

## MODIFIED Requirements

### Requirement: Toggle pencil marks across a selection
When more than one cell is selected, or while the mouse button is held, typing a digit N SHALL toggle mark N on the selected cells that hold no value. Only the cells that can take mark N (no peer holds N) decide the toggle: if every one of them already has mark N, mark N is removed from every selected empty cell that has it. Otherwise it is added to the cells that can take it.

#### Scenario: Add a mark to several cells
- **WHEN** three empty cells are selected, none with mark 2, and the player types `2`
- **THEN** all three cells show pencil mark 2

#### Scenario: Mixed state adds
- **WHEN** two selected empty cells have mark 2 and a third does not, and the player types `2`
- **THEN** all three show mark 2

#### Scenario: All marked removes
- **WHEN** every selected empty cell has mark 2 and the player types `2`
- **THEN** none of them show mark 2

#### Scenario: Skipped cells don't block removal
- **WHEN** two selected empty cells have mark 2, a third selected empty cell has a peer holding 2, and the player types `2`
- **THEN** none of them show mark 2

#### Scenario: Mark a single cell by holding the mouse
- **WHEN** the player presses and holds the mouse on one empty cell and types `8`
- **THEN** that cell shows pencil mark 8 instead of the value 8

#### Scenario: Marks are ordered
- **WHEN** a cell receives marks 9, 1, then 5
- **THEN** its marks display in ascending order 1, 5, 9 in fixed positions

### Requirement: Toggle struck marks across a selection
Typing Shift plus a digit N SHALL toggle struck mark N on the selected cells that hold no value, whether one cell or many is selected, and while the mouse button is held. Only the cells that can take struck mark N (no peer holds N) decide the toggle: if every one of them already has struck mark N, it is removed from every selected empty cell that has it. Otherwise it is added to the cells that can take it. The physical digit key decides N, whatever character the keyboard layout gives with Shift.

#### Scenario: Strike a digit in one cell
- **WHEN** a single empty player cell is selected and the player types Shift+3
- **THEN** the cell shows struck mark 3 and holds no value

#### Scenario: Strike a digit in several cells
- **WHEN** the player drags across three empty cells, none with struck mark 2, and types Shift+2
- **THEN** all three cells show struck mark 2

#### Scenario: While the mouse is held
- **WHEN** the player presses and holds the mouse on one empty cell and types Shift+8
- **THEN** that cell shows struck mark 8

#### Scenario: Mixed state adds
- **WHEN** two selected empty cells have struck mark 2 and a third does not, and the player types Shift+2
- **THEN** all three show struck mark 2

#### Scenario: All marked removes
- **WHEN** every selected empty cell has struck mark 2 and the player types Shift+2
- **THEN** none of them show struck mark 2

#### Scenario: A struck mark on a digit a peer holds can be removed
- **WHEN** an empty cell has struck mark 6, a peer has since been given the value 6, and the player selects the cell and types Shift+6
- **THEN** the cell shows no struck mark 6

#### Scenario: Other marks are kept
- **WHEN** a selected empty cell has pencil marks 1 and 4 and the player types Shift+6
- **THEN** the cell shows pencil marks 1 and 4 and struck mark 6

#### Scenario: Cells with values are skipped
- **WHEN** a selection holds a given cell, a player cell with a value, and an empty player cell, and the player types Shift+5
- **THEN** only the empty player cell changes

#### Scenario: Nothing to change
- **WHEN** the only selected cells are given cells or hold values, and the player types Shift+5
- **THEN** the board does not change and no undo step is added
