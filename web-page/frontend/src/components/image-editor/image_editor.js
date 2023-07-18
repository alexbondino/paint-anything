import React, { useState, useEffect } from 'react';
import './image-editor.scss';

import { Tooltip, ButtonGroup, Button, Stack, Box } from '@mui/material';

// icons
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import Canvas from './canvas';

/**
 * Extracts base image size
 * @returns [width, height]
 */
function getBaseImageSize(type) {
  // Obtain the image width and height
  const imgElement = document.querySelector('img');
  if (imgElement) {
    const imageWidth = type === 'natural' ? imgElement.naturalWidth : imgElement.width;
    const imageHeight = type === 'natural' ? imgElement.naturalHeight : imgElement.height;
    return [imageWidth, imageHeight];
  }
  return null;
}



/**
 * Renders the mask for `layerId` along with its points
 * @returns mask component
 */
function Mask({ layerId, imgUrl, isSelected, points, onPointerChange, onNewPoint, currentHSL, naturalImgSize }) {
  // listen to key press
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  async function handleKeyPress(event) {
    if (isSelected && event.keyCode === 90 && event.ctrlKey) {
      // Ctrl + z command, goes back to last state in history
      onPointerChange(layerId, -1);
    } else if (isSelected && event.keyCode === 89 && event.ctrlKey) {
      // Ctrl + y command, goes forward to next state in history
      onPointerChange(layerId, 1);
    }
  }


  // points to render as boxes
  const pointBoxes = isSelected
    ? points.map((point, index) => {
        return (
          <Box
            className="mask-point"
            key={index}
            sx={{
              left: `${point[0] * 100}%`,
              top: `${point[1] * 100}%`,
              backgroundColor: point[2] === 1 ? 'green' : 'red',
            }}
          />
        );
      })
    : null;

    const draw = (context, canvas) => {
      const c = canvas.current;
      //const ctx = context;
      var img = new Image();
      function start() {
        img.src = imgUrl ? imgUrl : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        window.requestAnimationFrame(drawMask);
      }
      const l = getBaseImageSize()
      c.width = l[0];
      c.height = l[1];

      function drawMask() {
        console.log("img.onLoad")
        console.log(`image width: ${img.width} height: ${img.height}`)
        var hue = currentHSL[0];
        var sat = currentHSL[1];
        var l = currentHSL[2];


        //draw original image in normal mode
        context.globalCompositeOperation = "source-over";
        context.drawImage(img, 0,0,c.width, c.height);

        context.globalCompositeOperation = l < 100 ? "color-burn" : "color-dodge";
        // for common slider, to produce a valid value for both directions
        l = l >= 100 ? l - 100 : 100 - (100 - l);
        context.fillStyle = "hsl(0, 50%, " + currentHSL[2] + "%)";
        context.fillRect(0, 0, c.width, c.height);

        // adjust saturation
        context.globalCompositeOperation = "saturation";
        context.fillStyle = "hsl(0," + sat + "%, 50%)";
        context.fillRect(0, 0, c.width, c.height);

        // step 3: adjust hue, preserve luma and chroma
        context.globalCompositeOperation = "hue";
        context.fillStyle = "hsl(" + hue + ",1%, 50%)";  // sat must be > 0, otherwise won't matter
        context.fillRect(0, 0, c.width, c.height);

        // step 4: in our case, we need to clip as we filled the entire area
        context.globalCompositeOperation = "destination-in";
        context.drawImage(img, 0,0,c.width, c.height);
        window.requestAnimationFrame(drawMask);

      }

      img.onload = drawMask(); 

      start();

    }
  return [
    <Canvas draw={draw} width={getBaseImageSize()[0]} height={getBaseImageSize()[1]}></Canvas>,
    pointBoxes,
  ];
}

/**
 * Renders all visible masks and corresponding points
 * @returns list of mask components
 */
