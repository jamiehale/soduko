## MODIFIED Requirements

### Requirement: Value highlighting
When exactly one cell is selected and it holds a value N (clue or entered), every other cell holding N SHALL be shown in the "selected" style. The row, column, and 3×3 section of every cell holding N, including the selected cell, SHALL be shown in the "peer" style, except for cells shown in a stronger style. Cells outside all of those rows, columns, and sections that have pencil mark N SHALL be shown in the "related" style. When the single selected cell is empty or holds only pencil marks, no value, mark, or extra peer highlighting SHALL be applied beyond its own row, column, and section.

#### Scenario: Matching values
- **WHEN** the single selected cell holds 7
- **THEN** all other cells holding 7 are shown in the selected style

#### Scenario: Peers of every matching value
- **WHEN** the single selected cell holds 7 and another cell holds 7 in a different row, column, and section
- **THEN** the other cells in that cell's row, column, and section are shown in the peer style, as are those of the selected cell

#### Scenario: Remaining placements stay unhighlighted
- **WHEN** the single selected cell holds 7
- **THEN** a cell that shares no row, column, or section with any cell holding 7, and has no pencil mark 7, is not highlighted

#### Scenario: Matching marks
- **WHEN** the single selected cell holds 7 and an empty cell sharing no row, column, or section with any cell holding 7 has pencil mark 7
- **THEN** that cell is shown in the related style

#### Scenario: Matching mark inside a projected area
- **WHEN** the single selected cell holds 7 and an empty cell with pencil mark 7 shares a column with another cell holding 7
- **THEN** that cell is shown in the peer style

#### Scenario: Empty cell selected
- **WHEN** the single selected cell has no value
- **THEN** only its own row, column, and section are shown in the peer style, and no value or mark highlighting is applied
