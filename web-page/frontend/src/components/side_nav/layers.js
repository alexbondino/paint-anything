import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

/**
 * Layer item placed inside the editor drawer to handle a mask edition
 *
 * @param {int} id layer identification number
 * @param {int} selectedIndex id of selected layer. If none, defaults to -1
 * @param {function} onLayerSelected trigger function for layer selection
 * @param {function} onLayerDelete trigger function for when layer is deleted
 * @returns the navigation layer item
 */
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
  const layers = layerIds.map((layerId) => {
    return (
      <NavLayer
        key={'layer ' + layerId}
        id={layerId}
        selectedIndex={selectedIndex}
        onLayerSelected={onSelectLayer}
        onLayerDelete={onDeleteLayer}
      />
    );
  });
  return <List>{layers}</List>;
}
