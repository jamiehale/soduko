import styled from 'styled-components';
import * as R from 'ramda';
import UnstyledCell from './Cell';
import { rowFromCount, columnFromCount, boxFromCount } from './util/board';
import { cellValueEquals, cellHasMark, cellHasStrike, isCellWithValue } from './util/cell';
import useBorder from './hooks/border';

const cellKey = (row, column) => `${row}|${column}`;

const Cell = styled(UnstyledCell)``;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 50px);

  ${Cell} {
    height: 50px;
  }
`;

const highlightLevel = (row, column, box, cell, selected, highlight) => {
  const { highlightRows = [], highlightColumns = [], highlightBoxes = [], highlightValue } = highlight;
  if ((!R.isNil(highlightValue) && cellValueEquals(highlightValue, cell)) || selected) {
    return 'selected';
  }
  // A selected value can't go in any filled cell, or in a cell where the player struck it out
  if (!R.isNil(highlightValue) && (isCellWithValue(cell) || cellHasStrike(highlightValue, cell))) {
    return 'peer';
  }
  if (R.includes(row, highlightRows) || R.includes(column, highlightColumns) || R.includes(box, highlightBoxes)) {
    return 'peer';
  }
  if (cellHasMark(highlightValue, cell)) {
    return 'related';
  }
  return undefined;
};

const Board = ({
  game,
  selectedCells,
  highlight,
  errorCells,
  onMouseDown,
  onMouseUp,
  onMouseOver,
}) => {
  const { borderPropsFor } = useBorder();

  const cells = game.map((cell, i) => (
    <Cell
      key={cellKey(rowFromCount(i), columnFromCount(i))}
      data-cell={i}
      cell={cell}
      highlight={highlightLevel(rowFromCount(i), columnFromCount(i), boxFromCount(i), cell, R.includes(i, selectedCells), highlight)}
      error={R.includes(i, errorCells)}
      onMouseDown={R.thunkify(onMouseDown)(i)}
      onMouseUp={R.thunkify(onMouseUp)(i)}
      onMouseOver={R.thunkify(onMouseOver)(i)}
      {...borderPropsFor(i)}
    />
  ));

  return (
    <Container data-testid="board">
      {cells}
    </Container>
  );
};

export default Board;
