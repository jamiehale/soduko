# Spec Delta

## MODIFIED Requirements

### Requirement: Setting a value clears related pencil marks
Setting value N in a cell SHALL remove pencil mark N and struck mark N from every empty player cell in the same row, column, or box.

#### Scenario: Peer marks removed
- **WHEN** cells in the same row, column, and box as cell X have pencil mark 6, and the player sets X to 6
- **THEN** none of those cells show pencil mark 6, and marks for other digits are unchanged
- **AND** cells outside X's row, column, and box keep their mark 6

#### Scenario: Peer struck marks removed
- **WHEN** cells in the same row, column, and box as cell X have struck mark 6, and the player sets X to 6
- **THEN** none of those cells show struck mark 6, and their other pencil marks and struck marks are unchanged
- **AND** cells outside X's row, column, and box keep their struck mark 6

#### Scenario: Undo brings struck marks back
- **WHEN** setting X to 6 cleared struck mark 6 from a peer, and the player clicks undo
- **THEN** the peer shows struck mark 6 again

### Requirement: Auto-filled values clear related pencil marks
Each value set by a bulk set SHALL remove that digit's pencil mark and struck mark from every empty player cell in the same row, column, or box, as a player-entered value does.

#### Scenario: Marks cleared by an auto-filled value
- **WHEN** a bulk set fills cell X with 4 and a cell in X's row has pencil marks 4 and 9
- **THEN** that cell shows only pencil mark 9

#### Scenario: Struck marks cleared by an auto-filled value
- **WHEN** a bulk set fills cell X with 4 and a cell in X's column has struck mark 4 and pencil mark 9
- **THEN** that cell shows pencil mark 9 and no struck mark 4

## REMOVED Requirements

### Requirement: Setting a value keeps struck marks in related cells
**Reason**: Once a value is placed, a struck mark for that digit in its row, column, or box is redundant. The player wants it cleared like a pencil mark.
**Migration**: None needed. Struck marks already on the board stay until the next value set of that digit in a peer, or until the player removes them.
