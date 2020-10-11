import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MarkedCell from './MarkedCell';
import { isPuzzleCell, isSetUserCell, boardCellValue, boardCellMarks } from './util/cell';

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
`;

const BoardCell = styled(Typography).attrs({
  color: 'primary',
})`
  font-size: 2rem;
`;

const UserCell = styled(Typography).attrs({
  color: 'secondary',
})`
  font-size: 2rem;
`;

const cellType = (cell) => {
  if (isPuzzleCell(cell)) {
    return <BoardCell>{boardCellValue(cell)}</BoardCell>;
  }
  if (isSetUserCell(cell)) {
    return <UserCell>{boardCellValue(cell)}</UserCell>;
  }
  return <MarkedCell marks={boardCellMarks(cell)} />
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
