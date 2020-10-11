import React, { useCallback, useState } from 'react';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

const NewGameDialog = ({
  onNewGame,
  onCancel,
}) => {
  const [puzzle, setPuzzle] = useState('');

  const handleChangePuzzle = useCallback((e) => {
    setPuzzle(R.replace(/[^0-9]/g, '', e.target.value));
  }, [setPuzzle]);

  const handleNewGame = useCallback(() => {
    onNewGame(puzzle);
  }, [onNewGame, puzzle]);

  const isValid = R.length(puzzle) === 81;

  return (
    <Dialog
      open
      onClose={onCancel}
    >
      <DialogContent>
        <TextField
          label="Puzzle"
          value={puzzle}
          InputProps={{ inputProps: { maxLength: 81 } }}
          placeholder="123456789..."
          onChange={handleChangePuzzle}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleNewGame} disabled={!isValid}>Start</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewGameDialog;
