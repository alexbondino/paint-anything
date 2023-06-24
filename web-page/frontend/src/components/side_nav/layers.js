import * as React from 'react';

import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function valueLabelFormat(value) {
  return `${value} ${'%'}`;
}

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

const HSLSlider = ({ layerId, hue, saturation, lightness, onHSLChange }) => {
  return (
    <Box className="sliders-box" sx={{ display: 'flex', flexDirection: 'column', mt: 0, mx: 3 }}>
      <Typography variant="button" id="input-slider" gutterBottom>
        Hue
      </Typography>
      <Slider
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
        aria-label="Lightness"
        value={lightness}
        size="small"
        min={0}
        max={100}
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat}
        onChange={(e) => onHSLChange([hue, saturation, e.target.value], layerId)}
      ></Slider>
    </Box>
  );
};

/**
 * Layer item placed inside the editor drawer to handle a mask edition
 *
 * @param {int} id layer identification number
 * @param {int} selectedLayer id of selected layer. If none, defaults to -1
 * @param {function} onSelected trigger function for layer selection
 * @param {function} onDelete trigger function for when layer is deleted
 * @returns the navigation layer item
 */
const NavLayer = ({
  id,
  selectedLayer,
  visible,
  hsl,
  onSelected,
  onDelete,
  onVisClick,
  onHSLChange,
}) => {
  const [openAlert, setOpenAlert] = React.useState(false);
  const layerName = 'Layer ' + id;

  const handleDeleteConfirmation = () => {
    setOpenAlert(false);
    onDelete(id);
  };
  return (
    <div>
      <ListItem>
        <ListItemButton
          id={id}
          disableRipple
          selected={selectedLayer === id}
          onClick={() => onSelected(id)}
        >
          <ListItemIcon>
            {hsl.length === 3 ? (
              <SquareRoundedIcon
                sx={{
                  color: hslToHex(hsl[0], hsl[1], 50),
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
      {selectedLayer === id && hsl.length === 3 ? (
        <ListItem>
          <HSLSlider
            layerId={id}
            hue={hsl[0]}
            saturation={hsl[1]}
            lightness={hsl[2]}
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
}) {
  const layers = layersDef.map((l) => {
    return (
      <NavLayer
        id={l.id}
        key={'layer ' + l.id}
        visible={l.visibility}
        selectedLayer={selectedLayer}
        hsl={l.hsl}
        onSelected={onSelectLayer}
        onDelete={onDeleteLayer}
        onVisClick={onVisibilityClicked}
        onHSLChange={onHSLChange}
      />
    );
  });
  return <List>{layers}</List>;
}
