# Spec Delta

## MODIFIED Requirements

### Requirement: Help dialog
The help icon button SHALL open a dialog titled "soduko v<version>", where <version> is the current package version. The dialog explains selection, entering values, pencil marks, auto-filling box singles, the custom puzzle format, and credits the stock puzzles' source with a link to `http://norvig.com/top95.txt`. It SHALL call starting patterns "puzzles" (stock or custom), never "boards". "Okay", or dismissing the dialog, SHALL close it.

#### Scenario: Open help
- **WHEN** the player clicks the help icon
- **THEN** a dialog titled with the current version and the usage instructions is shown

#### Scenario: Auto-fill explained
- **WHEN** the Help dialog is open
- **THEN** it says that after a value is set, a digit left as a pencil mark in only one cell of a box is filled in automatically, and that undo reverses each automatic fill

#### Scenario: Puzzle wording
- **WHEN** the Help dialog is open
- **THEN** it refers to stock and custom puzzles, and does not use the word "board" for them

#### Scenario: Close help
- **WHEN** the player clicks Okay
- **THEN** the dialog closes and the game is unchanged
