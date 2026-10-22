import styled from 'styled-components';
import * as R from 'ramda';
import UnstyledCell from './Cell';
import { rowFromCount, columnFromCount, sectionFromCount } from './util/board';
import { cellValueEquals, cellHasMark } from './util/cell';
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

const highlightLevel = (row, column, section, cell, selected, highlight) => {
  const { highlightRows = [], highlightColumns = [], highlightSections = [], highlightValue } = highlight;
  if ((!R.isNil(highlightValue) && cellValueEquals(highlightValue, cell)) || selected) {
    return 'selected';
  }
  if (R.includes(row, highlightRows) || R.includes(column, highlightColumns) || R.includes(section, highlightSections)) {
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
      highlight={highlightLevel(rowFromCount(i), columnFromCount(i), sectionFromCount(i), cell, R.includes(i, selectedCells), highlight)}
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
