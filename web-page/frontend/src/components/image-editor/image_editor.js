import React, { useState, useEffect } from 'react';
import './image-editor.scss';
import { Tooltip, ButtonGroup, Button, Stack, Box } from '@mui/material';
import axios from 'axios';
import PreviewDialog from './preview';

// icons
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';

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
function Mask({ layerId, imgUrl, isSelected, points, onPointerChange, onNewPoint }) {
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

  const handlePointAndClick = async (event) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    //  current component bounds
    const boxElement = document.querySelector('.image-box img');
    const boxRect = boxElement.getBoundingClientRect();
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
    onNewPoint(layerId, newPoint);
  };
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

  return [
    <img
      key={layerId}
      // If image file has not been defined, loads full transparent image
      src={
        imgUrl !== null
          ? imgUrl
          : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      }
      className={'mask-img'}
      alt={`mask_image_${layerId}`}
      draggable={false}
      style={{
        // if image is selected, this highlights it
        filter:
          isSelected && imgUrl !== null
            ? 'drop-shadow(1px 1px 0 yellow) drop-shadow(-1px -1px 0 yellow) drop-shadow(1px -1px 0 yellow) drop-shadow(-1px 1px 0 yellow)'
            : 'none',
        zIndex: isSelected ? '100' : 'auto',
      }}
      onClick={isSelected ? handlePointAndClick : null}
      onContextMenu={isSelected ? handlePointAndClick : null}
    />,
    pointBoxes,
  ];
}

/**
 * Renders all visible masks and corresponding points
 * @returns list of mask components
 */
const MaskImages = ({ layersDef, selectedLayer, layerPoints, onPointerChange, onNewPoint }) => {
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
          />
        );
      } catch (error) {
        console.log(`Error rendering mask ${layer.id}`, error);
        return;
      }
    });
};

async function handleDownloadButtonClick() {
  try {
    const response = await axios.get('http://localhost:8000/api/image_downloader', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'image/png' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'imagen.png');
    document.body.appendChild(link);
    link.click();
    console.log('imagen descargada correctamente');
  } catch (error) {
    console.error('Error al enviar la imagen:', error);
  }
}

export default function ImageEditor({
  baseImg,
  layersDef,
  selectedLayer,
  layerPoints,
  onPointerChange,
  onNewPoint,
  imageVisibility,
}) {
  // construct mask images dynamically from layer definitions
  const [naturalImgSize, setNaturalImgSize] = useState([]);

  // sets image size when is loaded
  const handleOnBaseImageLoad = () => {
    const newImageSize = getBaseImageSize('natural');
    setNaturalImgSize(newImageSize);
  };

  const selectedLayerVisibility = layersDef.find((l) => l.id === selectedLayer) ?? {
    visibility: false,
  };

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
        sx={{
          marginBottom: -5.5
        }}>
        <PreviewDialog layersDef={layersDef} baseImg={baseImg} selectedLayer={selectedLayer} selectedLayerVisibility={selectedLayerVisibility}/>
        <Tooltip title="Download" placement="top">
          <Button
          className="download-button"
          disabled={selectedLayer === -1 || !selectedLayerVisibility.visibility}
          onClick={handleDownloadButtonClick}
          >
            <DownloadIcon style={{ width: '40px' }}/>
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
      <Box className="image-box">
        <img src={baseImg} className="image" alt="base_image" onLoad={handleOnBaseImageLoad} />
        {naturalImgSize.length === 2 ? (
          <MaskImages
            layersDef={layersDef}
            selectedLayer={selectedLayer}
            layerPoints={layerPoints}
            onPointerChange={onPointerChange}
            onNewPoint={onNewPoint}
          />
        ) : null}
      </Box>
    </Stack>
  );
}
