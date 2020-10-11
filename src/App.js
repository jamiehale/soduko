import React, { useEffect, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';
import * as R from 'ramda';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import useEventListener from '@use-it/event-listener';
import Board from './Board';
import theme from './theme';
import useSelection, { mouseDown, mouseUp, mouseOver, clearSelection } from './hooks/selection';
import useHighlight from './hooks/highlight';
import useBoard, { resetBoard, toggleCellMark, setCellValue, undo, redo } from './hooks/board';
import useGame from './hooks/game';
import useConfirmation from './hooks/confirmation';
import ConfirmationDialog from './ConfirmationDialog';

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

const solved = `
967358412
154276389
832914567
521789643
483621795
679543821
316495278
248137956
795862134
`;

const parseValue = s => parseInt(s, 10);

const extractBoard = R.compose(
  R.map(R.when(R.complement(R.equals('.')), parseValue)),
  R.split(''),
  R.replace(/\n/g, ''),
);

const App = () => {
  const { dispatch: selectionDispatch, selectedCells, isMouseDown } = useSelection();
  const { dispatch: boardDispatch, board, canUndo, canRedo } = useBoard();
  const { isComplete } = useGame(board);
  console.log(isComplete);
  const highlight = useHighlight(selectedCells, board);
  
  useEffect(() => {
    resetBoard(boardDispatch, extractBoard(stockBoard));
  }, [boardDispatch]);
  
  const handleReset = useCallback(() => {
    resetBoard(boardDispatch, extractBoard(stockBoard));
    clearSelection(selectionDispatch);
  }, [boardDispatch, selectionDispatch]);

  const { confirming, confirm, handleConfirm, handleCancel } = useConfirmation(handleReset);

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

  const handleUndo = useCallback(() => {
    undo(boardDispatch);
  }, [boardDispatch]);

  const handleRedo = useCallback(() => {
    redo(boardDispatch);
  }, [boardDispatch]);

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
        <Button onClick={confirm}>Reset</Button>
        <IconButton onClick={handleUndo} disabled={!canUndo}><UndoIcon /></IconButton>
        <IconButton onClick={handleRedo} disabled={!canRedo}><RedoIcon /></IconButton>
      </Container>
      {confirming && (
        <ConfirmationDialog
          text="This will clear all your progress. Are you sure?"
          confirmText="Reset"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ThemeProvider>
  );
};

export default App;
