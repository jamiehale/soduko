import React from 'react';
import styled from 'styled-components';
import * as R from 'ramda';
import Typography from '@material-ui/core/Typography';
import MarkedCell from './MarkedCell';

const Container = styled(({ highlight, borderLeft, borderRight, borderTop, borderBottom, ...props }) => <div {...props} />)`
  border-left: ${({ borderLeft }) => (borderLeft ? '3px solid darkgrey' : '1px solid lightgrey')};
  border-right: ${({ borderRight }) => (borderRight ? '3px solid darkgrey' : '1px solid lightgrey')};
  border-top: ${({ borderTop }) => (borderTop ? '3px solid darkgrey' : '1px solid lightgrey')};
  border-bottom: ${({ borderBottom }) => (borderBottom ? '3px solid darkgrey' : '1px solid lightgrey')};
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ highlight, theme }) => (highlight ? theme.colors[highlight] : 'white')};
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
  highlight,
  borderLeft,
  borderRight,
  borderTop,
  borderBottom,
  onMouseDown,
  onMouseUp,
  onMouseOver,
}) => (
  <Container
    className={className}
    highlight={highlight}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseOver={onMouseOver}
    borderLeft={borderLeft}
    borderRight={borderRight}
    borderTop={borderTop}
    borderBottom={borderBottom}
  >
    {cellType(cell)}
  </Container>
);

export default Cell;
