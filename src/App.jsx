import { useCallback, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import * as R from 'ramda';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HelpIcon from '@mui/icons-material/Help';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { decode } from './util/decoder';
import useSelection, { mouseDown, mouseUp, mouseOver, clearSelection, highlightDigit, clearHighlightDigit } from './hooks/selection';
import useHighlight from './hooks/highlight';
import useBoard, { reset, toggleCellMark, toggleCellStrike, setCellValue, fillCellMarks, undo, redo, newGame } from './hooks/board';
import useGame from './hooks/game';
import useConfirmation from './hooks/confirmation';
import useWindowEvent from './hooks/window-event';
import useAutoFill from './hooks/auto-fill';
import { isGivenCell, isValueSet } from './util/cell';
import Board from './Board';
import theme from './theme';
import ConfirmationDialog from './ConfirmationDialog';
import NewGameDialog from './NewGameDialog';
import Header from './Header';
import HelpDialog from './HelpDialog';
import GitHubLink from './GitHubLink';

const App = () => {
  const { dispatch: boardDispatch, board, canUndo, canRedo } = useBoard();
  const { dispatch: selectionDispatch, selectedCells, isMouseDown, highlightDigit: typedDigit } = useSelection();
  const { isSolved, errorCells } = useGame(board);
  const highlight = useHighlight(selectedCells, board, typedDigit);
  const { start: startAutoFill, cancel: cancelAutoFill } = useAutoFill({ board, dispatch: boardDispatch });
  const [showHelp, setShowHelp] = useState(false);
  
  const handleReset = useCallback(() => {
    cancelAutoFill();
    reset(boardDispatch);
    clearSelection(selectionDispatch);
  }, [boardDispatch, selectionDispatch, cancelAutoFill]);

  const {
    confirming: showReset,
    confirm: confirmReset,
    handleConfirm: handleConfirmReset,
    handleCancel: handleCancelReset,
  } = useConfirmation(handleReset);

  const handleNewGame = useCallback((puzzle) => {
    cancelAutoFill();
    newGame(boardDispatch, decode(puzzle));
    clearHighlightDigit(selectionDispatch);
  }, [boardDispatch, selectionDispatch, cancelAutoFill]);

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
    const strikeDigit = event.shiftKey && R.match(/^Digit([1-9])$/, event.code)[1];
    if (strikeDigit) {
      if (R.isEmpty(selectedCells)) {
        return;
      }
      cancelAutoFill();
      toggleCellStrike(boardDispatch, selectedCells, parseInt(strikeDigit, 10));
    } else if (R.includes(event.key, ['1', '2', '3', '4', '5', '6', '7', '8', '9'])) {
      const value = parseInt(event.key, 10);
      if (isMouseDown || R.length(selectedCells) > 1) {
        cancelAutoFill();
        toggleCellMark(boardDispatch, selectedCells, value);
      } else if (R.length(selectedCells) === 1) {
        const cellIndex = R.head(selectedCells);
        if (isGivenCell(board[cellIndex])) {
          return;
        }
        cancelAutoFill();
        setCellValue(boardDispatch, cellIndex, value);
        if (isValueSet(value, board[cellIndex])) {
          startAutoFill();
        }
      } else {
        highlightDigit(selectionDispatch, value);
      }
    } else if (event.key === 'Escape') {
      clearSelection(selectionDispatch);
    }
  }, [isMouseDown, selectedCells, board, boardDispatch, selectionDispatch, startAutoFill, cancelAutoFill]);

  useWindowEvent('keydown', handleKeyDown);

  const handleFillMarks = useCallback(() => {
    cancelAutoFill();
    fillCellMarks(boardDispatch);
  }, [boardDispatch, cancelAutoFill]);

  const handleUndo = useCallback(() => {
    cancelAutoFill();
    undo(boardDispatch);
  }, [boardDispatch, cancelAutoFill]);

  const handleRedo = useCallback(() => {
    cancelAutoFill();
    redo(boardDispatch);
  }, [boardDispatch, cancelAutoFill]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <GitHubLink
          href="https://github.com/jamiehale/soduko"
          target="_new"
        />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Stack spacing={1}>
            {/* Header is a fragment; keep title and subtitle in one Stack item */}
            <div>
              <Header />
            </div>
            <Board
              game={board}
              selectedCells={selectedCells}
              highlight={highlight}
              errorCells={errorCells}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseOver={handleMouseOver}
            />
            <Grid container sx={{ alignItems: 'center' }}>
              <Grid size={4}>
                <Button onClick={confirmNewGame}>New</Button>
                <Button onClick={confirmReset}>Reset</Button>
              </Grid>
              <Grid size={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                {isSolved ? (
                  <Typography variant="h5" align="center">Solved</Typography>
                ) : (
                  <Tooltip title="Fill pencil marks">
                    <IconButton data-testid="fill-marks" onClick={handleFillMarks}><EditNoteIcon /></IconButton>
                  </Tooltip>
                )}
              </Grid>
              <Grid size={4}>
                <IconButton data-testid="help" onClick={R.thunkify(setShowHelp)(true)}><HelpIcon /></IconButton>
                <IconButton data-testid="undo" onClick={handleUndo} disabled={!canUndo}><UndoIcon /></IconButton>
                <IconButton data-testid="redo" onClick={handleRedo} disabled={!canRedo}><RedoIcon /></IconButton>
              </Grid>
            </Grid>
          </Stack>
        </Box>
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
