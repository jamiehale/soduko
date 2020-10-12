import React, { useCallback, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import * as R from 'ramda';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import HelpIcon from '@material-ui/icons/Help';
import useEventListener from '@use-it/event-listener';
import { decodeBoard } from './util/board';
import useSelection, { mouseDown, mouseUp, mouseOver, clearSelection } from './hooks/selection';
import useHighlight from './hooks/highlight';
import useBoard, { reset, toggleCellMark, setCellValue, undo, redo, newGame } from './hooks/board';
import useGame from './hooks/game';
import useConfirmation from './hooks/confirmation';
import Board from './Board';
import theme from './theme';
import ConfirmationDialog from './ConfirmationDialog';
import NewGameDialog from './NewGameDialog';
import Header from './Header';
import HelpDialog from './HelpDialog';

const App = () => {
  const { dispatch: boardDispatch, board, canUndo, canRedo } = useBoard();
  const { dispatch: selectionDispatch, selectedCells, isMouseDown } = useSelection();
  const { isComplete } = useGame(board);
  const highlight = useHighlight(selectedCells, board);
  const [showHelp, setShowHelp] = useState(false);
  
  const handleReset = useCallback(() => {
    reset(boardDispatch);
    clearSelection(selectionDispatch);
  }, [boardDispatch, selectionDispatch]);

  const { confirming, confirm, handleConfirm, handleCancel } = useConfirmation(handleReset);

  const handleNewGame = (puzzle) => {
    newGame(boardDispatch, decodeBoard(puzzle));
  };

  const { confirming: showNewGame, confirm: confirmNewGame, handleConfirm: handleConfirmNewGame, handleCancel: handleCancelNewGame } = useConfirmation(handleNewGame);

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
      <Container maxWidth="sm">
        <Grid container direction="column" alignContent="center" spacing={1}>
          <Grid item xs={12}>
            <Header />
          </Grid>
          <Grid item xs={12}>
            <Board
              game={board}
              selectedCells={selectedCells}
              highlight={highlight}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseOver={handleMouseOver}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Button onClick={confirmNewGame}>New</Button>
              <Button onClick={confirm}>Reset</Button>
              <IconButton onClick={R.thunkify(setShowHelp)(true)}><HelpIcon /></IconButton>
            </Grid>
            <Grid item>
              {isComplete && (
                <Typography variant="h5" align="center">Solved</Typography>
              )}
            </Grid>
            <Grid item>
              <IconButton onClick={handleUndo} disabled={!canUndo}><UndoIcon /></IconButton>
              <IconButton onClick={handleRedo} disabled={!canRedo}><RedoIcon /></IconButton>
            </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      {confirming && (
        <ConfirmationDialog
          text="This will clear all your progress. Are you sure?"
          confirmText="Reset"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      {showNewGame && (
        <NewGameDialog
          onNewGame={handleConfirmNewGame}
          onCancel={handleCancelNewGame}
        />
      )}
      {showHelp && (
        <HelpDialog
          onClose={R.thunkify(setShowHelp)(false)}
        />
      )}
    </ThemeProvider>
  );
};

export default App;
