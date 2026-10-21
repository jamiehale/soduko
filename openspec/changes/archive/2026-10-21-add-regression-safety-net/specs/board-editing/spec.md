# Spec Delta

## Purpose

Defines how a player changes the board: entering cell values, toggling pencil marks, and undoing, redoing, or resetting their work. Clue cells from the puzzle cannot be changed.

## ADDED Requirements

### Requirement: Enter a value in a single selected cell
When exactly one cell is selected and no mouse button is held, typing a digit 1–9 SHALL set that digit as the cell's value. Any pencil marks in the cell are replaced.

#### Scenario: Set a value in an empty cell
- **WHEN** a single empty non-clue cell is selected and the player types `5`
- **THEN** the cell shows the value 5

#### Scenario: Replace an existing value
- **WHEN** a single non-clue cell containing 3 is selected and the player types `7`
- **THEN** the cell shows the value 7

#### Scenario: No selection
- **WHEN** no cell is selected and the player types a digit
- **THEN** the board does not change

### Requirement: Typing the same value clears it
Typing the value a non-clue cell already holds SHALL clear the cell, leaving it empty with no pencil marks.

#### Scenario: Toggle a value off
- **WHEN** a single non-clue cell containing 4 is selected and the player types `4`
- **THEN** the cell is empty and shows no pencil marks

### Requirement: Clue cells are immutable
Cells given by the puzzle SHALL NOT be changed by entering values or toggling marks, and such attempts SHALL NOT create an undo step.

#### Scenario: Type on a clue cell
- **WHEN** a single clue cell is selected and the player types a digit
- **THEN** the clue's value is unchanged and the undo button's enabled state does not change

#### Scenario: Marks skip clue cells
- **WHEN** a selection containing clue cells and empty cells receives a pencil-mark toggle
- **THEN** only the empty non-clue cells change

### Requirement: Setting a value clears related pencil marks
Setting value N in a cell SHALL remove pencil mark N from every non-clue, value-less cell in the same row, column, or 3×3 section.

#### Scenario: Peer marks removed
- **WHEN** cells in the same row, column, and section as cell X have pencil mark 6, and the player sets X to 6
- **THEN** none of those cells show pencil mark 6, and marks for other digits are unchanged
- **AND** cells outside X's row, column, and section keep their mark 6

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
After the player confirms, Reset SHALL clear every non-clue cell (values and marks), clear undo/redo history, and clear the selection. Cancelling SHALL leave everything unchanged.

#### Scenario: Confirmed reset
- **WHEN** the player clicks Reset and confirms in the dialog that warns "This will clear all your progress. Are you sure?"
- **THEN** all non-clue cells are empty, clues remain, undo and redo are disabled, and no cell is selected

#### Scenario: Cancelled reset
- **WHEN** the player clicks Reset and cancels
- **THEN** the board and history are unchanged
