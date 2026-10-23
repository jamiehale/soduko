# Spec Delta

## MODIFIED Requirements

### Requirement: Value highlighting
When exactly one cell is selected and it holds a value N (given or player), every other cell holding N SHALL be shown in the "selected" style. The row, column, and box of every cell holding N, every other cell holding a value, and every empty cell with struck mark N SHALL be shown in the "peer" style. Empty cells outside those areas with pencil mark N SHALL be shown in the "related" style. An empty or pencil-marked selected cell SHALL get no value highlighting.

#### Scenario: Matching values
- **WHEN** the single selected cell holds 7
- **THEN** all other cells holding 7 are shown in the selected style

#### Scenario: Peers of every matching value
- **WHEN** the single selected cell holds 7 and another cell holds 7 in a different row, column, and box
- **THEN** the other cells in that cell's row, column, and box are shown in the peer style, as are those of the selected cell

#### Scenario: Filled cells are blocked
- **WHEN** the single selected cell holds 7 and a cell outside every 7's row, column, and box holds a given or player value other than 7
- **THEN** that cell is shown in the peer style

#### Scenario: Struck marks are not related
- **WHEN** the single selected cell holds 7 and an empty cell outside every 7's row, column, and box has struck mark 7
- **THEN** that cell is shown in the peer style, not the related style

#### Scenario: Other struck digits don't block
- **WHEN** the single selected cell holds 7 and an empty cell outside every 7's row, column, and box has struck mark 4 and no mark 7
- **THEN** that cell is not highlighted

#### Scenario: Remaining placements stay unhighlighted
- **WHEN** the single selected cell holds 7
- **THEN** an empty cell that shares no row, column, or box with any cell holding 7, and has no pencil mark 7 or struck mark 7, is not highlighted

#### Scenario: Matching marks
- **WHEN** the single selected cell holds 7 and an empty cell sharing no row, column, or box with any cell holding 7 has pencil mark 7
- **THEN** that cell is shown in the related style

#### Scenario: Matching mark inside a projected area
- **WHEN** the single selected cell holds 7 and an empty cell with pencil mark 7 shares a column with another cell holding 7
- **THEN** that cell is shown in the peer style

#### Scenario: Empty cell selected
- **WHEN** the single selected cell has no value
- **THEN** only its own row, column, and box are shown in the peer style, and no value, mark, or filled-cell highlighting is applied
