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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

/**
 * Layer item placed inside the editor drawer to handle a mask edition
 *
 * @param {int} id layer identification number
 * @param {int} selectedLayer id of selected layer. If none, defaults to -1
 * @param {function} onSelected trigger function for layer selection
 * @param {function} onDelete trigger function for when layer is deleted
 * @returns the navigation layer item
 */
const NavLayer = ({ id, selectedLayer, visible, onSelected, onDelete, onVisClick }) => {
  const [openAlert, setOpenAlert] = React.useState(false);
  const layerName = 'Layer ' + id;

  const handleDeleteConfirmation = () => {
    setOpenAlert(false);
    onDelete(id);
  };
  return (
    <ListItem>
      <ListItemButton
        id={id}
        disableRipple
        selected={selectedLayer === id}
        onClick={() => onSelected(id)}
      >
        <ListItemIcon>
          <ImageIcon />
        </ListItemIcon>
        <ListItemText primary={layerName} />
      </ListItemButton>
      <IconButton disableTouchRipple aria-label="layer visibility" onClick={() => onVisClick(id)}>
        {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
      </IconButton>
      <IconButton disableTouchRipple aria-label="delete layer" onClick={() => setOpenAlert(true)}>
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        aria-describedby="erase-layer-alert-description"
      >
        <DialogContent>
          <DialogContentText id="erase-layer-alert-description">
            {`Are you sure you want to delete Layer ${layerName}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmation}>Confirm</Button>
          <Button onClick={() => setOpenAlert(false)} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  );
};

export default function Layers({
  layersDef,
  selectedLayer,
  onSelectLayer,
  onDeleteLayer,
  onVisibilityClicked,
}) {
  const layers = layersDef.map((l) => {
    return (
      <NavLayer
        id={l.id}
        key={'layer ' + l.id}
        visible={l.visibility}
        selectedLayer={selectedLayer}
        onSelected={onSelectLayer}
        onDelete={onDeleteLayer}
        onVisClick={onVisibilityClicked}
      />
    );
  });
  return <List>{layers}</List>;
}
