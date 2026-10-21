# game-status Specification

## Purpose

Defines how the board reports conflicting values and tells the player when the puzzle is solved. The tool checks the rules only; it never reveals solutions.

## Requirements

### Requirement: Conflict highlighting
Any two cells with the same value in the same row, column, or 3×3 section SHALL both be shown in the error style. This applies to clues and entered values alike. Pencil marks never conflict.

#### Scenario: Row conflict
- **WHEN** the player enters 3 in a cell whose row already holds a 3
- **THEN** both cells are shown in the error style

#### Scenario: Section conflict
- **WHEN** two cells in the same section but different rows and columns hold 9
- **THEN** both cells are shown in the error style

#### Scenario: Conflict resolved
- **WHEN** one of two conflicting values is cleared or changed to a non-conflicting value
- **THEN** neither cell is shown in the error style

#### Scenario: Marks ignored
- **WHEN** a cell has pencil mark 4 and its row holds the value 4
- **THEN** no cell is shown in the error style because of the mark

### Requirement: Solved indicator
When every cell holds a value and each digit 1–9 appears exactly once in every row, column, and section, the app SHALL show "Solved". Otherwise it SHALL NOT.

#### Scenario: Final value entered
- **WHEN** the player enters the last missing correct value
- **THEN** "Solved" is displayed

#### Scenario: Incomplete board
- **WHEN** at least one cell is empty
- **THEN** "Solved" is not displayed

#### Scenario: Undo after solving
- **WHEN** the board is solved and the player clicks undo
- **THEN** "Solved" is no longer displayed
