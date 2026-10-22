## MODIFIED Requirements

### Requirement: Default board without a saved game
When there is no saved game, or the saved data cannot be read, the app SHALL show an empty board: 81 empty player cells and no given cells. Undo and redo SHALL be disabled.

#### Scenario: First visit
- **WHEN** the app loads with empty local storage
- **THEN** all 81 cells are empty and editable

#### Scenario: Corrupt saved data
- **WHEN** the saved data is not valid JSON
- **THEN** the app shows the empty default board instead of failing

### Requirement: Backward-compatible saved games
The app SHALL load games saved by earlier releases, from v0.2.2 on, without data loss. Saves that use the earlier cell format SHALL be converted to the current format when they load, and the next save SHALL be written in the current format.

#### Scenario: Load a v0.2.2 save
- **WHEN** local storage holds a game saved by v0.2.2 containing given values, player values, marks, and undo history
- **THEN** the board shows the same given values, player values, and marks, given cells stay unchangeable, and undo restores the earlier state

#### Scenario: Converted on next save
- **WHEN** a game saved in the earlier format is loaded and the player makes a change
- **THEN** the saved game is written in the current format and still loads with the same values, marks, and history
