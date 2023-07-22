import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { InputLabel, Select, MenuItem } from '@mui/material';

export function ModelSelector({
    onHandleSelectModel,
}){
    return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box 
        marginRight={"60px"}
        marginTop={"30px"}
        >
            <InputLabel id="model-select-label">Model Quality</InputLabel>
            <Select 
            onChange={onHandleSelectModel} 
            defaultValue="large_model"
            sx={{ width: '250px', height: '20px' }}>
            <MenuItem value="base_model">Low Quality (Fast)</MenuItem>
            <MenuItem value="large_model">Medium Quality (Normal)</MenuItem>
            <MenuItem value="huge_model">High Quality (Slow)</MenuItem>
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
  
  export default ModelSelector;
  