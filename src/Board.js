import React from 'react';
import styled from 'styled-components';
import * as R from 'ramda';
import UnstyledCell from './Cell';

const rowFromCount = count => Math.floor(count / 9) + 1;
const columnFromCount = count => count % 9 + 1;
const cellKey = (row, column) => `${row}|${column}`;

const Cell = styled(UnstyledCell)``;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 40px);

  ${Cell} {
    height: 40px;
  }
`;

const Board = ({
  game,
  selectedCells,
  draggedCells,
  onMouseDown,
  onMouseUp,
  onMouseOver,
}) => {
  const cells = game.map((cell, i) => (
    <Cell
      key={cellKey(rowFromCount(i), columnFromCount(i))}
      cell={cell}
      selected={R.includes(i, selectedCells)}
      dragged={R.includes(i, draggedCells)}
      onMouseDown={R.thunkify(onMouseDown)(i)}
      onMouseUp={R.thunkify(onMouseUp)(i)}
      onMouseOver={R.thunkify(onMouseOver)(i)}
    />
  ));

  return (
    <Container>
      {cells}
    </Container>
  );
};

export default Board;
