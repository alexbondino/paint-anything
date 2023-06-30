import * as React from 'react';
import { useRef } from 'react';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import './nav-bar.scss';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import MuiAppBar from '@mui/material/AppBar';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Slide from '@mui/material/Slide';
import Layers from './layers';
import axios from 'axios';

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
import PreviewIcon from '@mui/icons-material/Preview';
import CloseIcon from '@mui/icons-material/Close';

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

const PreviewTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function PreviewDialog({ layersDef, baseImg }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const maskImgComps = layersDef
    .filter((l) => l.imgUrl !== null)
    .map((layer) => {
      try {
        return (
          <img
            key={layer.id}
            src={layer.imgUrl}
            alt={`mask_image_${layer.id}`}
            style={{
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
        console.log(`Image for layer ${layer.id} not found`);
        return;
      }
    });

  return [
    <ListItemButton onClick={handleOpen}>
      <ListItemIcon>
        <PreviewIcon />
      </ListItemIcon>
      <ListItemText primary="See Preview" />
    </ListItemButton>,
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={PreviewTransition}>
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
      <Box className="preview-image-box" sx={{ position: 'relative' }}>
        <img src={baseImg} alt="base_image" />
        {maskImgComps}
      </Box>
    </Dialog>,
  ];
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export function ImageEditorDrawer({
  baseImg,
  sidebarVisibility,
  layersDef,
  selectedLayer,
  onNewLayerDef,
  onNewLayerSelected,
  onImageUpload,
  onHSLChange,
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [expandLayers, setExpandLayers] = React.useState(true);
  const lastLayerId = layersDef.length > 0 ? Math.max(...layersDef.map((l) => l.id)) : -1;
  const fileInputRef = useRef(null);

  const handleLayersClick = () => {
    setExpandLayers(!expandLayers);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function handleLayerVisibilityClick(layerId) {
    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === layerId);
    newLayerDef[layerPos].visibility = !newLayerDef[layerPos].visibility;
    onNewLayerDef(newLayerDef);
  }

  const handleAddLayer = async () => {
    // by default, each layer is created with the name as the index of last layer created + 1
    const newLayersDef = [
      ...layersDef,
      { id: lastLayerId + 1, visibility: true, imgUrl: null, hsl: [] },
    ];
    onNewLayerDef(newLayersDef);
    // open layer list if it is not already open
    if (!expandLayers) {
      setExpandLayers(!expandLayers);
    }
  };

  function handleSelectLayer(layerId) {
    // deselect layer if it has already been selected
    if (layerId === selectedLayer) {
      onNewLayerSelected('');
      return;
    }
    onNewLayerSelected(layerId);
  }

  async function handleLayerDelete(layerId) {
    const newLayerDef = [...layersDef.filter((l) => l.id !== layerId)];
    if (selectedLayer === layerId) {
      onNewLayerSelected('');
    }
    fetch(
      'http://localhost:8000/api/delete-mask?' +
        new URLSearchParams({
          layer_id: layerId,
        })
    )
      .then((response) => {
        if (response.status == 200) {
          console.log('layer file successfully deleted');
        } else {
          console.log('failed deleting mask file with error: ', response.message);
        }
      })
      .catch((error) => {
        console.error('Error deleting mask file ', error);
      });
    onNewLayerDef(newLayerDef);
  }

  function handleUploadButtonClick() {
    fileInputRef.current.click();
  }

  async function handleDownloadButtonClick() {
    try {
      const response = await axios.get('http://localhost:8000/api/image_downloader', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'image/png' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'imagen.png');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
    }
  }

  return (
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
            sx={{ ...(open && { display: 'none' }), display: sidebarVisibility }}
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
            display: sidebarVisibility,
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
            <IconButton
              color="inherit"
              aria-label="add layer"
              onClick={async () => await handleAddLayer()}
            >
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
              layersDef={layersDef}
              selectedLayer={selectedLayer}
              onSelectLayer={handleSelectLayer}
              onDeleteLayer={handleLayerDelete}
              onVisibilityClicked={handleLayerVisibilityClick}
              onHSLChange={onHSLChange}
            />
          </Collapse>
          <ListItem key="open_preview" disablePadding>
            <PreviewDialog layersDef={layersDef} baseImg={baseImg} />
          </ListItem>
          <ListItem key="download_result" disablePadding>
            <ListItemButton onClick={handleDownloadButtonClick}>
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
          <ListItem disablePadding>
            <ListItemButton onClick={handleUploadButtonClick} variant="contained">
              <ListItemIcon>
                <DownloadForOfflineIcon />
              </ListItemIcon>
              <ListItemText primary="Upload Image" />
              <input
                hidden
                type="file"
                ref={fileInputRef}
                onChange={(event) => onImageUpload(event.target.files[0])}
                onClick={(event) => event.stopPropagation()} // Evitar la propagación
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}
