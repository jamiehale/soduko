import React from 'react';
import styled from 'styled-components';
import * as R from 'ramda';
import Typography from '@material-ui/core/Typography';
import MarkedCell from './MarkedCell';

const Container = styled(({ selected, dragged, ...props }) => <div {...props} />)`
  border: 1px solid red;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ selected, dragged }) => (dragged ? 'lightblue' : selected ? 'yellow' : 'white')};
  cursor: pointer;
  user-select: none;
  padding: 4px;
`;

const BoardCell = styled(Typography).attrs({
  color: 'primary',
})``;

const UserCell = styled(Typography).attrs({
  color: 'secondary',
})``;

const cellType = (cell) => {
  if (cell.boardValue !== '.') {
    return <BoardCell>{cell.boardValue}</BoardCell>;
  }
  if (cell.userValue !== '') {
    return <UserCell>{cell.userValue}</UserCell>;
  }
  return <MarkedCell marks={cell.marks} />
};

const Cell = ({
  className,
  cell,
  selected,
  dragged,
  onMouseDown,
  onMouseUp,
  onMouseOver,
}) => (
  <Container
    className={className}
    selected={selected}
    dragged={dragged}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseOver={onMouseOver}
  >
    {cellType(cell)}
  </Container>
);

export default Cell;
