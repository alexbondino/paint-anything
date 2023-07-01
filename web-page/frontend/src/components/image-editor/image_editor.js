import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import './image-editor.scss';
import axios from 'axios';

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

  useEffect(() => {
    console.log('Coordenadas:', coordinateX, coordinateY);
  }, [coordinateX, coordinateY]);

  const handlePointAndClick = async (event) => {
    // Obtain the true image coords
    const { clientX, clientY } = event;

    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === selectedLayer);

    const boxElement = document.querySelector('.image-box');
    const boxRect = boxElement.getBoundingClientRect();
    const containerX = clientX - boxRect.left;
    const containerY = clientY - boxRect.top;

    // Obtain the image width and height
    const imgElement = document.querySelector('.image-box img');
    const imageWidth = imgElement.naturalWidth;
    const imageHeight = imgElement.naturalHeight;

    // Calculate relative image coordinates
    const imageX = (containerX / boxRect.width) * imageWidth;
    const imageY = (containerY / boxRect.height) * imageHeight;

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

  const maskImgComps = layersDef
    .filter((l) => l.imgUrl !== null)
    .map((layer) => {
      try {
        return (
          <img
            key={layer.id}
            src={layer.imgUrl}
            alt={`mask_image_${layer.id}`}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              visibility: layer.visibility ? 'visible' : 'hidden',
              filter:
                layer.id === selectedLayer
                  ? 'drop-shadow(1px 1px 0 yellow) drop-shadow(-1px -1px 0 yellow) drop-shadow(1px -1px 0 yellow) drop-shadow(-1px 1px 0 yellow)'
                  : 'none',
            }}
          />
        );
      } catch {
        console.log(`Image for layer ${layer.id} not found`);
        return;
      }
    });
  return (
    <Box className="background-full" sx={{ display: sidebarVisibility, flexDirection: 'column' }}>
      <Box className="image-box" sx={{ position: 'relative' }}>
        <img
          src={baseImg}
          alt="base_image"
          onClick={handlePointAndClick}
          onContextMenu={handlePointAndClick}
        />
        {maskImgComps}
      </Box>
    </Box>
  );
}
