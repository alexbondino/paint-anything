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
  const [coordinateX, setCoordinateX] = useState(0)
  const [coordinateY, setCoordinateY] = useState(0)
  

  useEffect(() => {
    console.log('Coordenadas:', coordinateX, coordinateY);
  
    // Resto del código que deseas ejecutar con las coordenadas actualizadas
    const x_coord = coordinateX;
    const y_coord = coordinateY;
    const data = { x_coord, y_coord };
    axios.post('http://localhost:8000/api/point_&_click', data);
  
  }, [coordinateX, coordinateY]);


  async function handlePointAndClick(event) {
    // Obtener el desplazamiento del contenedor de la imagen

    const { clientX, clientY } = event;

    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === selectedLayer);

    const boxElement = document.querySelector('.image-box');
    const boxRect = boxElement.getBoundingClientRect();
    const containerX = clientX - boxRect.left;
    const containerY = clientY - boxRect.top;
  
    // Obtener las dimensiones de la imagen
    const imgElement = document.querySelector('.image-box img');
    const imageWidth = imgElement.naturalWidth;
    const imageHeight = imgElement.naturalHeight;
  
    // Calcular las coordenadas relativas a la imagen
    const imageX = (containerX / boxRect.width) * imageWidth;
    const imageY = (containerY / boxRect.height) * imageHeight;
  
    setCoordinateX(imageX);
    setCoordinateY(imageY);

    if (!newLayerDef[layerPos].layerTrueCoords) {
      newLayerDef[layerPos].layerTrueCoords = [];
    }
  

    newLayerDef[layerPos].layerTrueCoords.push([imageX, imageY]);
    onNewLayerDef(newLayerDef);
    console.log(newLayerDef[layerPos].layerTrueCoords);
  }

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
            }}
          />
        );
      } catch {
        console.log(`Image for layer ${layer.id} not found`);
        return;
      }
    })
    ;

  return (
    <Box className="background-full" sx={{ display: sidebarVisibility, flexDirection: 'column' }}>
      <Box className="image-box" sx={{ position: 'relative' }}>
        <img src={baseImg} alt="base_image" onClick={handlePointAndClick}/>
        {maskImgComps}
      </Box>
    </Box>
  );
}
