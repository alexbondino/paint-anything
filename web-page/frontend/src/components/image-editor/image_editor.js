import React, { useState, useEffect, useCallback } from 'react';
import './image-editor.scss';
import { Tooltip, ButtonGroup, Button, Box, Grid } from '@mui/material';
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
        // draw outline if image is selected
        if (isSelected) {
          for (var cntId = 0; cntId < contour.length; cntId++) {
            for (var j = 0; j < contour[cntId].length - 2; j = j + 2) {
              const x1 = contour[cntId][j] * c.width;
              const y1 = contour[cntId][j + 1] * c.height;
              const x2 = contour[cntId][j + 2] * c.width;
              const y2 = contour[cntId][j + 2 + 1] * c.height;
              context.beginPath();
              context.moveTo(x1, y1);
              context.lineCap = 'round';
              context.lineWidth = 2;
              context.strokeStyle = '#FAE869';
              context.lineTo(x2, y2);
              context.stroke();
            }
          }
        }
      });
    },
    [img, imgComplete, currentHSL, points.length, contour, isSelected]
  );

  return (
    <React.Fragment>
      <Canvas
        className="mask-img"
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
              className="mask-img"
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
  onSelectLayer,
  layerPoints,
  onPointerChange,
  onNewPoint,
  imageVisibility,
}) {
  const [naturalImgSize, setNaturalImgSize] = useState([]);
  const [lastSelectedLayer, setLastSelectedLayer] = useState(-1);
  const [downloadState, setDownloadState] = useState(null);

  /* eslint-disable */
  useEffect(() => {
    if (downloadState === 'prepare') {
      // triggers download after canvas is rerendered
      setDownloadState('download');
    } else if (downloadState === 'download') {
      // download output and reset other states
      downloadOutput();
      setDownloadState(null);
      setLastSelectedLayer(-1);
      onSelectLayer(lastSelectedLayer);
    }
  }, [downloadState]);
  /* eslint-enable */

  const handleOnBaseImageLoad = () => {
    setNaturalImgSize(getBaseImageSize('natural'));
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

  async function downloadOutput() {
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
    const drawableLayers = layersDef.filter((l) => l.visibility).reverse();
    for (const l of drawableLayers) {
      const maskImg = document.getElementById(`canvas-${l.id}`);
      if (maskImg){
        ctx.drawImage(maskImg, 0, 0, width, height);
      }
    }
    // dump image to file
    const link = document.createElement('a');
    link.download = 'output.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function handleDownloadButtonClick() {
    // deselect layer
    setLastSelectedLayer(selectedLayer);
    onSelectLayer(-1);
    // initiate download
    setDownloadState('prepare');
  }

  const aspectRatio = naturalImgSize ? `${naturalImgSize[0] / naturalImgSize[1]}` : '1/1';

  return (
    <Grid
      className="editor-grid"
      sx={{
        aspectRatio: aspectRatio,
        width: 'auto',
        height: 'auto',
        visibility: naturalImgSize && imageVisibility === true ? 'visible' : 'hidden',
      }}
      container
      spacing={1}
    >
      <Grid item xs={6} className="history-buttons">
        <ButtonGroup
          className="editor-button-group"
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Tooltip title="Undo (Ctrl + z)" placement="top">
            <Button
              disabled={!selectedLayerDef.visibility}
              onClick={() => onPointerChange(selectedLayerDef.id, -1)}
            >
              <UndoIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Redo (Ctrl + y)" placement="top">
            <Button
              disabled={!selectedLayerDef.visibility}
              onClick={() => onPointerChange(selectedLayerDef.id, 1)}
            >
              <RedoIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
      <Grid item xs={6} className="download-preview-buttons">
        <ButtonGroup
          className="editor-button-group"
          variant="contained"
          aria-label="outlined primary button group"
        >
          <PreviewDialog
            layersDef={layersDef}
            baseImg={baseImg}
            onSelectLayer={onSelectLayer}
            selectedLayer={selectedLayer}
          />
          <Tooltip title="Download" placement="top">
            <Button className="download-button" onClick={handleDownloadButtonClick}>
              <DownloadIcon style={{ width: '43px' }} />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
      <Grid className="image-grid" item xs={12}>
        <Box
          className="image-box"
          sx={{
            aspectRatio: aspectRatio,
          }}
          onClick={handlePointAndClick}
          onContextMenu={handlePointAndClick}
        >
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
      </Grid>
    </Grid>
  );
}
