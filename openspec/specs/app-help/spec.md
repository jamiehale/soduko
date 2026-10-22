# app-help Specification

## Purpose

Gives players in-app instructions and shows which version they are running.

## Requirements

### Requirement: Help dialog
The help icon button SHALL open a dialog titled "soduko v<version>", where <version> is the current package version. The dialog explains selection, entering values, pencil marks, the custom puzzle format, and credits the stock puzzles' source with a link to `http://norvig.com/top95.txt`. It SHALL call starting patterns "puzzles" (stock or custom), never "boards". "Okay", or dismissing the dialog, SHALL close it.

#### Scenario: Open help
- **WHEN** the player clicks the help icon
- **THEN** a dialog titled with the current version and the usage instructions is shown

#### Scenario: Puzzle wording
- **WHEN** the Help dialog is open
- **THEN** it refers to stock and custom puzzles, and does not use the word "board" for them

#### Scenario: Close help
- **WHEN** the player clicks Okay
- **THEN** the dialog closes and the game is unchanged
