import { useEffect, useState } from 'react';
import { Box, Slider, Typography } from '@mui/material';

function valueLabelFormat(value) {
  return `${value} ${'%'}`;
}

/**
 * Hue, saturation and lightness sliders
 * @param {int} layerId
 * @param {int} hue
 * @param {int} saturation
 * @param {int} lightness
 * @param {function} onHSLChange
 * @returns HSL slider for modifying hsl color of layer
 */
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

  return (
    <Box className="sliders-box" sx={{ draggable: false }}>
      <Typography variant="button" id="input-slider" gutterBottom>
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
      ></Slider>
      <Typography variant="button" id="input-slider" gutterBottom>
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
      ></Slider>
      <Typography variant="button" id="input-slider" gutterBottom>
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
