import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

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
