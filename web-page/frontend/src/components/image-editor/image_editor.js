import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import './image-editor.scss';
import axios from 'axios';

/**
 * Extracts base image size. Don't call this unless image is loaded
 * @returns [width, height]
 */
function getBaseImageSize(type) {
  // Obtain the image width and height
  const imgElement = document.querySelector('img');
  const imageWidth = type === 'natural' ? imgElement.naturalWidth : imgElement.width;
  const imageHeight = type === 'natural' ? imgElement.naturalHeight : imgElement.height;
  return [imageWidth, imageHeight];
}

function imgPointToDisplayPoint(x, y, naturalSize) {
  console.log('caca');
  const boxElement = document.querySelector('img');
  const boxRect = boxElement.getBoundingClientRect();
  const newX = (x * (boxRect.right - boxRect.left)) / naturalSize[0];
  const newY = (y * (boxRect.bottom - boxRect.top)) / naturalSize[1];
  return [newX, newY];
}

/**
 * Renders mask images
 * @param {Array} layersDef array with layer definitions
 * @param {int} selectedLayer id of selected layer
 * @param {Array} imgSize [width, height] for image rendering
 * @param {function} onPointAndClick trigger for when image is selected and click is performed
 * @returns array of html images for masks
 */
const MaskImages = ({ layersDef, selectedLayer, imgSize, onPointAndClick }) => {
  console.log(imgSize);
  return layersDef
    .filter((l) => l.visibility)
    .map((layer) => {
      try {
        return (
          <img
            key={layer.id}
            // If image file has not been defined, loads full transparent image
            src={
              layer.imgUrl !== null
                ? layer.imgUrl
                : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
            }
            alt={`mask_image_${layer.id}`}
            style={{
              objectFit: 'contain',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block',
              position: 'absolute',
              width: '100%',
              height: '100%',
              // if image is selected, this highlights it
              filter:
                layer.id === selectedLayer && layer.imgUrl !== null
                  ? 'drop-shadow(1px 1px 0 yellow) drop-shadow(-1px -1px 0 yellow) drop-shadow(1px -1px 0 yellow) drop-shadow(-1px 1px 0 yellow)'
                  : 'none',
              border: '1px solid yellow',
            }}
            onClick={layer.id === selectedLayer && layer.visibility ? onPointAndClick : null}
            onContextMenu={layer.id === selectedLayer && layer.visibility ? onPointAndClick : null}
          />
        );
      } catch {
        console.log(`Image for layer ${layer.id} not found`);
        return;
      }
    });
};

/*
 * Image editor
 */
export default function ImageEditor({
  baseImg,
  sidebarVisibility,
  layersDef,
  selectedLayer,
  onNewLayerDef,
  onMaskUpdate,
  layerVisibility,
}) {
  // construct mask images dynamically from layer definitions
  const [coordinateX, setCoordinateX] = useState(0);
  const [coordinateY, setCoordinateY] = useState(0);
  const [naturalImgSize, setNaturalImgSize] = useState([]);
  const [truePoints, setTruePoints] = useState([]);
  const [falsePoints, setFalsePoints] = useState([]);
  const [showPoints, setShowPoints] = useState(true);

  const handleOnBaseImageLoad = () => {
    const newImageSize = getBaseImageSize('natural');
    setNaturalImgSize(newImageSize);
  };

  useEffect(() => {}, [coordinateX, coordinateY]);

  useEffect(() => {
    if ((selectedLayer === -1) | (layersDef.length == 0)) {
      setShowPoints(false);
      return;
    }

    const layerPos = layersDef.findIndex((l) => l.id === selectedLayer);
    if (layersDef[layerPos].visibility === true) {
      setTruePoints(layersDef[layerPos].layerTrueCoords);
      setFalsePoints(layersDef[layerPos].layerFalseCoords);
      setShowPoints(true);
    } else {
      setShowPoints(false);
    }
  }, [selectedLayer, layerVisibility, layersDef]);

  const handlePointAndClick = async (event) => {
    // Obtain the true image coords
    const { clientX, clientY } = event;

    const newLayerDef = [...layersDef];

    const boxElement = document.querySelector('img');
    const boxRect = boxElement.getBoundingClientRect();
    const imageX = clientX - boxRect.left;
    const imageY = clientY - boxRect.top;

    const realX = (imageX / (boxRect.right - boxRect.left)) * naturalImgSize[0];
    const realY = (imageY / (boxRect.bottom - boxRect.top)) * naturalImgSize[1];
    console.log(`realX: ${realX} ; realY: ${realY}`);
    const data = { x_coord: imageX, y_coord: imageY };

    setCoordinateX(realX);
    setCoordinateY(realY);

    const layerPos = layersDef.findIndex((l) => l.id === selectedLayer);
    newLayerDef[layerPos].layerTrueCoords.push([realX, realY]);
    onNewLayerDef(newLayerDef);

    event.preventDefault();
    if (event.type === 'click' && layerPos !== -1) {
      console.log('layerTrueCoords:', newLayerDef[layerPos].layerTrueCoords);
      axios
        .post('http://localhost:8000/api/point_&_click', data)
        .then((response) => {
          onMaskUpdate(layerPos);
        })
        .catch((error) => console.error('Error al enviar coordenadas positivas:', error));
    } else if (event.type === 'contextmenu' && layerPos !== -1) {
      console.log('layerFalseCoords:', newLayerDef[layerPos].layerFalseCoords);
      axios
        .post('http://localhost:8000/api/neg_point_&_click', data)
        .then((response) => {
          onMaskUpdate(layerPos);
        })
        .catch((error) => console.error('Error al enviare coordenadas negativas:', error));
    }
    setShowPoints(true);
  };

  return (
    <Box
      className="background-full"
      sx={{
        display: sidebarVisibility,
        flexDirection: 'column',
        width: '70%',
        height: '70%',
        position: 'relative',
        border: '4px solid red',
        margin: 'auto',
      }}
    >
      <img src={baseImg} className="image" alt="base_image" onLoad={handleOnBaseImageLoad} />
      {naturalImgSize.length === 2 ? (
        <MaskImages
          layersDef={layersDef}
          selectedLayer={selectedLayer}
          imgSize={getBaseImageSize('display')}
          onPointAndClick={handlePointAndClick}
        />
      ) : null}
      {truePoints.map((truePoint, index) => {
        const displayPoint = imgPointToDisplayPoint(truePoint[0], truePoint[1], naturalImgSize);
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: displayPoint[1] - 5,
              left: displayPoint[0] - 5,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'green',
              border: '1px solid white',
              visibility: showPoints ? 'visible' : 'hidden',
            }}
          />
        );
      })}
      {falsePoints.map((falsePoint, index) => {
        const displayPoint = imgPointToDisplayPoint(falsePoint[0], falsePoint[1], naturalImgSize);
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: displayPoint[1] - 5,
              left: displayPoint[0] - 5,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'red',
              border: '1px solid white',
              visibility: showPoints ? 'visible' : 'hidden',
            }}
          />
        );
      })}
    </Box>
  );
}
