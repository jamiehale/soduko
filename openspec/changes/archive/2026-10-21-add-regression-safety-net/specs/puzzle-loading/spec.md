# Spec Delta

## Purpose

Defines how a player starts a new game from one of the bundled stock puzzles or from a custom puzzle string they enter, and the format custom puzzles must use.

## ADDED Requirements

### Requirement: New Game dialog
Clicking New SHALL open a "New Game" dialog with two tabs, "Stock" and "Custom", with Stock selected first. Cancelling or dismissing the dialog SHALL leave the current game unchanged.

#### Scenario: Open and cancel
- **WHEN** the player clicks New and then Cancel
- **THEN** the dialog closes and the board, marks, and history are unchanged

### Requirement: Start a stock puzzle
The Stock tab SHALL offer 95 bundled puzzles, numbered 1–95, each with a miniature preview of its clues. Start SHALL stay disabled until a puzzle is chosen.

#### Scenario: Choose stock puzzle 1
- **WHEN** the player opens New, picks puzzle 1 in the Stock tab, and clicks Start
- **THEN** the board shows puzzle 1's clues and every other cell is empty

#### Scenario: Nothing chosen
- **WHEN** the Stock tab is open and no puzzle has been picked
- **THEN** Start is disabled

### Requirement: Custom puzzle format
A custom puzzle SHALL be 81 characters in row-major order, using `1`–`9` for clues and `.` or `0` for blanks. The input SHALL drop any other character as it is typed and SHALL accept at most 81 characters. Start SHALL be enabled only when exactly 81 characters are present.

#### Scenario: Valid custom puzzle
- **WHEN** the player enters `.8..4....3......1........2...5...4.69..1..8..2...........3.9....6....5.....2.....` and clicks Start
- **THEN** the board shows 8 at row 1 column 2, 4 at row 1 column 5, and so on, with blanks elsewhere

#### Scenario: Zeros are blanks
- **WHEN** the custom puzzle uses `0` instead of `.`
- **THEN** those cells are empty, non-clue cells

#### Scenario: Invalid characters dropped
- **WHEN** the player types `1a2 b3`
- **THEN** the field contains `123`

#### Scenario: Too short
- **WHEN** fewer than 81 characters are entered
- **THEN** Start is disabled

### Requirement: Starting a game resets history
Starting a new game SHALL replace the whole board and clear undo/redo history.

#### Scenario: History cleared
- **WHEN** the player has made changes and starts a new game
- **THEN** undo and redo are disabled
