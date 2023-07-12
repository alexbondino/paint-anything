import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export function Modelselector({
    onHandleSelectModel,
    sidebarVisibility,
}){
    return (
    <div style={{ display: !sidebarVisibility ? 'flex' : 'none', justifyContent: 'flex-end' }}>
        <Box 
        marginRight={"20px"}
        marginBottom={"40px"}
        >
            <InputLabel id="model-select-label">Model Quality</InputLabel>
            <Select 
            onChange={onHandleSelectModel} 
            defaultValue="option2"
            sx={{ width: '250px', height: '20px' }}>
            <MenuItem value="option1">Low Quality (Fast)</MenuItem>
            <MenuItem value="option2">Medium Quality (Normal)</MenuItem>
            <MenuItem value="option3">High Quality (Slow)</MenuItem>
            </Select>
            <Typography 
            sx={{ flexGrow: 1, fontSize: 13 }} 
            component="div"
            >
            (High quality can take some time to load).  
            </Typography>
        </Box>
    </div>
    );
  };
  
  export default Modelselector;
  