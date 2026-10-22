## MODIFIED Requirements

### Requirement: Start a stock puzzle
The Stock tab SHALL offer 95 bundled puzzles, numbered 1–95, each with a miniature preview of the puzzle. Start SHALL stay disabled until a puzzle is chosen.

#### Scenario: Choose stock puzzle 1
- **WHEN** the player opens New, picks puzzle 1 in the Stock tab, and clicks Start
- **THEN** the board shows puzzle 1's given values and every other cell is an empty player cell

#### Scenario: Nothing chosen
- **WHEN** the Stock tab is open and no puzzle has been picked
- **THEN** Start is disabled

### Requirement: Custom puzzle format
A custom puzzle SHALL be 81 characters in row-major order, using `1`–`9` for given values and `.` or `0` for blanks. The input SHALL drop any other character as it is typed and SHALL accept at most 81 characters. Start SHALL be enabled only when exactly 81 characters are present.

#### Scenario: Valid custom puzzle
- **WHEN** the player enters `.8..4....3......1........2...5...4.69..1..8..2...........3.9....6....5.....2.....` and clicks Start
- **THEN** the board shows given 8 at row 1 column 2, given 4 at row 1 column 5, and so on, with empty player cells elsewhere

#### Scenario: Zeros are blanks
- **WHEN** the custom puzzle uses `0` instead of `.`
- **THEN** those cells are empty player cells

#### Scenario: Invalid characters dropped
- **WHEN** the player types `1a2 b3`
- **THEN** the field contains `123`

#### Scenario: Too short
- **WHEN** fewer than 81 characters are entered
- **THEN** Start is disabled

### Requirement: Starting a game resets history
Starting a new game SHALL populate the whole board from the chosen puzzle and clear undo/redo history.

#### Scenario: History cleared
- **WHEN** the player has made changes and starts a new game
- **THEN** undo and redo are disabled
