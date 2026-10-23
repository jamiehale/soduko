# Spec Delta

## ADDED Requirements

### Requirement: Toggle struck marks across a selection
Typing Shift plus a digit N SHALL toggle struck mark N on the selected cells that hold no value, whether one cell or many is selected, and while the mouse button is held. If every such cell already has struck mark N, it is removed from all of them. Otherwise it is added to all of them. The physical digit key decides N, whatever character the keyboard layout gives with Shift.

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

#### Scenario: Other marks are kept
- **WHEN** a selected empty cell has pencil marks 1 and 4 and the player types Shift+6
- **THEN** the cell shows pencil marks 1 and 4 and struck mark 6

#### Scenario: Cells with values are skipped
- **WHEN** a selection holds a given cell, a player cell with a value, and an empty player cell, and the player types Shift+5
- **THEN** only the empty player cell changes

#### Scenario: Nothing to change
- **WHEN** the only selected cells are given cells or hold values, and the player types Shift+5
- **THEN** the board does not change and no undo step is added

### Requirement: A digit is a pencil mark or a struck mark, not both
In one empty player cell, each digit SHALL be a pencil mark, a struck mark, or neither. Adding struck mark N SHALL remove pencil mark N from that cell. Adding pencil mark N SHALL remove struck mark N from that cell.

#### Scenario: A struck mark replaces a pencil mark
- **WHEN** a selected empty cell has pencil mark 3 and the player types Shift+3
- **THEN** the cell shows struck mark 3 and no pencil mark 3

#### Scenario: Pencil mark replaces a struck mark
- **WHEN** the player presses and holds the mouse on an empty cell with struck mark 3 and types `3`
- **THEN** the cell shows pencil mark 3 and no struck mark 3

#### Scenario: A struck mark counts as unmarked for a pencil-mark toggle
- **WHEN** two selected empty cells have pencil mark 7, a third has struck mark 7, and the player types `7`
- **THEN** all three show pencil mark 7

### Requirement: A value replaces struck marks
Setting a value in a player cell SHALL remove all of that cell's struck marks, as it does its pencil marks. Typing the value the cell already holds SHALL leave it empty with no pencil marks and no struck marks. A struck mark SHALL NOT stop the player from setting that digit as the cell's value.

#### Scenario: Set the struck digit
- **WHEN** a single empty player cell with struck marks 2 and 5 is selected and the player types `5`
- **THEN** the cell holds 5

#### Scenario: Clear the value
- **WHEN** the player then types `5` again
- **THEN** the cell is empty with no pencil marks and no struck marks

### Requirement: Setting a value keeps struck marks in related cells
Setting value N in a cell SHALL NOT change the struck marks of any other cell.

#### Scenario: Peer keeps its struck mark
- **WHEN** a cell in the same row as cell X has struck mark 6 and the player sets X to 6
- **THEN** that cell still shows struck mark 6

### Requirement: Toggling struck marks is one undo step
Each Shift+digit toggle that changes the board SHALL add exactly one undo step and clear the redo steps. Undo SHALL restore every changed cell's pencil marks and struck marks; redo SHALL reapply the toggle.

#### Scenario: Undo a toggle
- **WHEN** the player selects three empty cells, one with pencil mark 4, types Shift+4, and clicks undo
- **THEN** none of the cells show struck mark 4, and the first shows pencil mark 4 again

#### Scenario: Redo a toggle
- **WHEN** the player undoes a struck toggle and clicks redo
- **THEN** the struck marks are shown again

### Requirement: Struck marks do not start auto-fill
A struck toggle SHALL cancel any bulk set still pending and SHALL NOT start a scan for box singles, even if it leaves box singles.

#### Scenario: Toggle leaves a box single
- **WHEN** a box has two cells with pencil mark 4, the player strikes 4 in one of them, and waits 500ms
- **THEN** the other cell still shows pencil mark 4 and holds no value

#### Scenario: Toggle during the pause
- **WHEN** the player sets a value that leaves a box single and types Shift+digit on a selected empty cell within 500ms
- **THEN** no cell is auto-filled afterwards

## MODIFIED Requirements

### Requirement: Auto-fill box singles after a value set
500ms after the player sets a value in a player cell, the board SHALL be scanned for box singles: a digit N that is a pencil mark in exactly one cell of a box whose cells hold no value N. A struck mark N SHALL NOT count as a pencil mark N. Every box single found SHALL be set at once (a bulk set), each as if the player had entered it. Toggling a value off, toggling marks, undo, and redo SHALL NOT start a scan.

