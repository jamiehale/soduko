# board-editing Specification

## Purpose

Defines how a player changes the board: entering cell values, toggling pencil marks, and undoing, redoing, or resetting their work. Given cells, populated from the puzzle, cannot be changed.

## Requirements

### Requirement: Enter a value in a single selected cell
When exactly one player cell is selected and no mouse button is held, typing a digit 1–9 SHALL set that digit as the cell's value. Any pencil marks in the cell are replaced.

#### Scenario: Set a value in an empty cell
- **WHEN** a single empty player cell is selected and the player types `5`
- **THEN** the cell shows the value 5

#### Scenario: Replace an existing value
- **WHEN** a single player cell containing 3 is selected and the player types `7`
- **THEN** the cell shows the value 7

#### Scenario: No selection
- **WHEN** no cell is selected and the player types a digit
- **THEN** the board does not change

### Requirement: Typing the same value clears it
Typing the value a player cell already holds SHALL clear the cell, leaving it empty with no pencil marks.

#### Scenario: Toggle a value off
- **WHEN** a single player cell containing 4 is selected and the player types `4`
- **THEN** the cell is empty and shows no pencil marks

### Requirement: Given cells are immutable
Given cells, populated from the puzzle, SHALL NOT be changed by entering values or toggling marks, and such attempts SHALL NOT create an undo step.

#### Scenario: Type on a given cell
- **WHEN** a single given cell is selected and the player types a digit
- **THEN** the given value is unchanged and the undo button's enabled state does not change

#### Scenario: Marks skip given cells
- **WHEN** a selection containing given cells and empty player cells receives a pencil-mark toggle
- **THEN** only the empty player cells change

### Requirement: Setting a value clears related pencil marks
Setting value N in a cell SHALL remove pencil mark N from every empty player cell in the same row, column, or box.

#### Scenario: Peer marks removed
- **WHEN** cells in the same row, column, and box as cell X have pencil mark 6, and the player sets X to 6
- **THEN** none of those cells show pencil mark 6, and marks for other digits are unchanged
- **AND** cells outside X's row, column, and box keep their mark 6

### Requirement: Toggle pencil marks across a selection
When more than one cell is selected, or while the mouse button is held, typing a digit N SHALL toggle mark N on the selected cells that hold no value. If every such cell already has mark N, the mark is removed from all of them. Otherwise it is added to all of them.

#### Scenario: Add a mark to several cells
- **WHEN** three empty cells are selected, none with mark 2, and the player types `2`
- **THEN** all three cells show pencil mark 2

#### Scenario: Mixed state adds
- **WHEN** two selected empty cells have mark 2 and a third does not, and the player types `2`
- **THEN** all three show mark 2

#### Scenario: All marked removes
- **WHEN** every selected empty cell has mark 2 and the player types `2`
- **THEN** none of them show mark 2

#### Scenario: Mark a single cell by holding the mouse
- **WHEN** the player presses and holds the mouse on one empty cell and types `8`
- **THEN** that cell shows pencil mark 8 instead of the value 8

#### Scenario: Marks are ordered
- **WHEN** a cell receives marks 9, 1, then 5
- **THEN** its marks display in ascending order 1, 5, 9 in fixed positions

### Requirement: Undo and redo
Each change to the board SHALL be undoable and redoable without limit within a game. A new change after an undo SHALL discard the redo steps. The undo and redo buttons SHALL be disabled when there is nothing to undo or redo.

#### Scenario: Undo a value
- **WHEN** the player sets a value and clicks undo
- **THEN** the board returns to its previous state and redo becomes enabled

#### Scenario: Redo
- **WHEN** the player undoes a change and clicks redo
- **THEN** the change is reapplied

#### Scenario: New change clears redo
- **WHEN** the player undoes a change and then makes a different change
- **THEN** redo is disabled

#### Scenario: Fresh game
- **WHEN** a new game has just started
- **THEN** undo and redo are both disabled

### Requirement: Reset the board
After the player confirms, Reset SHALL clear every player cell (values and marks), clear undo/redo history, and clear the selection. Cancelling SHALL leave everything unchanged.

#### Scenario: Confirmed reset
- **WHEN** the player clicks Reset and confirms in the dialog that warns "This will clear all your progress. Are you sure?"
- **THEN** all player cells are empty, given cells remain, undo and redo are disabled, and no cell is selected

