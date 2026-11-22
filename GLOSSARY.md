# Soduko

A Sudoku helper: the player solves a puzzle on the board, and the app tracks pencil marks, highlights related cells, and fills in forced values. It does not solve or generate puzzles.

## Language

### Puzzle and board

**Puzzle**:
The starting pattern of 81 digits and blanks. It is a stock puzzle, a custom puzzle the player types in, or the mini preview in the New Game dialog.
_Avoid_: Grid, layout

**Board**:
The 81 cells the player works on. A new game populates it from a puzzle.
_Avoid_: Grid

**Cell**:
One of the 81 squares on the board.
_Avoid_: Square

**Row**, **column**, **box**:
The three kinds of 9-cell group. A box is one of the nine 3×3 areas.
_Avoid_: Section, block, region

**Peer**:
A cell that shares a row, column, or box with another cell; also the style that marks the peers of the selection.
_Avoid_: Neighbour

### Cells and values

**Given cell**:
A cell populated from the puzzle. Its value, the **given value**, can't be changed.
_Avoid_: Clue, puzzle cell, fixed cell

**Player cell**:
Any cell that is not a given cell. The player sets its value, called a **player value**, or its pencil marks.
_Avoid_: User cell, entered value

**Value**:
The digit 1–9 a cell holds.
_Avoid_: Number, answer

**Pencil marks**:
Small candidate digits in an empty player cell.
_Avoid_: Notes, candidates

**Struck mark**:
A digit the player has ruled out for an empty player cell, shown as a pencil mark with a line through it.
_Avoid_: Not possible, excluded

**Conflict**:
Two cells with the same value in one row, column, or box.
_Avoid_: Error, clash

### Selection and highlighting

**Selection**:
The cells the player has selected.

**Related**:
An empty cell with a pencil mark of the selected value; also the style that marks it.

**Digit highlight**:
A digit the board highlights as if a selected cell held it. The player gets one by typing a digit with nothing selected, or by toggling a pencil mark or struck mark on the selection.

### Auto-set

**Auto-set**:
The feature that sets forced cells in the trigger box by itself, shortly after the player sets a value.
_Avoid_: Auto-fill (fill is what Fill pencil marks does)

**Trigger box**:
The box holding the cell whose value the player just set. It is the only box auto-set looks at, for the whole cascade.

**Box single**:
A digit that is a pencil mark in exactly one cell of a box, where no cell of that box holds it. Auto-set places box singles.
_Avoid_: Hidden single

**Bulk set**:
One round of auto-set: every box single found is set at once, as one undo step.

**Cascade**:
The chain of bulk sets in the trigger box that ends when a round finds no box single or the board has a conflict.

### Game

**Game**:
The board plus its undo and redo history. This is what is saved.
_Avoid_: Session, save

**Paused**:
The state where the game ignores keyboard input, which holds while any dialog is open.
