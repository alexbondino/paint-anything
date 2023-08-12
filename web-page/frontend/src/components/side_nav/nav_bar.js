import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import './nav-bar.scss';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
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
import MenuIcon from '@mui/icons-material/Menu';
import BrushIcon from '@mui/icons-material/Brush';
import LayersIcon from '@mui/icons-material/Layers';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// project module
import Layers from './Layers';

// controls the width of the drawer
const drawerWidth = '300px';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    }),
  })
);

const TitleBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  }),
}));

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
  currentImage,
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [expandLayers, setExpandLayers] = React.useState(true);
  const lastLayerId = layersDef.length > 0 ? Math.max(...layersDef.map((l) => l.id)) : -1;

  const handleLayersClick = () => {
    setExpandLayers(!expandLayers);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
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
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="end"
        onClick={handleDrawerOpen}
        sx={{
          display: sidebarVisibility ? 'flex' : 'none',
          position: 'absolute',
          top: '15px',
          right: '25px',
          zIndex: 1,
        }}
      >
        <MenuIcon sx={{ color: 'white' }} />
      </IconButton>
      <TitleBar position="relative" open={open} sx={{ height: '65px', width: '100%' }}>
        <Toolbar>
          <BrushIcon sx={{ marginRight: 2 }} />
          <Typography variant="h4" noWrap sx={{ flexGrow: 1 }} component="div">
            Imagine Houses
          </Typography>
        </Toolbar>
      </TitleBar>

      {sidebarVisibility ? (
        <Box>
          <Main>
            <DrawerHeader />
          </Main>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                display: sidebarVisibility,
                height: '90%',
              },
            }}
            variant="persistent"
            anchor="right"
            open={open}
          >
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
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
                      onChange={onHandleSelectModel}
                      labelId="model-select-label"
                      value={modelSelected}
                      style={{ width: drawerWidth, height: '50px', border: 0 }}
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
