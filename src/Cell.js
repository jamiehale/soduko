import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MarkedCell from './MarkedCell';
import { isPuzzleCell, isSetUserCell, boardCellValue, boardCellMarks } from './util/cell';

const Container = styled(({ highlight, error, borderLeft, borderRight, borderTop, borderBottom, ...props }) => <div {...props} />)`
  border-left: ${({ borderLeft }) => (borderLeft ? '3px solid darkgrey' : '1px solid lightgrey')};
  border-right: ${({ borderRight }) => (borderRight ? '3px solid darkgrey' : '1px solid lightgrey')};
  border-top: ${({ borderTop }) => (borderTop ? '3px solid darkgrey' : '1px solid lightgrey')};
  border-bottom: ${({ borderBottom }) => (borderBottom ? '3px solid darkgrey' : '1px solid lightgrey')};
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ error, highlight, theme }) => (error ? theme.colors.error.cell : highlight ? theme.colors[highlight].cell : 'white')};
  cursor: pointer;
  user-select: none;
`;

const PuzzleCell = styled(Typography)`
  color: ${({ theme }) => theme.colors.puzzle.text};
  font-size: 2rem;
`;

const UserCell = styled(Typography)`
  color: ${({ theme }) => theme.colors.user.text};
  font-size: 2rem;
`;

const cellType = (cell) => {
  if (isPuzzleCell(cell)) {
    return <PuzzleCell>{boardCellValue(cell)}</PuzzleCell>;
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
  error,
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
    error={error}
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
