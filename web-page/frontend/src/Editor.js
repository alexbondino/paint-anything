import React, { useState } from 'react';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';
import Typography from '@mui/material/Typography';

// initial layer shown after image is uploaded
const initialLayer = {
  id: 0,
  visibility: true,
  imgUrl: null,
  hsl: [120, 40, 50],
};

export function Editor() {
  const [sidebarVisibility, setSidebarVisibility] = useState('none');
  // base image to be edited
  const [baseImg, setBaseImg] = useState(null);
  // layerIds holds the list of existing layer ids
  const [layersDef, setLayersDef] = React.useState([initialLayer]);
  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState(0);

  function handleImageUpload(imgFile) {
    setSidebarVisibility('flex');
    setLayersDef([initialLayer]);
    setSelectedLayer(0);
    const imgObjectURL = URL.createObjectURL(imgFile);
    setBaseImg(imgObjectURL);
  }

  const updateLayerUrl = (layerId, url) => {
    const updatedLayer = layersDef.find((l) => l.id === layerId);
    // update url in layer definition
    updatedLayer.imgUrl = url;
    const newLayersDef = [...layersDef.filter((l) => l.id !== layerId), updatedLayer];
    setLayersDef(newLayersDef);
  };

  async function handleMaskUpdate(layerId) {
    // fetch mask for this layer from backend
    const imgResponse = await fetch(
      'http://localhost:8000/api/fetch-mask?' +
        new URLSearchParams({
          layer_id: layerId,
        })
    );
    // parse image and construct url
    const imgUrl = URL.createObjectURL(await imgResponse.blob());
    updateLayerUrl(layerId, imgUrl);
  }

  return [
    <ImageEditorDrawer
      key="side_nav"
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onNewLayerSelected={(newLayerSelected) => setSelectedLayer(newLayerSelected)}
      onImageUpload={(imgFile) => handleImageUpload(imgFile)}
    />,
    <ImageEditor
      key="img_editor"
      baseImg={baseImg}
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
    />,
    <ImageUploader key="upload_img" onImageUpload={(imgFile) => handleImageUpload(imgFile)} />,
  ];
}