const MaskImages = ({ layersDef, selectedLayer, layerPoints, onPointerChange, onNewPoint, naturalImgSize }) => {
  return layersDef
    .filter((l) => l.visibility)
    .map((layer) => {
      try {
        // extract cooords up until pointer
        let coords = [];
        if (layerPoints.length > 0) {
          const pointsDef = layerPoints.find((l) => l.id === layer.id);
          coords = pointsDef ? pointsDef.coords.slice(0, pointsDef.pointer) : [];
        }
        return (
          <Mask
            key={`mask_${layer.id}`}
            layerId={layer.id}
            imgUrl={layer.imgUrl}
            isSelected={layer.id === selectedLayer}
            points={coords}
            onPointerChange={onPointerChange}
            onNewPoint={onNewPoint}
            currentHSL={layer.hsl}
            naturalImgSize={naturalImgSize}
          />
        );
      } catch (error) {
        console.log(`Error rendering mask ${layer.id}`, error);
        return;
      }
    });
};

export default function ImageEditor({
  baseImg,
  layersDef,
  selectedLayer,
  layerPoints,
  onPointerChange,
  onNewPoint,
}) {
  // construct mask images dynamically from layer definitions
  const [naturalImgSize, setNaturalImgSize] = useState([]);

  // sets image size when is loaded
  const handleOnBaseImageLoad = () => {
    const newImageSize = getBaseImageSize('natural');
    setNaturalImgSize(newImageSize);
  };

  async function handlePointAndClick(event) {
    event.preventDefault();
    const { clientX, clientY } = event;
    //  current component bounds
    const boxElement = document.querySelector('.image-box');
    console.log(boxElement);
    const boxRect = boxElement.getBoundingClientRect();;
    console.log(clientX, clientY);
    // computes click point as 0.0-1.0 image coordinates
    const xPercent = (clientX - boxRect.left - 5) / (boxRect.right - boxRect.left);
    const yPercent = (clientY - boxRect.top - 5) / (boxRect.bottom - boxRect.top);
    // defines which type of point was clicked
    let pointType = -1;
    switch (event.type) {
      case 'click':
        // positive point
        pointType = 1;
        break;
      case 'contextmenu':
        // negative point
        pointType = 0;
        break;
      default:
        break;
    }
    if (pointType === -1) {
      return;
    }
    // push new point
    const newPoint = [xPercent, yPercent, pointType];
    onNewPoint(selectedLayer, newPoint);
  };

  const selectedLayerVisibility = layersDef.find((l) => l.id === selectedLayer) ?? {
    visibility: false,
  };

  return (
    <Stack
      className="editor-stack"
      sx={{
        aspectRatio: naturalImgSize ? `${naturalImgSize[0]} / ${naturalImgSize[1]}` : '1/1',
        visibility: naturalImgSize ? 'visible' : 'hidden',
      }}
      spacing={1}
    >
      <ButtonGroup
        className="history-box"
        variant="contained"
        aria-label="outlined primary button group"
      >
        <Tooltip title="Undo (Ctrl + z)" placement="top">
          <Button
            className="history-button"
            disabled={selectedLayer === -1 || !selectedLayerVisibility.visibility}
            onClick={() => onPointerChange(selectedLayerVisibility.id, -1)}
          >
            <UndoIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Redo (Ctrl + y)" placement="top">
          <Button
            className="history-button"
            disabled={selectedLayer === -1 || !selectedLayerVisibility.visibility}
            onClick={() => onPointerChange(selectedLayerVisibility.id, 1)}
          >
            <RedoIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <Box className="image-box" sx={{border:'2px solid red'}} onClick={handlePointAndClick} onContextMenu={handlePointAndClick}>
        <img id='baseImg' src={baseImg} className="image" alt="base_image" onLoad={handleOnBaseImageLoad}/>
        {naturalImgSize.length === 2 ? (
          <MaskImages
            layersDef={layersDef}
            selectedLayer={selectedLayer}
            layerPoints={layerPoints}
            onPointerChange={onPointerChange}
            onNewPoint={onNewPoint}
            naturalImgSize={naturalImgSize}
          />
        ) : null}
      </Box>
    </Stack>
  );
}
