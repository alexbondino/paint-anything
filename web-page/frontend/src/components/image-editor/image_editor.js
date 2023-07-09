import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import './image-editor.scss';
import axios from 'axios';
import Canvas from './canvas';

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
 * Renders mask images
 * @param {Array} layersDef array with layer definitions
 * @param {int} selectedLayer id of selected layer
 * @param {function} onPointAndClick trigger for when image is selected and click is performed
 * @returns array of html images for masks
 */
const MaskImages = ({ layersDef, selectedLayer, onPointAndClick }) => {
  return layersDef
    .filter((l) => l.visibility)
    .map((layer) => {
        const isLayerSelected = layer.id === selectedLayer;
        const draw = (context, canvas) => {
          const width = canvas.current.width;
          const height = canvas.current.height;
          var img = new Image();
          img.onload = function(){
            var hue = 180;
            var sat= 50;
            var l = 50;
            // 50% lightness (L) will keep the original luma value.
            // erase previous drawing
            context.clearRect(0, 0, width, height);
            // draw mask as is
            context.globalCompositeOperation = 'source-over';
            context.drawImage(img, 0, 0, width, height);

            // adjust "lightness"
            context.globalCompositeOperation = l < 100 ? 'color-burn' : 'color-dodge';
            // for common slider, to produce a valid value for both directions
            l = l >= 100 ? l - 100 : l;
            context.fillStyle = 'hsl(0, 50%, ' + l + '%)';
            context.fillRect(0, 0, width, height);
            // change saturation
            context.globalCompositeOperation = 'saturation';
            context.fillStyle = 'hsl(0,' + sat + '%, 50%)'; // hue doesn't matter here
            context.fillRect(0, 0, width, height);

            // step 3: adjust hue, preserve luma and chroma
            context.globalCompositeOperation = 'hue';
            context.fillStyle = 'hsl(' + hue + ',1%, 50%)'; // sat must be > 0, otherwise won't matter
            context.fillRect(0, 0, width, height);

            // step 4: in our case, we need to clip as we filled the entire area
            context.globalCompositeOperation = 'destination-in';
            context.drawImage(img, 0, 0, width, height);
            // step 5: reset comp mode to default
            context.globalCompositeOperation = 'source-over';
          };
          img.src = 'https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png';
        }
      try {
        return (
          <Canvas draw={draw}></Canvas>
        );
      } catch {
        console.log(`Image for layer ${layer.id} not found`);
        return
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
  onNewLayerDef,
  onMaskUpdate,
  layerVisibility,
}) {
  // construct mask images dynamically from layer definitions
  const [naturalImgSize, setNaturalImgSize] = useState([]);
  const [truePoints, setTruePoints] = useState([]);
  const [falsePoints, setFalsePoints] = useState([]);
  const [showPoints, setShowPoints] = useState(true);

  useEffect(() => {
    // dont trigger effect if no layer is selected or layers are empty
    if ((selectedLayer === -1) | (layersDef.length === 0)) {
      setShowPoints(false);
      return;
    }
    // points are shown only when visible
    const layerPos = layersDef.findIndex((l) => l.id === selectedLayer);
    if (layersDef[layerPos].visibility === true) {
      // set points to show
      setTruePoints(layersDef[layerPos].layerTrueCoords);
      setFalsePoints(layersDef[layerPos].layerFalseCoords);
      setShowPoints(true);
    } else {
      setShowPoints(false);
    }
  }, [selectedLayer, layerVisibility, layersDef]);

  // sets image size when is loaded
  const handleOnBaseImageLoad = () => {
    const newImageSize = getBaseImageSize('natural');
    setNaturalImgSize(newImageSize);
  };

  const handlePointAndClick = async (event) => {
    const { clientX, clientY } = event;
    //  current component bounds
    const boxElement = document.querySelector('.image-box img');
    const boxRect = boxElement.getBoundingClientRect();
    // computes click point as 0.0-1.0 image coordinates
    const xPercent = (clientX - boxRect.left - 5) / (boxRect.right - boxRect.left);
    const yPercent = (clientY - boxRect.top - 5) / (boxRect.bottom - boxRect.top);

    const layerPos = layersDef.findIndex((l) => l.id === selectedLayer);
    const newLayerDef = [...layersDef];
    // payload for api is point coordinates in [0-1] range
    const data = { x_coord: xPercent, y_coord: yPercent };
    event.preventDefault();
    if (event.type === 'click' && layerPos !== -1) {
      // update positive coords
      newLayerDef[layerPos].layerTrueCoords.push([xPercent * 100, yPercent * 100]);
      onNewLayerDef(newLayerDef);
      console.log('layerTrueCoords:', newLayerDef[layerPos].layerTrueCoords);
      // send new point to backend
      axios
        .post('http://localhost:8000/api/point_&_click', data)
        .then((response) => {
          onMaskUpdate(newLayerDef[layerPos].id);
        })
        .catch((error) => console.error('Error al enviar coordenadas positivas:', error));
    } else if (event.type === 'contextmenu' && layerPos !== -1) {
      // update negative coords
      newLayerDef[layerPos].layerFalseCoords.push([xPercent * 100, yPercent * 100]);
      onNewLayerDef(newLayerDef);
      console.log('layerFalseCoords:', newLayerDef[layerPos].layerFalseCoords);
      // send new point to backend
      axios
        .post('http://localhost:8000/api/neg_point_&_click', data)
        .then((response) => {
          onMaskUpdate(newLayerDef[layerPos].id);
        })
        .catch((error) => console.error('Error al enviare coordenadas negativas:', error));
    }
    setShowPoints(true);
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
          onPointAndClick={handlePointAndClick}
        />
      ) : null}
      {truePoints.map((truePoint, index) => {
        return (
          <Box
            className="true-point"
            key={index}
            sx={{
              left: `${truePoint[0]}%`,
              top: `${truePoint[1]}%`,
              visibility: showPoints ? 'visible' : 'hidden',
            }}
          />
        );
      })}
      {falsePoints.map((falsePoint, index) => {
        return (
          <Box
            className="false-point"
            key={index}
            sx={{
              left: `${falsePoint[0]}%`,
              top: `${falsePoint[1]}%`,
              visibility: showPoints ? 'visible' : 'hidden',
            }}
          />
        );
      })}
    </Box>
  );
}
