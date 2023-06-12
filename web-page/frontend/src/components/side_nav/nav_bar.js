import * as React from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Layers from './layers';

// list components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import BrushIcon from '@mui/icons-material/Brush';
import LayersIcon from '@mui/icons-material/Layers';
import DownloadIcon from '@mui/icons-material/Download';
import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { ImageUploader } from '../upload_image/upload_image.js'

// controls the width of the drawer
const drawerWidth = 280;

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

export default function ImageEditorDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [expandLayers, setExpandLayers] = React.useState(true);
  // layerIds holds the list of existing layer ids
  const [layerNames, setLayerNames] = React.useState(new Set());
  const [lastLayerId, setLastLayerId] = React.useState(1);
  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState('');
  // map to indicate layer visibility
  const [layersVisibility, setLayersVisibility] = React.useState(new Map());
  const [uploaderVisibility, setUploaderVisibility] = React.useState({ display: 'none' })

  const handleLayersClick = () => {
    setExpandLayers(!expandLayers);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleAddLayer = () => {
    // by default, each layer is created with the name as the index of last layer created + 1
    setLastLayerId(lastLayerId + 1);
    const layerName = lastLayerId.toString();
    const newLayerNames = new Set(layerNames).add(layerName);
    // layer is visible on creation
    const newLayerVisibilities = new Map(layersVisibility).set(layerName, true);
    setLayerNames(newLayerNames);
    setLayersVisibility(newLayerVisibilities);
    // open layer list if it is not already open
    if (!expandLayers) {
      setExpandLayers(!expandLayers);
    }
  };


  function handleSelectLayer(layerName) {
    // deselect layer if it has already been selected
    if (layerName === selectedLayer) {
      setSelectedLayer('');
      return;
    }
    setSelectedLayer(layerName);
  }

  function handleLayerVisibilityClick(layerName) {
    const newLayersVisibility = new Map(layersVisibility).set(
      layerName,
      !layersVisibility.get(layerName)
    );
    setLayersVisibility(newLayersVisibility);
  }

  function handleLayerDelete(layerName) {
    const newLayerNames = new Set(layerNames);
    const newLayersVisibility = new Map(layersVisibility);
    newLayerNames.delete(layerName);
    newLayersVisibility.delete(layerName);
    if (selectedLayer === layerName) {
      setSelectedLayer('');
    }
    setLayerNames(newLayerNames);
    setLayersVisibility(newLayersVisibility);
  }

  return (
    <Box sx={{ disply: "flex" }}>
      <CssBaseline />
      <TitleBar position="fixed" open={open}>
        <Toolbar>
          <BrushIcon />
          <Typography variant="h4" noWrap sx={{ flexGrow: 1 }} component="div">
            Imagine Houses
          </Typography>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            sx={{ ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </TitleBar>
      <Main open={open}>
        <DrawerHeader />
        <Typography paragraph>Change the colour of any object, in the way you see fit</Typography>
      </Main>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
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
        <List>
          <ListItem key="layers">
            <ListItemIcon>
              <LayersIcon />
            </ListItemIcon>
            <ListItemText primary="Layers" />
            <IconButton color="inherit" aria-label="add layer" onClick={handleAddLayer}>
              <AddIcon />
            </IconButton>
            {expandLayers ? (
              <IconButton color="inherit" aria-label="retract layers" onClick={handleLayersClick}>
                <ExpandLess />{' '}
              </IconButton>
            ) : (
              <IconButton color="inherit" aria-label="retract layers" onClick={handleLayersClick}>
                <ExpandMore />{' '}
              </IconButton>
            )}
          </ListItem>
          <Collapse key="layer_drawer" in={expandLayers} timeout="auto" unmountOnExit>
            <Layers
              layerNames={layerNames}
              selectedLayer={selectedLayer}
              layersVisibility={layersVisibility}
              onSelectLayer={handleSelectLayer}
              onDeleteLayer={handleLayerDelete}
              onVisibilityClicked={handleLayerVisibilityClick}
            />
          </Collapse>
          <ListItem key="download_result" disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary="Download Result" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          {[['Developers', <GroupsIcon />]].map((text, index) => (
            <ListItem key={text[0]} disablePadding>
              <ListItemButton>
                <ListItemIcon>{text[1]}</ListItemIcon>
                <ListItemText primary={text[0]} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {[['Upload Image', <DownloadForOfflineIcon />]].map((text, index) => (
            <ListItem key={text[0]} disablePadding>
              <ListItemButton>
                <ListItemIcon
                >{text[1]}</ListItemIcon>
                <ListItemText primary={text[0]} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
