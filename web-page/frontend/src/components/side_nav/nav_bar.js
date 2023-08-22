import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import './nav-bar.scss';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';

// list components
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// icons
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LayersIcon from '@mui/icons-material/Layers';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// project module
import Layers from './Layers';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    }),
  })
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export function ImageEditorDrawer({
  sidebarVisibility,
  layersDef,
  selectedLayer,
  onNewLayerDef,
  onImageUpload,
  onHSLChange,
  onSelectLayer,
  onHandleLayerVisibilityClick,
  onDeleteLayer,
  onHandleSelectModel,
  modelSelected,
  openModelConfirmation,
  onCancelModelConfirmation,
  onConfirmModelConfirmation,
  drawerOpen,
  onDrawerClose,
  currentImage,
}) {
  const theme = useTheme();
  const [expandLayers, setExpandLayers] = React.useState(true);
  const lastLayerId = layersDef.length > 0 ? Math.max(...layersDef.map((l) => l.id)) : -1;

  const handleLayersClick = () => {
    setExpandLayers(!expandLayers);
  };

  const handleAddLayer = async () => {
    // by default, each layer is created with the name as the index of last layer created + 1
    const newLayersDef = [
      {
        id: lastLayerId + 1,
        visibility: true,
        imgUrl: null,
        hsl: [],
      },
      ...layersDef,
    ];
    onNewLayerDef(newLayersDef);
    // open layer list if it is not already open
    if (!expandLayers) {
      setExpandLayers(!expandLayers);
    }
    onSelectLayer(lastLayerId + 1);
  };

  const handleModelConfirmationClose = () => {
    onCancelModelConfirmation();
  };

  const handleModelConfirmationConfirm = (event) => {
    onConfirmModelConfirmation();
    onImageUpload(currentImage);
  };

  return (
    <Box
      sx={{
        display: drawerOpen ? 'flex' : 'none',
      }}
    >
      <CssBaseline />
      {sidebarVisibility ? (
        <Box>
          <Main>
            <DrawerHeader />
          </Main>
          <Drawer className="sidenav" variant="persistent" anchor="right" open={drawerOpen}>
            <DrawerHeader>
              <IconButton onClick={onDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <Box>
              <List>
                <ListItem key="layers">
                  <ListItemIcon>
                    <LayersIcon />
                  </ListItemIcon>
                  <ListItemText primary="Layers" />
                  <IconButton
                    color="inherit"
                    aria-label="add layer"
                    onClick={async () => await handleAddLayer()}
                  >
                    <AddIcon />
                  </IconButton>
                  {expandLayers ? (
                    <IconButton
                      color="inherit"
                      aria-label="retract layers"
                      onClick={handleLayersClick}
                    >
                      <ExpandLess />{' '}
                    </IconButton>
                  ) : (
                    <IconButton
                      color="inherit"
                      aria-label="retract layers"
                      onClick={handleLayersClick}
                    >
                      <ExpandMore />{' '}
                    </IconButton>
                  )}
                </ListItem>
                <Collapse key="layer_drawer" in={expandLayers} timeout="auto" unmountOnExit>
                  <Layers
                    layersDef={layersDef}
                    selectedLayer={selectedLayer}
                    onSelectLayer={onSelectLayer}
                    onDeleteLayer={onDeleteLayer}
                    onVisibilityClicked={onHandleLayerVisibilityClick}
                    onHSLChange={onHSLChange}
                    onNewLayerDef={onNewLayerDef}
                  />
                </Collapse>
              </List>
            </Box>
            <Box>
              <List
                sx={{
                  position: 'fixed',
                  bottom: 0,
                  backgroundColor: 'white',
                  width: '100%',
                  borderLeft: '1px solid #e0e0e0',
                  m: -0.15,
                }}
              >
                <Divider />
                <ListItem key="model_select" disablePadding>
                  <FormControl sx={{ width: '100%', height: '50px' }}>
                    <InputLabel id="model-select-label">Model Quality</InputLabel>
                    <Select
                      className="model-selector"
                      onChange={onHandleSelectModel}
                      labelId="model-select-label"
                      value={modelSelected}
                    >
                      <MenuItem value="base_model">Low Quality (Fast)</MenuItem>
                      <MenuItem value="large_model">Medium Quality (Normal)</MenuItem>
                      <MenuItem value="huge_model">High Quality (Slow)</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton variant="contained" component="label">
                    <ListItemIcon>
                      <DriveFolderUploadIcon />
                    </ListItemIcon>
                    <ListItemText primary="Replace Image" />
                    <input
                      hidden
                      type="file"
                      onChange={(event) => onImageUpload(event.target.files[0])}
                      onClick={(event) => {
                        event.target.value = null;
                        event.stopPropagation();
                      }} // Stop Propagation to parent components (Avoids "cancel button" to call "On Change")
                    />
                  </ListItemButton>
                </ListItem>
              </List>
              <Dialog open={openModelConfirmation} onClose={handleModelConfirmationClose}>
                <DialogTitle>Model Change Confirmation Dialog</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    ¿Are you sure you want to change the Model Quality? All changes will be errased.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleModelConfirmationClose} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleModelConfirmationConfirm} color="primary" autoFocus>
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Drawer>
        </Box>
      ) : null}
    </Box>
  );
}
