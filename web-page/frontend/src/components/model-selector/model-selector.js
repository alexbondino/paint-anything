import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';

export function ModelSelector({ onHandleSelectModel }) {
  return (
    <FormControl display="flex">
      <FormLabel id="model-select-label">Prediction Quality </FormLabel>
      <RadioGroup
        row
        aria-labelledby="model-select-label"
        name="row-radio-buttons-group"
        onChange={onHandleSelectModel}
        defaultValue={'large_model'}
      >
        <FormControlLabel value="base_model" control={<Radio />} label="Low (Fast)" />
        <FormControlLabel value="large_model" control={<Radio />} label="Medium (Normal)" />
        <Tooltip
          title="⚠️ Might take very long to process"
          placement="top"
          arrow
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
        >
          <FormControlLabel value="huge_model" control={<Radio />} label="High (Slow)" />
        </Tooltip>
      </RadioGroup>
    </FormControl>
  );
}

export default ModelSelector;
