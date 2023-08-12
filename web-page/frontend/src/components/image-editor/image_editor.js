import React, { useState, useEffect, useCallback } from 'react';
import './image-editor.scss';
import { Tooltip, ButtonGroup, Button, Stack, Box } from '@mui/material';
import axios from 'axios';
import PreviewDialog from './preview';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';
import Canvas from './canvas';

import { hslToRGB, rgbToHSL } from '../../helpers';

function getBaseImageSize(type) {
  const imgElement = document.querySelector('img');
  if (imgElement) {
    const imageWidth = type === 'natural' ? imgElement.naturalWidth : imgElement.width;
    const imageHeight = type === 'natural' ? imgElement.naturalHeight : imgElement.height;
    return [imageWidth, imageHeight];
  }
  return null;
}

function Mask({
  layerId,
  imgUrl,
  isSelected,
  points,
  onPointerChange,
  currentHSL,
  contour,
  drawIndex,
}) {
  //console.log(`layerId: ${layerId}, isSelected: ${isSelected}, points: ${points}`);
  const [img, setImg] = useState(null);
  const [imgComplete, setImgComplete] = useState(false);

  useEffect(() => {
    setImgComplete(false);
    if (imgUrl === null) {
      return;
    }
    const newImg = new Image();
    newImg.src = imgUrl;
    newImg.onload = () => {
      setImgComplete(true);
    };
    setImg(newImg);
  }, [imgUrl]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  async function handleKeyPress(event) {
    if (isSelected && event.keyCode === 90 && event.ctrlKey) {
      onPointerChange(layerId, -1);
    } else if (isSelected && event.keyCode === 89 && event.ctrlKey) {
      onPointerChange(layerId, 1);
    }
  }

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

  const draw = useCallback(
    (context, canvas) => {
      if (img === null || !imgComplete) {
        return;
      }
      requestAnimationFrame(function () {
        const c = canvas.current;
        const l = getBaseImageSize();
        c.width = l[0];
        c.height = l[1];
        if (points.length === 0) {
          context.clearRect(0, 0, c.width, c.height);
          return;
        }

        var hue = currentHSL[0];
        var sat = currentHSL[1];
        var lightnessOffset = currentHSL[2];

        context.globalCompositeOperation = 'source-over';
        context.drawImage(img, 0, 0, c.width, c.height);

        var imgData = context.getImageData(0, 0, c.width, c.height);
        var data = imgData.data;
        for (var i = 0; i < data.length; i += 4) {
          // Get the each channel color value
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          // skip transparent pixels
          if (a < 230) {
            continue;
          }
          const imgLightness = rgbToHSL(r, g, b)[2];
          const newRgb = hslToRGB(hue, sat, imgLightness + lightnessOffset);
          data[i] = newRgb[0];
          data[i + 1] = newRgb[1];
          data[i + 2] = newRgb[2];
        }
        context.putImageData(imgData, 0, 0);

        if (isSelected) {
          for (var i = 0; i < contour.length; i++) {
            for (var j = 0; j < contour[i].length - 2; j = j + 2) {
              const x1 = contour[i][j] * c.width;
              const y1 = contour[i][j + 1] * c.height;
              const x2 = contour[i][j + 2] * c.width;
              const y2 = contour[i][j + 2 + 1] * c.height;
              context.beginPath();
              context.moveTo(x1, y1);
              context.lineCap = 'round';
              context.lineWidth = 4;
              context.strokeStyle = 'rgb(84,204,255)';
              context.lineTo(x2, y2);
              context.stroke();
            }
          }
        }
      });
    },
    [img, imgComplete, currentHSL, contour, isSelected]
  );

  return (
    <React.Fragment>
      <Canvas
        key={`mask-${layerId}-canvas`}
        layerId={layerId}
        draw={draw}
        zIndex={1000 - drawIndex}
      />
      {pointBoxes}
    </React.Fragment>
  );
}

const extractLayerCoords = (layerId, layerPoints) => {
  let coords = [];
  if (layerPoints.length > 0) {
    const pointsDef = layerPoints.find((l) => l.id === layerId);
    coords = pointsDef ? pointsDef.coords.slice(0, pointsDef.pointer) : [];
  }
  return coords;
};

const MaskImages = ({ layersDef, selectedLayer, layerPoints, onPointerChange }) => {
  const visibleLayers = layersDef.filter((l) => l.visibility);
  return (
    <React.Fragment>
      {visibleLayers.map((layer, index) => {
        try {
          return (
            <Mask
              key={`mask_${layer.id}`}
              layerId={layer.id}
              imgUrl={layer.imgUrl}
              isSelected={layer.id === selectedLayer}
              points={extractLayerCoords(layer.id, layerPoints)}
              onPointerChange={onPointerChange}
              currentHSL={layer.hsl}
              contour={layer.imgContour}
              drawIndex={index}
            />
          );
        } catch (error) {
          console.log(`Error rendering mask ${layer.id}`, error);
          return null;
        }
      })}
    </React.Fragment>
  );
};

export default function ImageEditor({
  baseImg,
  layersDef,
  selectedLayer,
  layerPoints,
  onPointerChange,
  onNewPoint,
  imageVisibility,
}) {
  const [naturalImgSize, setNaturalImgSize] = useState([]);

  const handleOnBaseImageLoad = () => {
    const newImageSize = getBaseImageSize('natural');
    setNaturalImgSize(newImageSize);
  };

  async function handlePointAndClick(event) {
    event.preventDefault();
    const { clientX, clientY } = event;
    const boxElement = document.querySelector('.image-box');
    const boxRect = boxElement.getBoundingClientRect();
    const xPercent = (clientX - boxRect.left - 5) / (boxRect.right - boxRect.left);
    const yPercent = (clientY - boxRect.top - 5) / (boxRect.bottom - boxRect.top);
    let pointType = -1;
    switch (event.type) {
      case 'click':
        pointType = 1;
        break;
      case 'contextmenu':
        pointType = 0;
        break;
      default:
        break;
    }
    if (pointType === -1) {
      return;
    }
    const newPoint = [xPercent, yPercent, pointType];
    onNewPoint(selectedLayer, newPoint);
  }

  const selectedLayerDef = layersDef.find((l) => l.id === selectedLayer) ?? {
    visibility: false,
    hsl: [],
  };

  async function handleDownloadButtonClick() {
    const imgElement = document.getElementById('baseImg');
    const width = imgElement.naturalWidth;
    const height = imgElement.naturalHeight;
    // create canvas element with image size
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    // first draw base image
    ctx.drawImage(imgElement, 0, 0, width, height);
    // next draw layers, in same order as shown in editor
    const drawableLayers = [...layersDef].filter((l) => l.visibility).sort((l) => -l.id);
    for (const l of drawableLayers) {
      const maskImg = document.getElementById(`canvas-${l.id}`);
      ctx.drawImage(maskImg, 0, 0, width, height);
    }
    // dump image to file
    const link = document.createElement('a');
    link.download = 'output.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <Stack
      className="editor-stack"
      sx={{
        aspectRatio: naturalImgSize ? `${naturalImgSize[0]} / ${naturalImgSize[1]}` : '1/1',
        visibility: naturalImgSize && imageVisibility === true ? 'visible' : 'hidden',
      }}
      spacing={1}
    >
      <ButtonGroup
        className="history-box"
        variant="contained"
        aria-label="outlined primary button group"
        sx={{ marginBottom: -5.5 }}
      >
        <PreviewDialog
          layersDef={layersDef}
          baseImg={baseImg}
          selectedLayer={selectedLayer}
          selectedLayerVisibility={selectedLayerDef}
        />
        <Tooltip title="Download" placement="top">
          <Button className="download-button" onClick={handleDownloadButtonClick}>
            <DownloadIcon style={{ width: '43px' }} />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup
        className="history-box"
        variant="contained"
        aria-label="outlined primary button group"
      >
        <Tooltip title="Undo (Ctrl + z)" placement="top">
          <Button
            className="history-button"
            disabled={!selectedLayerDef.visibility || selectedLayerDef.hsl.length === 0}
            onClick={() => onPointerChange(selectedLayerDef.id, -1)}
          >
            <UndoIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Redo (Ctrl + y)" placement="top">
          <Button
            className="history-button"
            disabled={!selectedLayerDef.visibility || selectedLayerDef.hsl.length === 0}
            onClick={() => onPointerChange(selectedLayerDef.id, 1)}
          >
            <RedoIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <Box className="image-box" onClick={handlePointAndClick} onContextMenu={handlePointAndClick}>
        <img
          id="baseImg"
          src={baseImg}
          className="image"
          alt="base_image"
          onLoad={handleOnBaseImageLoad}
        />
        {naturalImgSize.length === 2 && layerPoints.length > 0 ? (
          <MaskImages
            layersDef={layersDef}
            selectedLayer={selectedLayer}
            layerPoints={layerPoints}
            onPointerChange={onPointerChange}
          />
        ) : null}
      </Box>
    </Stack>
  );
}
