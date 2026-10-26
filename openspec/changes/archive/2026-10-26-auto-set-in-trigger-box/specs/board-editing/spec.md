# Spec Delta

## MODIFIED Requirements

### Requirement: Auto-set box singles after a value set
500ms after the player sets a value, the box holding that cell (the trigger box) SHALL be scanned for box singles: a digit N that is a pencil mark in exactly one cell of the trigger box, where no cell of that box holds N. A struck mark N SHALL NOT count as a pencil mark N. Every box single found there SHALL be set at once (a bulk set), each as if the player had entered it; box singles in other boxes SHALL NOT be set. Toggling a value off, toggling marks, undo, and redo SHALL NOT start a scan.

#### Scenario: A value set leaves a box single
- **WHEN** cells X and Y in one box are the only cells there with pencil mark 6, and the player sets Y to 4
- **THEN** X still shows pencil mark 6 immediately after the player's value set
- **AND** 500ms later X holds the value 6

#### Scenario: Box singles across the board are set together
- **WHEN** a player value set leaves a box single in the trigger box and another in a different box
- **THEN** 500ms later only the cell in the trigger box holds its value

#### Scenario: Box singles in the trigger box are set together
- **WHEN** a player value set leaves two box singles, for different digits, in the trigger box
- **THEN** both cells receive their values at the same moment, 500ms after the player's value set

#### Scenario: Box single already present before the value set
- **WHEN** a box already has a single cell with pencil mark 7 and no value 7, and the player sets a value in another cell of that box
- **THEN** 500ms later that cell holds the value 7

#### Scenario: Singles in other boxes are left
- **WHEN** a box other than the trigger box has a single cell with pencil mark 7 and no value 7, and the player sets a value in the trigger box
- **THEN** that cell still shows pencil mark 7 and holds no value

#### Scenario: Singles the value set creates elsewhere are left
- **WHEN** cells X and Y in one box are the only cells there with pencil mark 4, and the player sets a cell in Y's row, outside that box, to 4
- **THEN** X still shows pencil mark 4 and holds no value after 500ms

#### Scenario: Digit already placed in the box
- **WHEN** the trigger box holds the value 2, one of its empty cells still has pencil mark 2, and the player sets a value in that box
- **THEN** that cell is not auto-set

#### Scenario: Struck marks don't count
- **WHEN** the trigger box has one cell with pencil mark 7, other cells there with struck mark 7, no value 7, and the player sets a value in that box
- **THEN** 500ms later the cell with pencil mark 7 holds 7

#### Scenario: Only struck marks
- **WHEN** the trigger box has no cell with pencil mark 7, exactly one cell with struck mark 7, no value 7, and the player sets a value in that box
- **THEN** that cell is not auto-set

#### Scenario: Toggling a value off
- **WHEN** a box has a single cell with pencil mark 3, and the player clears a player value in that box by typing it again
- **THEN** the cell with mark 3 is not auto-set

#### Scenario: Toggling marks
- **WHEN** a mark toggle leaves a box with a single cell with pencil mark 5
- **THEN** that cell is not auto-set

#### Scenario: No box singles
- **WHEN** the player sets a value and the trigger box has no box single afterwards
- **THEN** no other cell changes and the player's value set is the only new undo step

### Requirement: Bulk sets cascade
500ms after each bulk set, the trigger box of the player's value set SHALL be scanned again, and any new box singles there SHALL be set in another bulk set. The cascade SHALL end when a scan of the trigger box finds no box singles. Box singles a bulk set leaves in other boxes SHALL NOT be set.

#### Scenario: Second round
- **WHEN** a bulk set fills a cell of the trigger box, and that cell's other pencil marks were what kept another digit from being single there
- **THEN** 500ms after that bulk set the cell left with that digit holds it

#### Scenario: Cascade stays in the trigger box
- **WHEN** a bulk set clears a mark in a cell outside the trigger box, leaving a box single in that other box
- **THEN** that cell still holds no value after a further 500ms

#### Scenario: Cascade ends
- **WHEN** a scan of the trigger box after a bulk set finds no box singles
- **THEN** no further cells change

### Requirement: Conflicts stop the cascade
A bulk set SHALL set its box singles even if that creates a conflict, which shows in the conflict style. No bulk set SHALL run while the board has a conflict: the cascade ends after a bulk set that leaves a conflict, and does not start after a player value set that leaves one.

#### Scenario: Bulk set creates a conflict
- **WHEN** a pencil mark 5 in the trigger box is a box single, but that cell's row already holds 5 (a mark left from an older save)
- **THEN** after the bulk set the cell holds 5 and both 5s show in the conflict style
- **AND** no further bulk set runs, even if box singles remain

#### Scenario: Player value set leaves a conflict
- **WHEN** the player sets a value that conflicts with another cell and the trigger box has a box single
- **THEN** the box single is not auto-set

#### Scenario: Undo out of a conflict
- **WHEN** a bulk set created a conflict and the player clicks undo
- **THEN** the conflict is gone and the board is as it was before that bulk set
