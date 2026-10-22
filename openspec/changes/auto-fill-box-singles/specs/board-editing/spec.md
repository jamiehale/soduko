# Spec Delta

## ADDED Requirements

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
Any board change by the player (setting a value, toggling marks, undo, redo, reset, or a new game) SHALL cancel any bulk set still pending. A new player value set SHALL start its own cascade. Changing the selection SHALL NOT cancel the cascade. A cascade SHALL NOT resume after the page reloads.

#### Scenario: Undo during the pause
- **WHEN** the player sets a value that leaves a box single and clicks undo within 500ms
- **THEN** the board is as it was before the value set, and no cell is auto-filled afterwards

#### Scenario: Mark toggle during the pause
- **WHEN** the player sets a value that leaves a box single and toggles a pencil mark within 500ms
- **THEN** no cell is auto-filled afterwards

#### Scenario: Selection change during the pause
- **WHEN** the player sets a value that leaves a box single and clicks another cell within 500ms
- **THEN** the box single is still filled 500ms after the value set
