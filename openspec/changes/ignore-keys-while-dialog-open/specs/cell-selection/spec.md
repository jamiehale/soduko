# Spec Delta

## ADDED Requirements

### Requirement: A paused game ignores selection and highlight keys
The game SHALL be paused while any dialog (New Game, Reset, or Help) is open. While the game is paused, typing a digit or pressing Escape SHALL NOT change the selection or the digit highlight. When the game is no longer paused, keys SHALL work as before. The paused state SHALL NOT be saved.

#### Scenario: Typing a custom puzzle
- **WHEN** no cell is selected, the player opens New Game, picks Custom, and types digits into the puzzle field
- **THEN** no cell on the board is highlighted

#### Scenario: Existing digit highlight kept
- **WHEN** 7 is highlighted with no selection and the player types `4` into the custom puzzle field
- **THEN** 7 is still highlighted on the board

#### Scenario: Escape closes only the dialog
- **WHEN** a cell is selected, a dialog is open, and the player presses Escape
- **THEN** the dialog closes and the cell is still selected

#### Scenario: Keys work again after the dialog closes
- **WHEN** the player cancels the New Game dialog with no cell selected and then types `5`
- **THEN** 5 is highlighted on the board
