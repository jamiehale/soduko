# Spec Delta

## ADDED Requirements

### Requirement: A paused game ignores board keys
While the game is paused (any dialog is open), typing a digit or Shift plus a digit SHALL NOT change the board or add an undo step, whatever cells are selected and whether or not the game is solved.

#### Scenario: One cell selected
- **WHEN** an empty player cell is selected and the player types `5` into the custom puzzle field
- **THEN** the cell is still empty and undo is still disabled

#### Scenario: Several cells selected
- **WHEN** several empty player cells are selected and the player types `5` into the custom puzzle field
- **THEN** none of them gets pencil mark 5

#### Scenario: Shift plus a digit
- **WHEN** an empty player cell is selected, the Help dialog is open, and the player types Shift+`5`
- **THEN** the cell gets no struck mark 5

#### Scenario: Solved game
- **WHEN** the game is solved, a player cell is selected, and the player types a different digit into the custom puzzle field
- **THEN** the cell keeps its value and the game is still solved
