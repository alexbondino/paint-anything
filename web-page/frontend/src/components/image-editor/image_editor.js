import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import './image-editor.scss';
import axios from 'axios';

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

function Mask({ layerId, imgUrl, isSelected, points, onPointerChange, onNewPoint }) {
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

  const handlePointAndClick = async (event) => {
    event.preventDefault();
    const { clientX, clientY } = event;
    //  current component bounds
    const boxElement = document.querySelector('.image-box img');
    const boxRect = boxElement.getBoundingClientRect();
    // computes click point as 0.0-1.0 image coordinates
    const xPercent = (clientX - boxRect.left - 5) / (boxRect.right - boxRect.left);
    const yPercent = (clientY - boxRect.top - 5) / (boxRect.bottom - boxRect.top);
    // payload for api is point coordinates in [0-1] range
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
    // update coordintes
    const newPoint = [xPercent, yPercent, pointType];
    onNewPoint(layerId, newPoint);
  };
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
 * Renders mask images
    
 */
const MaskImages = ({ layersDef, selectedLayer, layerPoints, onPointerChange, onNewPoint }) => {
  return layersDef
    .filter((l) => l.visibility)
    .map((layer) => {
      try {
        let points = [];
        if (layerPoints.length > 0) {
          const pointsDef = layerPoints.find((l) => l.id === layer.id);
          points = pointsDef ? pointsDef.points.slice(0, pointsDef.pointer) : [];
        }
        return (
          <Mask
            key={`mask_${layer.id}`}
            layerId={layer.id}
            imgUrl={layer.imgUrl}
            isSelected={layer.id === selectedLayer}
            points={points}
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

/*
 * Image editor
 */
// TODO: move useEffect from here to mask component, to avoid triggering it every time this larger component is updated
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

  return (
    <Box
      className="image-box"
      sx={{
        aspectRatio: naturalImgSize ? `${naturalImgSize[0]} / ${naturalImgSize[1]}` : '1/1',
        visibility: naturalImgSize ? 'visible' : 'hidden',
      }}
    >
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
  );
}