#### Scenario: A value set leaves a box single
- **WHEN** cells X and Y in one box are the only cells there with pencil mark 4, and the player sets a peer of Y (outside that box) to 4
- **THEN** X still shows pencil mark 4 immediately after the player's value set
- **AND** 500ms later X holds the value 4

#### Scenario: Box singles across the board are set together
- **WHEN** a player value set leaves box singles in two different boxes
- **THEN** both cells receive their values at the same moment, 500ms after the player's value set

#### Scenario: Box single already present before the value set
- **WHEN** a box already has a single cell with pencil mark 7 and no value 7, and the player sets a value anywhere on the board
- **THEN** 500ms later that cell holds the value 7

#### Scenario: Digit already placed in the box
- **WHEN** a box holds the value 2, one of its empty cells still has pencil mark 2, and the player sets a value elsewhere
- **THEN** that cell is not auto-filled

#### Scenario: Struck marks don't count
- **WHEN** a box has one cell with pencil mark 7, other cells there with struck mark 7, no value 7, and the player sets a value elsewhere
- **THEN** 500ms later the cell with pencil mark 7 holds 7

#### Scenario: Only struck marks
- **WHEN** a box has no cell with pencil mark 7, exactly one cell with struck mark 7, no value 7, and the player sets a value elsewhere
- **THEN** that cell is not auto-filled

#### Scenario: Toggling a value off
- **WHEN** a box has a single cell with pencil mark 3, and the player types the value a selected player cell already holds
- **THEN** the cell with mark 3 is not auto-filled

#### Scenario: Toggling marks
- **WHEN** a mark toggle leaves a box with a single cell with pencil mark 5
- **THEN** that cell is not auto-filled

#### Scenario: No box singles
- **WHEN** the player sets a value and no box single exists afterwards
- **THEN** no other cell changes and the player's value set is the only new undo step

### Requirement: Player board changes cancel a pending cascade
Any board change by the player (setting a value, toggling pencil marks or struck marks, filling pencil marks, undo, redo, reset, or a new game) SHALL cancel any bulk set still pending. A new player value set SHALL start its own cascade. Changing the selection SHALL NOT cancel the cascade. A cascade SHALL NOT resume after the page reloads.

#### Scenario: Undo during the pause
- **WHEN** the player sets a value that leaves a box single and clicks undo within 500ms
- **THEN** the board is as it was before the value set, and no cell is auto-filled afterwards

#### Scenario: Mark toggle during the pause
- **WHEN** the player sets a value that leaves a box single and toggles a pencil mark within 500ms
- **THEN** no cell is auto-filled afterwards

#### Scenario: Fill pencil marks during the pause
- **WHEN** the player sets a value that leaves a box single and clicks Fill pencil marks within 500ms
- **THEN** no cell is auto-filled afterwards

#### Scenario: Selection change during the pause
- **WHEN** the player sets a value that leaves a box single and clicks another cell within 500ms
- **THEN** the box single is still filled 500ms after the value set

### Requirement: Filled pencil marks replace existing marks
Filling pencil marks SHALL replace each empty player cell's pencil marks with the computed marks, whatever pencil marks the cell had before. A cell's struck marks SHALL stay as they are, and a digit with a struck mark SHALL NOT be added as a pencil mark, even if the cell's row, column, and box allow it.

#### Scenario: Extra marks removed
- **WHEN** an empty player cell has pencil marks 1 and 4, its row holds a 4, and the player clicks Fill pencil marks
- **THEN** the cell does not show pencil mark 4

#### Scenario: Missing marks added
- **WHEN** an empty player cell has only pencil mark 2, and no cell in its row, column, or box holds 7
- **THEN** after the player clicks Fill pencil marks the cell shows pencil mark 7

#### Scenario: Struck marks kept
- **WHEN** an empty player cell has struck mark 3, no cell in its row, column, or box holds 3 or 6, and the player clicks Fill pencil marks
- **THEN** the cell shows struck mark 3, no pencil mark 3, and pencil mark 6

#### Scenario: Struck mark for a digit a peer holds
- **WHEN** an empty player cell has struck mark 3, its row holds a 3, and the player clicks Fill pencil marks
- **THEN** the cell still shows struck mark 3

#### Scenario: Undo restores pencil marks around struck marks
- **WHEN** the player clicks Fill pencil marks on a board with struck marks and clicks undo
- **THEN** every cell shows the pencil marks and struck marks it had before the click
