# Spec Delta

## ADDED Requirements

### Requirement: Typing a digit with no selection highlights it
When no cell is selected and no mouse button is held, typing a digit N SHALL show the value highlighting for N, exactly as if a single cell holding N were selected. It SHALL NOT change the board or add an undo step. When no cell holds N, no row, column, or box is highlighted, but the filled-cell and matching-mark highlighting still apply.

#### Scenario: Matching values
- **WHEN** no cell is selected, cells 0 and 40 hold 7, and the player types `7`
- **THEN** cells 0 and 40 are shown in the selected style
- **AND** the other cells in their rows, columns, and boxes are shown in the peer style

#### Scenario: Filled cells and matching marks
- **WHEN** no cell is selected, cells hold 7, a cell outside every 7's row, column, and box holds 3, an empty cell outside those areas has pencil mark 7, and the player types `7`
- **THEN** the cell holding 3 is shown in the peer style and the cell with pencil mark 7 in the related style

#### Scenario: Struck marks are not related
- **WHEN** no cell is selected, an empty cell outside every 7's row, column, and box has struck mark 7, and the player types `7`
- **THEN** that cell is shown in the peer style, not the related style

#### Scenario: No cell holds the digit
- **WHEN** no cell holds 5, a cell holds 3, an empty cell has pencil mark 5, and with no cell selected the player types `5`
- **THEN** no cell is in the selected style, the cell holding 3 is in the peer style, the cell with pencil mark 5 is in the related style, and empty cells without mark 5 are not highlighted

#### Scenario: Board unchanged
- **WHEN** no cell is selected and the player types a digit
- **THEN** no cell's value or marks change and the undo button's enabled state does not change

### Requirement: Changing or clearing the digit highlight
Typing a different digit while a digit is highlighted SHALL switch the highlight to that digit. Typing the highlighted digit again SHALL clear it. Pressing Escape, pressing the mouse on a cell, Reset, and New Game SHALL clear it. The digit highlight SHALL NOT be saved.

#### Scenario: Switch digits
- **WHEN** 7 is highlighted with no selection and the player types `4`
- **THEN** the cells holding 4 are shown in the selected style and the cells holding 7 are not

#### Scenario: Same digit again
- **WHEN** 7 is highlighted with no selection and the player types `7`
- **THEN** no cell is highlighted

#### Scenario: Escape
- **WHEN** 7 is highlighted with no selection and the player presses Escape
- **THEN** no cell is highlighted

#### Scenario: Click a cell
- **WHEN** 7 is highlighted with no selection and the player clicks an empty cell
- **THEN** that cell is selected and only its own row, column, and box are shown in the peer style

#### Scenario: Deselecting does not bring it back
- **WHEN** 7 is highlighted, the player clicks a cell, and then clicks it again to deselect it
- **THEN** no cell is highlighted

#### Scenario: Typing with a selection after a click
- **WHEN** 7 is highlighted, the player clicks an empty player cell, and types `5`
- **THEN** that cell holds 5

#### Scenario: Reset
- **WHEN** 7 is highlighted with no selection and the player confirms Reset
- **THEN** no cell is highlighted

#### Scenario: Reload
- **WHEN** 7 is highlighted with no selection and the page reloads
- **THEN** no cell is highlighted

### Requirement: The digit highlight follows the board
While a digit N is highlighted, the highlighting SHALL reflect the current board, including after undo, redo, Fill pencil marks, and auto-filled values.

#### Scenario: Undo while highlighted
- **WHEN** a player cell holds 7, the player deselects it, types `7`, and clicks undo to remove that value
- **THEN** the cell is no longer shown in the selected style

#### Scenario: Auto-filled value
- **WHEN** a value set starts an auto-fill that places a 7, and the player deselects and types `7` before it fires
- **THEN** after the auto-fill the new 7 is shown in the selected style

## MODIFIED Requirements

### Requirement: Escape clears the selection
Pressing Escape SHALL clear the selection and any digit highlight without changing the board.

#### Scenario: Escape
- **WHEN** cells are selected and the player presses Escape
- **THEN** no cell is selected and the board is unchanged
