import { useEffect, useState } from 'react';
import { Box, Slider, Typography } from '@mui/material';
import './gradients.scss';

function valueLabelFormat(value) {
  return `${value} ${'%'}`;
}

/**
 * Hue, saturation and lightness sliders. For each pixel of the mask, hue and saturation values will be replaced with
 * those given by these sliders. Instead, lightness will be adjusted by applying an 'offset' to the pixel lightness, which
 * will be determined by the lightness joystick.
 * @param {int} layerId
 * @param {int} hue
 * @param {int} saturation
 * @param {function} onHSLChange
 * @returns HSL slider for modifying hsl color of layer
 */
const HSLSlider = ({ layerId, hue, saturation, existingOffset, onHSLChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPoint, setSliderPoint] = useState(50);
  const [lightnessOffset, setLightnessOffset] = useState(existingOffset);

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
    return hueGradientColor;
  };

  const getSaturationGradientBackground = () => {
    const saturationGradientColor = `linear-gradient(to right, 
      hsl(${hue}, 0%, 50%), 
      hsl(${hue}, 100%, 50%))`;
    return saturationGradientColor;
  };

  const getLightnessGradientBackground = () => {
    const lightnessGradientColor = `linear-gradient(to right, 
      hsl(${hue}, ${saturation}%, 0%), 
      hsl(${hue}, ${saturation}%, 100%))`;
    return lightnessGradientColor;
  };

  return (
    <Box className="sliders-box" sx={{ draggable: false }}>
      <Typography variant="button" id="input-slider" gutterBottom className="text-slider">
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
        onChange={(e) => onHSLChange([e.target.value, saturation, lightnessOffset], layerId)}
        sx={{
          '& .MuiSlider-rail': {
            height: '10px',
            backgroundImage: getHueGradientBackground(),
            opacity: '100%',
          },
        }}
        className="hue-saturation-slider"
      ></Slider>
      <Typography variant="button" id="input-slider" gutterBottom className="text-slider">
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
        onChange={(e) => onHSLChange([hue, e.target.value, lightnessOffset], layerId)}
        sx={{
          '& .MuiSlider-rail': {
            height: '10px',
            backgroundImage: getSaturationGradientBackground(),
            opacity: '100%',
          },
        }}
        className="hue-saturation-slider"
      ></Slider>
      <Typography variant="button" id="input-slider" gutterBottom className="text-slider">
        Lightness
      </Typography>
      <Slider
        id="rL"
        aria-label="Lightness"
        size="small"
        min={0}
        max={100}
        color="info"
        value={sliderPoint}
        valueLabelDisplay="auto"
        valueLabelFormat={valueLabelFormat((sliderPoint - 50) / 10)}
        onMouseDown={() => handleOnHSLChange(sliderPoint)}
        onChange={(e) => sliderOnChange(e.target.value)}
        sx={{
          '& .MuiSlider-rail': {
            height: '10px',
            backgroundImage: getLightnessGradientBackground(),
            opacity: '100%',
          },
        }}
        className="lightness-slider"
        onMouseUp={() => {
          handleSliderDragEnd(50);
        }}
        onDragStart={handleSliderDragStart}
        onMouseLeave={() => {
          handleSliderDragEnd(50);
        }}
      ></Slider>
    </Box>
  );
};

export default HSLSlider;
