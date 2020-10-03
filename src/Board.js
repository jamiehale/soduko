import React from 'react';
import styled from 'styled-components';
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
  game
}) => {
  const cells = game.map((cell, i) => (
    <Cell
      key={cellKey(rowFromCount(i), columnFromCount(i))}
      cell={cell}
    />
  ));

  return (
    <Container>
      {cells}
    </Container>
  );
};

export default Board;
