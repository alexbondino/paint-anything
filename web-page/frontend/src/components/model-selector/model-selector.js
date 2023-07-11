import React, { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export function Modelselector({
    onHandleSelectModel
}){
    return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box marginRight={"20px"}>
            <Typography 
            sx={{ flexGrow: 1, fontSize: 13 }} 
            component="div"
            >
            Select the quality of the mask selector.  
            </Typography>
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
  