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
  const [truePoints, setTruePoints] = useState([]);

  useEffect(() => {
    console.log('Coordenadas:', coordinateX, coordinateY);
  
  }, [coordinateX, coordinateY]);

  useEffect(() => {
    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === selectedLayer);
    if (layerPos !== -1) {
      setTruePoints(layersDef[layerPos].layerTrueCoords);
    }
    else {
      setTruePoints([{}])
    }
  }, [selectedLayer]);



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
    const imageX = containerX;
    const imageY = containerY;
  
    setCoordinateX(imageX);
    setCoordinateY(imageY);
  
    if (event.type === 'click' && layerPos!==-1) {
  
      newLayerDef[layerPos].layerTrueCoords.push([imageX, imageY]);
      onNewLayerDef(newLayerDef);
      console.log('layerTrueCoords:', newLayerDef[layerPos].layerTrueCoords);
  
      const x_coord = imageX;
      const y_coord = imageY;
      const data = { x_coord, y_coord };
      try {
        await axios.post('http://localhost:8000/api/point_&_click', data);
      } catch (error){
        console.error('Error al enviar coordenadas positivas:', error);
      }
      setTruePoints(layersDef[layerPos].layerTrueCoords)

    } else if (event.type === 'contextmenu' && layerPos!==-1) {
      event.preventDefault();
  
      newLayerDef[layerPos].layerFalseCoords.push([imageX, imageY]);
      onNewLayerDef(newLayerDef);
      console.log('layerFalseCoords:', newLayerDef[layerPos].layerFalseCoords);
  
      const x_coord = imageX;
      const y_coord = imageY;
      const data = { x_coord, y_coord };
      try {
        await axios.post('http://localhost:8000/api/neg_point_&_click', data);
      } catch (error){
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
        <img src={baseImg} className="image" alt="base_image" onClick={handlePointAndClick} onContextMenu={handlePointAndClick}/>
        {truePoints.length > 0 && truePoints[0][1] && truePoints[0][0] && truePoints.map((truePoint, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: truePoint[1] - 5,
              left: truePoint[0] - 5,
              width: '10px',
              height: '10px',
              backgroundColor: 'red',
              borderRadius: '50%',
              backgroundColor: 'green',
              border: '1px solid white',
            }}
          />
        ))}
        {maskImgComps}
      </Box>
    </Box>
  );
}
