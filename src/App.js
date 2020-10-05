import React, { useEffect, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';
import * as R from 'ramda';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import useEventListener from '@use-it/event-listener';
import Board from './Board';
import theme from './theme';
import useSelection, { mouseDown, mouseUp, mouseOver, clearSelection } from './hooks/selection';
import useHighlight from './hooks/highlight';
import useBoard, { resetBoard, toggleCellMark, setCellValue } from './hooks/board';

const stockBoard = `
9...5...2
......38.
..291..6.
..1......
4.3.2.7.5
......8..
.1..952..
.48......
7...6...4
`;

const parseValue = s => parseInt(s, 10);

const extractBoard = R.compose(
  R.map(R.when(R.complement(R.equals('.')), parseValue)),
  R.split(''),
  R.replace(/\n/g, ''),
);

const App = () => {
  const { dispatch: selectionDispatch, selectedCells, isMouseDown } = useSelection();
  const { dispatch: boardDispatch, board } = useBoard();
  const highlight = useHighlight(selectedCells, board);

  useEffect(() => {
    resetBoard(boardDispatch, extractBoard(stockBoard));
  }, [boardDispatch]);

  const handleReset = useCallback(() => {
    resetBoard(boardDispatch, extractBoard(stockBoard));
    clearSelection(selectionDispatch);
  }, [boardDispatch, selectionDispatch]);

  const handleMouseDown = cell => {
    mouseDown(selectionDispatch, cell);
  };

  const handleMouseUp = cell => {
    mouseUp(selectionDispatch, cell);
  };

  const handleMouseOver = cell => {
    mouseOver(selectionDispatch, cell);
  };

  const handleKeyDown = useCallback((event) => {
    if (R.includes(event.key, ['1', '2', '3', '4', '5', '6', '7', '8', '9'])) {
      if (isMouseDown || R.length(selectedCells) > 1) {
        toggleCellMark(boardDispatch, selectedCells, parseInt(event.key, 10));
      } else if (R.length(selectedCells) === 1) {
        setCellValue(boardDispatch, R.head(selectedCells), parseInt(event.key, 10));
      }
    } else if (event.key === 'Escape') {
      clearSelection(selectionDispatch);
    }
  }, [isMouseDown, selectedCells, boardDispatch, selectionDispatch]);

  useEventListener('keydown', handleKeyDown);

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Board
          game={board}
          selectedCells={selectedCells}
          highlight={highlight}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseOver={handleMouseOver}
        />
        <Button onClick={handleReset}>Reset</Button>
      </Container>
    </ThemeProvider>
  );
};

export default App;