#### Scenario: Cancelled reset
- **WHEN** the player clicks Reset and cancels
- **THEN** the board and history are unchanged

### Requirement: Auto-fill box singles after a value set
500ms after the player sets a value in a player cell, the board SHALL be scanned for box singles: a digit N that is a pencil mark in exactly one cell of a box whose cells hold no value N. Every box single found SHALL be set at once (a bulk set), each as if the player had entered it. Toggling a value off, toggling marks, undo, and redo SHALL NOT start a scan.

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

#### Scenario: Toggling a value off
- **WHEN** a box has a single cell with pencil mark 3, and the player types the value a selected player cell already holds
- **THEN** the cell with mark 3 is not auto-filled

#### Scenario: Toggling marks
- **WHEN** a mark toggle leaves a box with a single cell with pencil mark 5
- **THEN** that cell is not auto-filled

#### Scenario: No box singles
- **WHEN** the player sets a value and no box single exists afterwards
- **THEN** no other cell changes and the player's value set is the only new undo step

### Requirement: Auto-filled values clear related pencil marks
Each value set by a bulk set SHALL remove that digit's pencil mark from every empty player cell in the same row, column, or box, as a player-entered value does.

#### Scenario: Marks cleared by an auto-filled value
- **WHEN** a bulk set fills cell X with 4 and a cell in X's row has pencil marks 4 and 9
- **THEN** that cell shows only pencil mark 9

### Requirement: A cell that is a box single for two digits takes the lower digit
When one cell is the only cell in its box with pencil mark N and also the only one with pencil mark M, a bulk set SHALL give it the lower of N and M.

#### Scenario: Two digits single in one cell
- **WHEN** a cell is the only cell in its box with pencil mark 3 and the only one with pencil mark 8
- **THEN** the bulk set fills it with 3

### Requirement: Bulk sets cascade
500ms after each bulk set, the board SHALL be scanned again, and any new box singles SHALL be set in another bulk set. The cascade SHALL end when a scan finds no box singles.

#### Scenario: Second round
- **WHEN** a bulk set clears marks so that another box is left with a single cell with pencil mark 6
- **THEN** 500ms after that bulk set the cell holds 6

#### Scenario: Cascade ends
- **WHEN** a scan after a bulk set finds no box singles
- **THEN** no further cells change

### Requirement: Each bulk set is one undo step
A bulk set SHALL add exactly one undo step. Undoing it SHALL restore every cell it changed, including the auto-filled cells' pencil marks and the marks it cleared from related cells. Redo SHALL reapply it. Undo and redo SHALL NOT start a new cascade.

#### Scenario: Undo a bulk set
- **WHEN** a bulk set fills two cells and the player clicks undo once
- **THEN** both cells show their previous pencil marks, the related marks the bulk set cleared are back, and the player's value set remains

#### Scenario: Undo back to the player's value
- **WHEN** a player value set triggered one bulk set and the player clicks undo twice
- **THEN** the board is as it was before the player's value set

#### Scenario: Redo a bulk set
- **WHEN** the player undoes a bulk set and clicks redo
- **THEN** the bulk set's values are reapplied and no further cells change after 500ms

### Requirement: Conflicts stop the cascade
A bulk set SHALL set its box singles even if that creates a conflict, which shows in the conflict style. No bulk set SHALL run while the board has a conflict: the cascade ends after a bulk set that leaves a conflict, and does not start after a player value set that leaves one.

#### Scenario: Bulk set creates a conflict
- **WHEN** incorrect pencil marks make a bulk set fill two cells in one row with 5
- **THEN** both cells hold 5 and show in the conflict style
- **AND** no further bulk set runs, even if box singles remain

#### Scenario: Player value set leaves a conflict
- **WHEN** the player sets a value that conflicts with another cell and a box single exists
- **THEN** the box single is not auto-filled

#### Scenario: Undo out of a conflict
- **WHEN** a bulk set created a conflict and the player clicks undo
- **THEN** the conflict is gone and the board is as it was before that bulk set

