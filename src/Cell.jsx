import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import MarkedCell from './MarkedCell';
import { isGivenCell, isPlayerCellWithValue, getCellValue, getCellMarks, getCellStrikes } from './util/cell';

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

const GivenCell = styled(Typography)`
  color: ${({ theme }) => theme.colors.given.text};
  font-size: 2rem;
`;

const PlayerCell = styled(Typography)`
  color: ${({ theme }) => theme.colors.player.text};
  font-size: 2rem;
`;

const cellType = (cell) => {
  if (isGivenCell(cell)) {
    return <GivenCell>{getCellValue(cell)}</GivenCell>;
  }
  if (isPlayerCellWithValue(cell)) {
    return <PlayerCell>{getCellValue(cell)}</PlayerCell>;
  }
  return <MarkedCell marks={getCellMarks(cell)} strikes={getCellStrikes(cell)} />
};

const Cell = ({
  className,
  'data-cell': dataCell,
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
    data-cell={dataCell}
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
