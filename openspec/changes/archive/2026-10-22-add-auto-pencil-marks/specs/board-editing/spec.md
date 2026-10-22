# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
