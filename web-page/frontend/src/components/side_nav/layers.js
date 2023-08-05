import { useState, useEffect } from 'react';
import './layers.scss';

// icons
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';


// other components
import { List, ListItem, ListItemButton, ListItemIcon } from '@mui/material';
import { Box, Button, IconButton, Slider, Typography, TextField } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { light } from '@mui/material/styles/createPalette';

import DraggableList from './DraggableList';
import reorder from '../../helpers';

function valueLabelFormat(value) {
  return `${value} ${'%'}`;
}

/**
 *  Converts hsl color model to hexadecimal string representation
 * @param {int} h hue value [0-360]
 * @param {int} s saturation value [0-100]
 * @param {int} l lightness value [0-100]
 * @returns hexadecimal string rep
 */
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Hue, saturation and lightness sliders
 * @param {int} layerId
 * @param {int} hue
 * @param {int} saturation
 * @param {int} lightness
 * @param {function} onHSLChange
 * @returns HSL slider for modifying hsl color of layer
 */
const HSLSlider = ({ layerId, hue, saturation, lightness, onHSLChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPoint, setSliderPoint] = useState(50);
  const [newLightness, setNewLightness] = useState(lightness);
  const [now, setNow] = useState(new Date().getTime())

  const handleSliderDragStart = () => {
    setIsDragging(true);
    setNow(new Date().getTime())
  };

  const handleSliderDragEnd = (newValue) => {
    setIsDragging(false);
    const newLightness = Math.min(100, Math.max(0, newValue));
    setSliderPoint(newLightness)
  };

  const handleOnHSLChange = (newValue => {
    setIsDragging(true);
  })

  useEffect(() => {
    
    const timer = setInterval(() => {
      if (isDragging) {

        let adjustedLightness = newLightness + (sliderPoint - 50)/50;
        adjustedLightness = Math.min(100, Math.max(0, adjustedLightness));
        setNewLightness(adjustedLightness);

        console.log(sliderPoint-50)

        console.log("now: ", now);
        console.log("new lightness: ", newLightness);
        console.log("lightness:", lightness)

        onHSLChange([hue, saturation, newLightness], layerId);
      }
    }, 10);  
    return () => clearInterval(timer);
  }, [newLightness, layerId, hue, saturation, onHSLChange, sliderPoint]);

  const sliderOnChange = (newValue) => {
    setSliderPoint(newValue)
    console.log("slider on change: ",sliderPoint)
  }


  return (
    <Box className="sliders-box">
      <Typography variant="button" id="input-slider" gutterBottom>
        Hue
      </Typography>
      <Slider
        id="rHue"
        aria-label="Hue"
        size="small"
        value={hue}
        min={0}
        max={360}
        valueLabelDisplay="auto"
        onChange={(e) => onHSLChange([e.target.value, saturation, lightness], layerId)}
      ></Slider>
      <Typography variant="button" id="input-slider" gutterBottom>
        Saturation
      </Typography>
      <Slider
        id="rSat"
        aria-label="Saturation"
        value={saturation}
        size="small"
        min={0}
        max={100}
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat}
        onChange={(e) => onHSLChange([hue, e.target.value, lightness], layerId)}
      ></Slider>
      <Typography variant="button" id="input-slider" gutterBottom>
        Lightness
      </Typography>
      <Slider
        id="rL"
        aria-label="Lightness"
        size="small"
        min={0}
        max={100}
        color="info"
        value={sliderPoint}
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat((sliderPoint-50)/10)}
        onMouseDown={() => handleOnHSLChange(sliderPoint)}
        onChange={(e) => sliderOnChange(e.target.value)}
        onMouseUp={() => {handleSliderDragEnd(50)}}
        onDragStart={handleSliderDragStart}
        onMouseLeave={() => {handleSliderDragEnd(50)}}
        
      ></Slider>
    </Box>
  );
};

/**
 * Layer item placed inside the editor drawer to handle a mask edition
 *
 * @param {object} layerDef layer definition object
 * @param {int} selectedLayer id of selected layer. If none, defaults to -1
 * @param {function} onSelected hook for layer selection
 * @param {function} onDelete hook for layer elimination
 * @param {function} onVisClick hook for visibility change
 * @param {function} onHSLChange hook for changes in any hsl value
 * @returns the navigation layer item
 */
const NavLayer = ({ layerDef, selectedLayer, onSelected, onDelete, onVisClick, onHSLChange }) => {
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
    <div>
      <ListItem>
        <ListItemButton
          id={layerDef.id}
          disableRipple
          selected={selectedLayer === layerDef.id}
          onClick={() => (openEditionMode ? null : onSelected(layerDef.id))}
          sx={{ borderRadius: '5%' }}
        >
          <ListItemIcon sx={{ minWidth: '30%' }}>
            {layerDef.hsl.length === 3 && layerDef.imgUrl !== null ? (
              <SquareRoundedIcon
                sx={{
                  color: hslToHex(layerDef.hsl[0], layerDef.hsl[1], layerDef.hsl[2]),
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
        {openEditionMode ? (
          <IconButton onClick={handleLayerEditClose}>
            <CheckIcon fontSize="small" sx={{ color: 'green' }} />
          </IconButton>
        ) : (
          <IconButton onClick={handleLayerEditOpen}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton disableTouchRipple aria-label="delete layer" onClick={() => setOpenAlert(true)}>
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
            lightness={layerDef.hsl[2]}
            onHSLChange={onHSLChange}
          />
        </ListItem>
      ) : null}
    </div>
  );
};

export default function Layers({
  layersDef,
  selectedLayer,
  onSelectLayer,
  onDeleteLayer,
  onVisibilityClicked,
  onHSLChange,
  onNewLayerDef,
}) {
  const onDragEnd = ({ destination, source }) => {
    // dropped outside of the list
    if (!destination) return;
    const newLayersDef = reorder(layersDef, source.index, destination.index);
    onNewLayerDef(newLayersDef);
  };
  const layers = layersDef.map((l) => {
    return (
      <NavLayer
        key={'layer ' + l.id}
        layerDef={l}
        selectedLayer={selectedLayer}
        onSelected={onSelectLayer}
        onDelete={onDeleteLayer}
        onVisClick={onVisibilityClicked}
        onHSLChange={onHSLChange}
      />
    );
  });
  return <List>{layers}</List>;
}
