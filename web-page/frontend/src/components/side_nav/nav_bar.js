import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BrushIcon from '@mui/icons-material/Brush';
import LayersIcon from '@mui/icons-material/Layers';
import DownloadIcon from '@mui/icons-material/Download';
import GroupsIcon from '@mui/icons-material/Groups';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import Layers from './layers';

const drawerWidth = 240;

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

export default function PersistentDrawerRight() {
  const theme = createTheme({
    palette: {
      primary: pink,
      secondary: {
        main: '#880e4f',
      },
    },
  });
  const [open, setOpen] = React.useState(false);
  const [expandLayers, setExpandLayers] = React.useState(false);
  const [layerIds, setLayerIds] = React.useState([]);
  const [selectedLayerIdx, setSelectedLayerIdx] = React.useState(0);

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
    const layerId = layerIds.length + 1;
    const newLayerIds = [...layerIds, layerId];
    setLayerIds(newLayerIds);
    if (!expandLayers) {
      setExpandLayers(!expandLayers);
    }
  };

  function handleSelectLayer(layerId) {
    if (layerId === selectedLayerIdx) {
      setSelectedLayerIdx(0);
      return;
    }
    setSelectedLayerIdx(layerId);
  }

  function handleLayerDelete(layerId) {
    const newLayerIds = [...layerIds];
    newLayerIds.pop(layerId);
    if (selectedLayerIdx === layerId) {
      setSelectedLayerIdx(0);
    }
    setLayerIds(newLayerIds);
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
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
            <ListItem>
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
            <Collapse in={expandLayers} timeout="auto" unmountOnExit>
              <Layers
                layerIds={layerIds}
                selectedIndex={selectedLayerIdx}
                onDeleteLayer={handleLayerDelete}
                onSelectLayer={handleSelectLayer}
              />
            </Collapse>
            <ListItem key="Download Result" disablePadding>
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
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
