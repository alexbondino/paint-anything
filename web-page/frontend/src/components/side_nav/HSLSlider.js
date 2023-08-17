import React, { useEffect, useState } from 'react';
import { Box, Slider, Typography } from '@mui/material';
import './gradients.scss'; // Importa el archivo de estilos

function valueLabelFormat(value) {
  return `${value} ${'%'}`;
}

const HSLSlider = ({ layerId, hue, saturation, onHSLChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPoint, setSliderPoint] = useState(50);
  const [lightnessOffset, setLightnessOffset] = useState(0);

  const handleSliderDragStart = () => {
    setIsDragging(true);
  };

  const handleSliderDragEnd = (newValue) => {
    setIsDragging(false);
    const newLightness = Math.min(100, Math.max(0, newValue));
    setSliderPoint(newLightness);
  };

  const handleOnHSLChange = (newValue) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isDragging) {
        let adjustedOffset = lightnessOffset + (sliderPoint - 50) / 50;
        adjustedOffset = Math.min(100, Math.max(-100, adjustedOffset));
        setLightnessOffset(adjustedOffset);

        console.log('new lightness offset: ', lightnessOffset);

        onHSLChange([hue, saturation, lightnessOffset], layerId);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [lightnessOffset, layerId, hue, saturation, onHSLChange, sliderPoint]);

  const sliderOnChange = (newValue) => {
    setSliderPoint(newValue);
  };

  const getHueGradientBackground = () => {
    const hueGradientColor = `linear-gradient(to right, 
      hsl(0, ${saturation}%, 50%), 
      hsl(60, ${saturation}%, 50%), 
      hsl(120, ${saturation}%, 50%), 
      hsl(180, ${saturation}%, 50%), 
      hsl(240, ${saturation}%, 50%), 
      hsl(300, ${saturation}%, 50%), 
      hsl(360, ${saturation}%, 50%))`;
    return { background: hueGradientColor };
  };

  const getSaturationGradientBackground = () => {
    const saturationGradientColor = `linear-gradient(to right, 
      hsl(${hue}, 0%, 50%), 
      hsl(${hue}, 100%, 50%))`;
    return { background: saturationGradientColor };
  };  

  const getLightnessGradientBackground = () => {
    const lightnessGradientColor = `linear-gradient(to right, 
      hsl(${hue}, ${saturation}%, 0%), 
      hsl(${hue}, ${saturation}%, 100%))`;
    return { background: lightnessGradientColor };
  };
  
  

  return (
    <Box className="sliders-box" sx={{ draggable: false }}>
      <Typography variant="button" id="input-slider" gutterBottom className='text-slider'>
        Hue
      </Typography>
      <Slider
        id="rHue"
        aria-label="Hue"
        size="small"
        value={hue}
        min={0}
        max={360}
        valueLabelDisplay="auto"
        style={getHueGradientBackground()}
        onChange={(e) => onHSLChange([e.target.value, saturation, lightnessOffset], layerId)}
        className="hue-saturation-slider"
      />
      <Typography variant="button" id="input-slider" gutterBottom className='text-slider'>
        Saturation
      </Typography>
      <Slider
        id="rSat"
        aria-label="Saturation"
        value={saturation}
        size="small"
        min={0}
        max={100}
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat}
        style={getSaturationGradientBackground()}
        onChange={(e) => onHSLChange([hue, e.target.value, lightnessOffset], layerId)}
        className="hue-saturation-slider"
      />
      <Typography variant="button" id="input-slider" gutterBottom className='text-slider'>
        Lightness
      </Typography>
      <Slider
        id="rL"
        aria-label="Lightness"
        size='small'
        min={0}
        max={100}
        color="info"
        value={sliderPoint}
        style={getLightnessGradientBackground()}
        className="lightness-slider"
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat((sliderPoint - 50) / 10)}
        onMouseDown={() => handleOnHSLChange(sliderPoint)}
        onChange={(e) => sliderOnChange(e.target.value)}
        onMouseUp={() => {
          handleSliderDragEnd(50);
        }}
        onDragStart={handleSliderDragStart}
        onMouseLeave={() => {
          handleSliderDragEnd(50);
        }}
      />
    </Box>
  );
};

export default HSLSlider;
