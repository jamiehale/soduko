import { useCallback, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import * as R from 'ramda';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HelpIcon from '@mui/icons-material/Help';
import useEventListener from '@use-it/event-listener';
import { decode } from './util/decoder';
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
import GitHubLink from './GitHubLink';

const App = () => {
  const { dispatch: boardDispatch, board, canUndo, canRedo } = useBoard();
  const { dispatch: selectionDispatch, selectedCells, isMouseDown } = useSelection();
  const { isSolved, errorCells } = useGame(board);
  const highlight = useHighlight(selectedCells, board);
  const [showHelp, setShowHelp] = useState(false);
  
  const handleReset = useCallback(() => {
    reset(boardDispatch);
    clearSelection(selectionDispatch);
  }, [boardDispatch, selectionDispatch]);

  const {
    confirming: showReset,
    confirm: confirmReset,
    handleConfirm: handleConfirmReset,
    handleCancel: handleCancelReset,
  } = useConfirmation(handleReset);

  const handleNewGame = useCallback((puzzle) => {
    newGame(boardDispatch, decode(puzzle));
  }, [boardDispatch]);

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

  useEventListener('keydown', handleKeyDown, window);

  const handleUndo = useCallback(() => {
    undo(boardDispatch);
  }, [boardDispatch]);

  const handleRedo = useCallback(() => {
    redo(boardDispatch);
  }, [boardDispatch]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <GitHubLink
          href="https://github.com/jamiehale/soduko"
          target="_new"
        />
        <Grid container direction="column" alignContent="center" spacing={1}>
          <Grid item xs={12}>
            <Header />
          </Grid>
          <Grid item xs={12}>
            <Board
              game={board}
              selectedCells={selectedCells}
              highlight={highlight}
              errorCells={errorCells}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseOver={handleMouseOver}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item xs={4}>
                <Button onClick={confirmNewGame}>New</Button>
                <Button onClick={confirmReset}>Reset</Button>
              </Grid>
              <Grid item xs={4}>
                {isSolved && (
                  <Typography variant="h5" align="center">Solved</Typography>
                  )}
              </Grid>
              <Grid item xs={4}>
                <IconButton data-testid="help" onClick={R.thunkify(setShowHelp)(true)}><HelpIcon /></IconButton>
                <IconButton data-testid="undo" onClick={handleUndo} disabled={!canUndo}><UndoIcon /></IconButton>
                <IconButton data-testid="redo" onClick={handleRedo} disabled={!canRedo}><RedoIcon /></IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      {showReset && (
        <ConfirmationDialog
          text="This will clear all your progress. Are you sure?"
          confirmText="Reset"
          onConfirm={handleConfirmReset}
          onCancel={handleCancelReset}
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
