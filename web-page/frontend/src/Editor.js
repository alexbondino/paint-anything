import React, { useState } from 'react';
import axios from 'axios';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';

const initialLayer = {
  id: 0,
  visibility: true,
  imgUrl: null,
};

export function Editor() {
  const [sidebarVisibility, setSidebarVisibility] = useState('none');
  // base image to be edited
  const [baseImg, setBaseImg] = useState(null);
  // layerIds holds the list of existing layer ids
  const [layersDef, setLayersDef] = React.useState([initialLayer]);

  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState(0);
  console.log(sidebarVisibility);

  function handleImageUpload(imgFile) {
    setSidebarVisibility('flex');
    setLayersDef([initialLayer]);
    setSelectedLayer(0);
    const imgObjectURL = URL.createObjectURL(imgFile);
    setBaseImg(imgObjectURL);
  }

  async function handleMaskUpdate(layerId) {
    const imgResponse = await fetch(
      'http://localhost:8000/api/fetch-mask?' +
        new URLSearchParams({
          layer_id: layerId,
        })
    );
    const imgUrl = URL.createObjectURL(await imgResponse.blob());
    const updatedLayer = layersDef.find((l) => l.id === layerId);
    updatedLayer.imgUrl = imgUrl;
    const newLayersDef = [...layersDef.filter((l) => l.id !== layerId), updatedLayer];
    setLayersDef(newLayersDef);
  }

  return [
    <ImageEditorDrawer
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onNewLayerSelected={(newLayerSelected) => setSelectedLayer(newLayerSelected)}
      onImageUpload={(imgFile) => handleImageUpload(imgFile)}
    />,
    <ImageEditor baseImg={baseImg} sidebarVisibility={sidebarVisibility} layersDef={layersDef} />,
    <ImageUploader onImageUpload={(imgFile) => handleImageUpload(imgFile)} />,
  ];
}