### Requirement: Player board changes cancel a pending cascade
Any board change by the player (setting a value, toggling marks, filling pencil marks, undo, redo, reset, or a new game) SHALL cancel any bulk set still pending. A new player value set SHALL start its own cascade. Changing the selection SHALL NOT cancel the cascade. A cascade SHALL NOT resume after the page reloads.

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

### Requirement: Fill pencil marks
The control row SHALL have a Fill pencil marks icon button. Clicking it SHALL give every empty player cell the pencil marks of each digit 1–9 that no cell in its row, column, or box holds as a value, given or player. Given cells and player cells with a value SHALL NOT change. The selection SHALL NOT change.

#### Scenario: Marks follow the row, column, and box
- **WHEN** an empty player cell's row, column, and box together hold the values 1, 2, 5, 8, and 9, and the player clicks Fill pencil marks
- **THEN** the cell shows pencil marks 3, 4, 6, and 7

#### Scenario: Every empty cell is filled
- **WHEN** a puzzle has just been loaded and the player clicks Fill pencil marks
- **THEN** every empty player cell shows pencil marks, and every given cell is unchanged

#### Scenario: Player values count and are kept
- **WHEN** a player cell holds 6 and the player clicks Fill pencil marks
- **THEN** that cell still holds 6, and no empty cell in its row, column, or box shows pencil mark 6

#### Scenario: Empty board
- **WHEN** the board has no values and the player clicks Fill pencil marks
- **THEN** every cell shows pencil marks 1 through 9

#### Scenario: Selection is kept
- **WHEN** some cells are selected and the player clicks Fill pencil marks
- **THEN** the same cells are still selected

### Requirement: Filled pencil marks replace existing marks
Filling pencil marks SHALL replace each empty player cell's pencil marks with the computed marks, whatever marks the cell had before.

#### Scenario: Extra marks removed
- **WHEN** an empty player cell has pencil marks 1 and 4, its row holds a 4, and the player clicks Fill pencil marks
- **THEN** the cell does not show pencil mark 4

#### Scenario: Missing marks added
- **WHEN** an empty player cell has only pencil mark 2, and no cell in its row, column, or box holds 7
- **THEN** after the player clicks Fill pencil marks the cell shows pencil mark 7

### Requirement: A cell with no possible digit gets no marks
When every digit 1–9 is held as a value somewhere in an empty player cell's row, column, or box, filling pencil marks SHALL leave that cell with no pencil marks. Values that are part of a conflict SHALL count like any other value, and filling SHALL work while the board has a conflict.

#### Scenario: No digit possible
- **WHEN** an empty player cell with pencil marks 3 and 5 sees every digit 1–9 in its row, column, and box, and the player clicks Fill pencil marks
- **THEN** that cell shows no pencil marks, and other empty cells are filled as usual

#### Scenario: Board with a conflict
- **WHEN** two cells in one row hold 5 (a conflict) and the player clicks Fill pencil marks
- **THEN** the conflict still shows in the conflict style, and no empty cell in that row shows pencil mark 5

### Requirement: Filling pencil marks is one undo step
Filling pencil marks SHALL add exactly one undo step and clear the redo steps. Undoing it SHALL restore every cell's previous pencil marks; redo SHALL reapply the filled marks. A click that would change no cell SHALL NOT change the board or add an undo step.

#### Scenario: Undo a fill
- **WHEN** the player has hand-marked some cells, clicks Fill pencil marks, and clicks undo once
- **THEN** every cell shows exactly the pencil marks it had before the click

#### Scenario: Redo a fill
- **WHEN** the player undoes a fill and clicks redo
- **THEN** every empty player cell shows the filled marks again

#### Scenario: Nothing to change
- **WHEN** the player clicks Fill pencil marks twice in a row
- **THEN** the second click changes nothing, and one undo returns the board to before the first click

#### Scenario: Fill clears redo
- **WHEN** the player undoes a value set and then clicks Fill pencil marks
- **THEN** redo is disabled

### Requirement: Filling pencil marks does not start auto-fill
Filling pencil marks SHALL NOT start a scan for box singles, even if the new marks leave box singles. The player's next value set SHALL scan as usual.

#### Scenario: Box singles left by a fill
- **WHEN** a fill leaves a box with a single cell with pencil mark 4 and the player waits 500ms
- **THEN** that cell still shows pencil marks and holds no value
