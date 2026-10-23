# Spec Delta

## MODIFIED Requirements

### Requirement: Game state is saved in the browser
After every change, the app SHALL save the board, undo history, and redo history to browser local storage. The board includes values, pencil marks, and struck marks. Selection is not saved.

#### Scenario: Reload mid-game
- **WHEN** the player enters values and marks and then reloads the page
- **THEN** the same values and marks are shown

#### Scenario: Struck marks survive reload
- **WHEN** the player adds struck marks and pencil marks to a cell and reloads the page
- **THEN** the cell shows the same pencil marks and struck marks

#### Scenario: History survives reload
- **WHEN** the player makes two changes, undoes one, and reloads
- **THEN** both undo and redo are enabled, and clicking redo reapplies the undone change
