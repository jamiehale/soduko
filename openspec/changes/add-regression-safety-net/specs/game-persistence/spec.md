# Spec Delta

## Purpose

Lets a player close or reload the page and continue where they left off, including undo/redo history. Games saved by earlier releases must keep working.

## ADDED Requirements

### Requirement: Game state is saved in the browser
After every change, the app SHALL save the board, undo history, and redo history to browser local storage. Selection is not saved.

#### Scenario: Reload mid-game
- **WHEN** the player enters values and marks and then reloads the page
- **THEN** the same values and marks are shown

#### Scenario: History survives reload
- **WHEN** the player makes two changes, undoes one, and reloads
- **THEN** both undo and redo are enabled, and clicking redo reapplies the undone change

### Requirement: Default board without a saved game
When there is no saved game, or the saved data cannot be read, the app SHALL show an empty board: 81 editable cells with no clues. Undo and redo SHALL be disabled.

#### Scenario: First visit
- **WHEN** the app loads with empty local storage
- **THEN** all 81 cells are empty and editable

#### Scenario: Corrupt saved data
- **WHEN** the saved data is not valid JSON
- **THEN** the app shows the empty default board instead of failing

### Requirement: Backward-compatible saved games
The app SHALL load games saved by v0.2.2 without migration or data loss.

#### Scenario: Load a v0.2.2 save
- **WHEN** local storage holds a game saved by v0.2.2 containing clues, entered values, marks, and undo history
- **THEN** the board shows the same clues, values, and marks, and undo restores the earlier state
