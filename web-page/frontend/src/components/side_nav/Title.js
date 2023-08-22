import React from 'react';

import Toolbar from '@mui/material/Toolbar';
import BrushIcon from '@mui/icons-material/Brush';
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';

const TitleBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Title = ({ sidebarVisibility, onDrawerOpen }) => {
  return (
    <React.Fragment>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="end"
        onClick={onDrawerOpen}
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
      <TitleBar position="relative" sx={{ height: '65px' }}>
        <Toolbar>
          <BrushIcon sx={{ marginRight: 2 }} />
          <Typography variant="h4" noWrap sx={{ flexGrow: 1 }} component="div">
            Imagine Houses
          </Typography>
        </Toolbar>
      </TitleBar>
    </React.Fragment>
  );
};

export default Title;
