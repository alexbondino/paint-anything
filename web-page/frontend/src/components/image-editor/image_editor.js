import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import './image-editor.scss';

function valueLabelFormat(value) {
  return `${value} ${'%'}`;
}

/*
 * Image editor
 */
export default function ImageEditor({ baseImg, maskImgs, sidebarVisibility, layersDef }) {
  // TODO: Get image from backend
  //Get an image from link and display it.

  const maskImgComps = layersDef.map((layer) => {
    try {
      const maskUrl = maskImgs.find((mask) => mask.id == layer.id);
      if (!maskUrl) {
        return;
      }
      return (
        <img
          src={maskImgs.find((mask) => mask.id === layer.id).img}
          alt={`mask_image_${layer.id}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            visibility: layer.visibility ? 'visible' : 'hidden',
          }}
        />
      );
    } catch {
      console.log(`Image for layer ${layer.id} not found`);
      return;
    }
  });

  return (
    <Box className="background-full" sx={{ display: sidebarVisibility, flexDirection: 'column' }}>
      <Box className="image-box" sx={{ position: 'relative' }}>
        <img src={baseImg} alt="base_image" />
        {maskImgComps}
      </Box>
      <Box className="sliders-box" sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="button" id="input-slider" gutterBottom>
          Hue
        </Typography>
        <Slider
          aria-label="Hue"
          size="small"
          default-value={0}
          min={0}
          max={360}
          valueLabelDisplay="auto"
        ></Slider>
        <Typography variant="button" id="input-slider" gutterBottom>
          Saturation
        </Typography>
        <Slider
          aria-label="Saturation"
          default-value={0}
          size="small"
          min={0}
          max={100}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat}
        ></Slider>
        <Typography variant="button" id="input-slider" gutterBottom>
          Lightness
        </Typography>
        <Slider
          aria-label="Lightness"
          default-value={0}
          size="small"
          min={0}
          max={100}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat}
        ></Slider>
      </Box>
    </Box>
  );
}
