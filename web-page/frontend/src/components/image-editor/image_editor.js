import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import './image-editor.scss';
import axios from 'axios';

/*
 * Image editor
 */
export default function ImageEditor({ baseImg, sidebarVisibility, layersDef }) {
  // construct mask images dynamically from layer definitions
  const [coordinateX, setCoordinateX] = useState(0)
  const [coordinateY, setCoordinateY] = useState(0)

  useEffect(() => {
    
    console.log('Coordenadas:', coordinateX, coordinateY);
    const x_coord = coordinateX;
    const y_coord = coordinateY
    const data = { x_coord, y_coord };

    try {
      // image is shown in ui before sending to backend
      axios.post('http://localhost:8000/api/point_&_click', data);
  
      console.log('Coordenadas enviadas correctamente.');
  
    } catch (error) {
      console.error('Error al enviar la coordenada:', error);
    }
  }, [coordinateX, coordinateY])

  const [circulos, setCirculos] = useState([])

  async function handleImageClick(event){
    const { clientX, clientY } = event
    setCoordinateX(clientX)
    setCoordinateY(clientY)

    const { offsetX, offsetY } = event.nativeEvent;
    const nuevoCirculo = { x: offsetX, y: offsetY };
    setCirculos([...circulos, nuevoCirculo]);
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
        <img src={baseImg} alt="base_image" onClick={handleImageClick}/>
        {circulos.map((circulo, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: circulo.y,
            left: circulo.x,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'red',
          }}
        ></div>
        ))}
        {maskImgComps}
      </Box>
    </Box>
  );
}
