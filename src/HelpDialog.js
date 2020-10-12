import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { version } from '../package.json';

const HelpDialog = ({
  onClose,
}) => (
  <Dialog
    open
    onClose={onClose}
  >
    <DialogTitle>soduko v{version}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        This is a tool for helping solve Sudoku puzzles. Play with the stock boards or enter a custom board.
      </DialogContentText>
      <DialogContentText>
        Click to select a single cell. Click and drag to select multiple cells.
      </DialogContentText>
      <DialogContentText>
        With a single cell selected, type 1-9 to set the cell value. With multiple cells selected, type 1-9 to toggle pencil marks. To toggle pencil marks on a single cell, click and hold on the cell, then type 1-9.
      </DialogContentText>
      <DialogContentText>
        Custom boards should be 81 characters long, using 1-9 and either "." or "0" for blanks.
      </DialogContentText>
      <DialogContentText>
        Stock boards were shamelessly stolen from <Link href="http://magictour.free.fr/top95" target="_new">http://magictour.free.fr/top95</Link>.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Okay</Button>
    </DialogActions>
  </Dialog>
);

export default HelpDialog;
