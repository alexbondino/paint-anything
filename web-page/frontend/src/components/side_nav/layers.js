import * as React from 'react';
import IconButton from '@mui/material/IconButton';

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';

const NavLayer = ({ id, selectedIndex, onLayerSelected, onLayerDelete }) => {
  const [openAlert, setOpenAlert] = React.useState(false);
  const handleDeleteAlertOpen = () => {
    setOpenAlert(true);
  };

  const handleDeleteAlertClose = () => {
    setOpenAlert(false);
  };

  const handleDeleteConfirmation = () => {
    handleDeleteAlertClose();
    onLayerDelete(id);
  };

  return (
    <ListItem>
      <ListItemButton
        id={id}
        disableRipple
        selected={selectedIndex === id}
        onClick={() => onLayerSelected(id)}
      >
        <ListItemIcon>
          <ImageIcon />
        </ListItemIcon>
        <ListItemText primary={'Layer ' + id} />
      </ListItemButton>
      <IconButton
        color="inherit"
        disableTouchRipple
        aria-label="delete layer"
        onClick={handleDeleteAlertOpen}
      >
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={openAlert}
        onClose={handleDeleteAlertClose}
        aria-describedby="erase-layer-alert-description"
      >
        <DialogContent>
          <DialogContentText id="erase-layer-alert-description">
            {`Are you sure you want to delete Layer ${id}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmation}>Confirm</Button>
          <Button onClick={handleDeleteAlertClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  );
};

export default function Layers({ layerIds, selectedIndex, onSelectLayer, onDeleteLayer }) {
  return layerIds.map((layerId) => {
    console.log(layerId);
    return (
      <NavLayer
        id={layerId}
        selectedIndex={selectedIndex}
        onLayerSelected={onSelectLayer}
        onLayerDelete={onDeleteLayer}
      />
    );
  });
}
