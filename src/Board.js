import React from 'react';
import styled from 'styled-components';
import * as R from 'ramda';
import UnstyledCell from './Cell';
import { rowFromCount, columnFromCount, sectionFromCount } from './util/logic';
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
  const { highlightRow, highlightColumn, highlightSection, highlightValue } = highlight;
  if ((!R.isNil(highlightValue) && cellValueEquals(highlightValue, cell)) || selected) {
    return 'dark';
  }
  if (row === highlightRow || column === highlightColumn || section === highlightSection) {
    return 'light';
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
  onMouseDown,
  onMouseUp,
  onMouseOver,
}) => {
  const { borderPropsFor } = useBorder();

  const cells = game.map((cell, i) => (
    <Cell
      key={cellKey(rowFromCount(i), columnFromCount(i))}
      cell={cell}
      highlight={highlightLevel(rowFromCount(i), columnFromCount(i), sectionFromCount(i), cell, R.includes(i, selectedCells), highlight)}
      onMouseDown={R.thunkify(onMouseDown)(i)}
      onMouseUp={R.thunkify(onMouseUp)(i)}
      onMouseOver={R.thunkify(onMouseOver)(i)}
      {...borderPropsFor(i)}
    />
  ));

  return (
    <Container>
      {cells}
    </Container>
  );
};

export default Board;
