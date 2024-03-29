import React from "react"
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


export function LoadingComponent({
    loaderVisibility,
  }) {
    return (
      <Box
        sx={{
          visibility: loaderVisibility === true ? 'visible' : 'hidden',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <CircularProgress size={80}/>
      </Box>
    );
  }
  
  export default LoadingComponent;
  