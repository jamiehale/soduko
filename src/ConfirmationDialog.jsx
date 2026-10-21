import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

const ConfirmationDialog = ({
  text = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => (
  <Dialog
    open
    onClose={onCancel}
  >
    <DialogContent>
      <DialogContentText>
        {text}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>{cancelText}</Button>
      <Button onClick={onConfirm}>{confirmText}</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
