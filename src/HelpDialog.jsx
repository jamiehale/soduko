import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
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
        This is a tool to help solve Sudoku puzzles. Start a new game with a stock puzzle, or enter a custom puzzle.
      </DialogContentText>
      <DialogContentText>
        Click to select a single cell. Click and drag to select multiple cells.
      </DialogContentText>
      <DialogContentText>
        With a single cell selected, type 1-9 to set the cell value. With multiple cells selected, type 1-9 to toggle pencil marks. To toggle pencil marks on a single cell, click and hold on the cell, then type 1-9.
      </DialogContentText>
      <DialogContentText>
        After you set a value, any digit left as a pencil mark in only one cell of a box is filled in automatically, half a second apart. Undo reverses each automatic fill.
      </DialogContentText>
      <DialogContentText>
        Custom puzzles should be 81 characters long, using 1-9 and either &quot;.&quot; or &quot;0&quot; for blanks.
      </DialogContentText>
      <DialogContentText>
        Stock puzzles were shamelessly stolen from <Link href="http://norvig.com/top95.txt" target="_new">http://norvig.com/top95.txt</Link>.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Okay</Button>
    </DialogActions>
  </Dialog>
);

export default HelpDialog;
