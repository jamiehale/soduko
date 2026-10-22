## RENAMED Requirements

- FROM: `### Requirement: Clue cells are immutable`
- TO: `### Requirement: Given cells are immutable`

## MODIFIED Requirements

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

### Requirement: Reset the board
After the player confirms, Reset SHALL clear every player cell (values and marks), clear undo/redo history, and clear the selection. Cancelling SHALL leave everything unchanged.

#### Scenario: Confirmed reset
- **WHEN** the player clicks Reset and confirms in the dialog that warns "This will clear all your progress. Are you sure?"
- **THEN** all player cells are empty, given cells remain, undo and redo are disabled, and no cell is selected

#### Scenario: Cancelled reset
- **WHEN** the player clicks Reset and cancels
- **THEN** the board and history are unchanged
