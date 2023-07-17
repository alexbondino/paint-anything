import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


function ModelChangeConfirmation({
    open,
    onCancel,
    onConfirm,
    onImageUpload,
    currentImage,
}) {
    const handleClose = () => {
        onCancel();
      };
    const handleConfirm = (event) => {
        onConfirm();
        onImageUpload(currentImage);
    }    
  return (
    <Dialog open={open} onClose={handleClose} >
      <DialogTitle>Model Change Confirmation Dialog</DialogTitle>
      <DialogContent>
        <DialogContentText>¿Are you sure you want to change the Model Quality? All changes will be errased.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelChangeConfirmation;
