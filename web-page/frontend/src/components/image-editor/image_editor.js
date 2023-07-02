import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import './image-editor.scss';
import axios from 'axios';

/**
 * Extracts base image size. Don't call this unless image is loaded
 * @returns [width, height]
 */
function getBaseImageSize() {
  // Obtain the image width and height
  const imgElement = document.querySelector('.image-box img');
  const imageWidth = imgElement.naturalWidth;
  const imageHeight = imgElement.naturalHeight;
  return [imageWidth, imageHeight];
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
  return layersDef.map((layer) => {
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
          width={imgSize[0]}
          height={imgSize[1]}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            visibility: layer.visibility ? 'visible' : 'hidden',
            // if image is selected, this highlights it
            filter:
              layer.id === selectedLayer && layer.imgUrl !== null
                ? 'drop-shadow(1px 1px 0 yellow) drop-shadow(-1px -1px 0 yellow) drop-shadow(1px -1px 0 yellow) drop-shadow(-1px 1px 0 yellow)'
                : 'none',
          }}
          onClick={onPointAndClick}
          onContextMenu={onPointAndClick}
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
}) {
  // construct mask images dynamically from layer definitions
  const [coordinateX, setCoordinateX] = useState(0);
  const [coordinateY, setCoordinateY] = useState(0);
  const [baseImgSize, setBaseImgSize] = useState([]);

  useEffect(() => {}, [coordinateX, coordinateY]);

  const handleOnBaseImageLoad = () => {
    const newImageSize = getBaseImageSize();
    setBaseImgSize(newImageSize);
  };

  const handlePointAndClick = async (event) => {
    // Obtain the true image coords
    const { clientX, clientY } = event;

    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === selectedLayer);

    const boxElement = document.querySelector('.image-box');
    const boxRect = boxElement.getBoundingClientRect();
    const containerX = clientX - boxRect.left;
    const containerY = clientY - boxRect.top;

    // Calculate relative image coordinates
    const imageX = (containerX / boxRect.width) * baseImgSize[0];
    const imageY = (containerY / boxRect.height) * baseImgSize[1];

    setCoordinateX(imageX);
    setCoordinateY(imageY);

    if (event.type === 'click' && layerPos !== -1) {
      newLayerDef[layerPos].layerTrueCoords.push([imageX, imageY]);
      onNewLayerDef(newLayerDef);
      console.log('layerTrueCoords:', newLayerDef[layerPos].layerTrueCoords);

      const x_coord = imageX;
      const y_coord = imageY;
      const data = { x_coord, y_coord };
      try {
        await axios.post('http://localhost:8000/api/point_&_click', data);
      } catch (error) {
        console.error('Error al enviar coordenadas positivas:', error);
      }
    } else if (event.type === 'contextmenu' && layerPos !== -1) {
      event.preventDefault();

      newLayerDef[layerPos].layerFalseCoords.push([imageX, imageY]);
      onNewLayerDef(newLayerDef);
      console.log('layerFalseCoords:', newLayerDef[layerPos].layerFalseCoords);

      const x_coord = imageX;
      const y_coord = imageY;
      const data = { x_coord, y_coord };
      try {
        await axios.post('http://localhost:8000/api/neg_point_&_click', data);
      } catch (error) {
        console.error('Error al eliminar coordenadas negativas:', error);
      }
    }
  };

  return (
    <Box className="background-full" sx={{ display: sidebarVisibility, flexDirection: 'column' }}>
      <Box className="image-box" sx={{ position: 'relative' }}>
        <img src={baseImg} alt="base_image" onLoad={handleOnBaseImageLoad} />
        {baseImgSize.length === 2 ? (
          <MaskImages
            layersDef={layersDef}
            selectedLayer={selectedLayer}
            imgSize={baseImgSize}
            onPointAndClick={handlePointAndClick}
          />
        ) : null}
      </Box>
    </Box>
  );
}
