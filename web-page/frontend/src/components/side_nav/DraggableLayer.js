import * as React from 'react';
import { useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

// icons
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import TitleIcon from '@mui/icons-material/Title';
import CheckIcon from '@mui/icons-material/Check';

// other components
import { ListItem, ListItemButton, ListItemIcon, Tooltip } from '@mui/material';
import { Button, IconButton, TextField } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';

import HSLSlider from './HSLSlider';
import { hslToPreviewHex } from '../../helpers';

const DraggableLayer = ({
  layerDef,
  index,
  selectedLayer,
  onSelected,
  onDelete,
  onVisClick,
  onHSLChange,
}) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [openEditionMode, setEditionMode] = useState(false);
  const layerName = 'Layer ' + layerDef.id;

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  const handleKeyPress = (event) => {
    if (openEditionMode && event.keyCode === 13) {
      setEditionMode(false);
    }
  };

  const handleDeleteConfirmation = () => {
    setOpenAlert(false);
    onDelete(layerDef.id);
  };

  const handleLayerEditOpen = () => {
    setEditionMode(true);
  };

  const handleLayerEditClose = () => {
    setEditionMode(false);
  };

  return (
    <Draggable key={`${layerDef.id}`} draggableId={`${layerDef.id}`} index={index} d>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <ListItem>
            <ListItemButton
              id={layerDef.id}
              disableRipple
              selected={selectedLayer === layerDef.id}
              onClick={() => (openEditionMode ? null : onSelected(layerDef.id))}
              sx={{ borderRadius: '5%' }}
              {...provided.dragHandleProps}
            >
              <ListItemIcon sx={{ minWidth: '30%' }}>
                {layerDef.hsl.length === 3 && layerDef.imgUrl !== null ? (
                  <SquareRoundedIcon
                    sx={{
                      color: hslToPreviewHex(
                        layerDef.hsl[0],
                        layerDef.hsl[1],
                        layerDef.hsl[2],
                        layerDef.meanLightness
                      ),
                      stroke: 'black',
                      strokeWidth: 1,
                    }}
                  />
                ) : (
                  <SquareRoundedIcon
                    sx={{
                      color: '#bdbdbd',
                      stroke: 'black',
                      strokeWidth: 1,
                      strokeDasharray: '3',
                    }}
                  />
                )}
              </ListItemIcon>
              <TextField
                defaultValue={layerName}
                variant={'standard'}
                sx={{
                  pointerEvents: openEditionMode ? 'auto' : 'none',
                }}
                multiline={true}
                InputProps={{
                  disableUnderline: !openEditionMode,
                  readOnly: !openEditionMode,
                }}
              />
            </ListItemButton>
            {openEditionMode ? (
              <Tooltip title="confirm" placement="top" arrow>
                <IconButton onClick={handleLayerEditClose}>
                  <CheckIcon fontSize="small" sx={{ color: 'green' }} />
                </IconButton>
              </Tooltip>
            ) : (
              <IconButton onClick={handleLayerEditOpen}>
                <TitleIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              disableTouchRipple
              aria-label="layer visibility"
              onClick={() => onVisClick(layerDef.id)}
            >
              {layerDef.visibility ? (
                <VisibilityIcon fontSize="small" />
              ) : (
                <VisibilityOffIcon fontSize="small" />
              )}
            </IconButton>
            <IconButton
              disableTouchRipple
              aria-label="delete layer"
              onClick={() => setOpenAlert(true)}
            >
              <DeleteIcon fontSize="small" />
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
          {selectedLayer === layerDef.id && layerDef.hsl.length === 3 ? (
            <ListItem>
              <HSLSlider
                layerId={layerDef.id}
                hue={layerDef.hsl[0]}
                saturation={layerDef.hsl[1]}
                existingOffset={layerDef.hsl[2]}
                onHSLChange={onHSLChange}
              />
            </ListItem>
          ) : null}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableLayer;
