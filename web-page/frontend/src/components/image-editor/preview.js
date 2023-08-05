import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import PreviewIcon from '@mui/icons-material/Preview';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import { Tooltip, Button } from '@mui/material';

// transition for preview dialogue
const PreviewTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Component for the preview image. Visibility of layers is respected
 *
 * @param baseImg corresponds to the image user uploaded
 * @param layersDef layer definition
 * @returns box with curent state of edition
 */
function PreviewImage({ baseImg, layersDef }) {
  const maskImgComps = layersDef
    .filter((l) => l.imgUrl !== null && l.visibility)
    .map((layer) => {
      var canvas = document.getElementById(`canvas-${layer.id}`);
      const img = canvas.toDataURL('image/png');
      try {
        return (
          <img
            key={layer.id}
            src={img}
            alt={`mask_image_${layer.id}`}
            style={{
              zIndex: 1000 - layer.id,
              objectFit: 'contain',
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        );
      } catch {
        console.error(`Image for layer ${layer.id} not found`);
        return;
      }
    });

  return (
    <Box className="preview-image-box" sx={{ position: 'relative' }}>
      <img src={baseImg} alt="base_image" />
      {maskImgComps}
    </Box>
  );
}

// TODO: fix button focus after exiting preview with escape key
export default function PreviewDialog({ layersDef, baseImg, selectedLayer, selectedLayerVisibility }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return [

    <Tooltip title="Preview" placement="top">
          <Button
          className="preview-button"
          disabled={selectedLayer === -1 || !selectedLayerVisibility.visibility}
          onClick={handleOpen}
          >
            <PreviewIcon style={{ width: '43px' }}/>
          </Button>
    </Tooltip>,
    <Dialog
      key={'preview-dialogue'}
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={PreviewTransition}
    >
      <AppBar>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h4" component="div" sx={{ justifyContent: 'center' }}>
            Result Preview
          </Typography>
          <IconButton color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {open ? <PreviewImage baseImg={baseImg} layersDef={layersDef} /> : null}
    </Dialog>,
  ];
}
