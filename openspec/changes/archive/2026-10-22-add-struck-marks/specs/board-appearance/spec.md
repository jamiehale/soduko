# Spec Delta

## ADDED Requirements

### Requirement: Struck marks are struck out
A struck mark SHALL be shown in its digit's pencil-mark position, at pencil-mark size and in the pencil-mark color (#3f51b5), with a red (#ff0000) horizontal line through it. Pencil marks SHALL have no line. A cell may show pencil marks and struck marks together.

#### Scenario: Struck-out digit
- **WHEN** an empty cell has struck mark 5
- **THEN** a 5 is shown in the center position of the cell's 3×3 mark layout, colored #3f51b5, with a red line through it

#### Scenario: Mixed marks
- **WHEN** an empty cell has pencil marks 1 and 9 and struck mark 4
- **THEN** 1 and 9 are shown without a line, and 4 is shown with a red line through it

## MODIFIED Requirements

### Requirement: Visual baselines are preserved
The rendered app SHALL match the committed baseline screenshots, within the comparison tolerance, for: the empty board; a board loaded from a puzzle with a single selection showing peer, value, and related highlighting; a multi-cell selection; marks; struck marks next to pencil marks; a conflict; the solved state; and each dialog (New Game Stock and Custom tabs, Reset confirmation, Help). Any intended visual change SHALL update the baselines explicitly.

#### Scenario: Screenshot comparison
- **WHEN** the visual test suite runs against the app
- **THEN** every screenshot matches its committed baseline
