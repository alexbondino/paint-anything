import React, { useState } from 'react';
import axios from 'axios';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';

const initialLayer = {
  id: 0,
  visibility: true,
};

export function Editor() {
  const [sidebarVisibility, setSidebarVisibility] = useState('none');
  // base image to be edited
  const [baseImg, setBaseImg] = useState(null);
  // mask imgs
  const [maskImgs, setMaskImgs] = useState([]);
  // layerIds holds the list of existing layer ids
  const [layersDef, setLayersDef] = React.useState([initialLayer]);

  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState('');
  console.log(sidebarVisibility);

  function handleImageUpload(imgFile) {
    setSidebarVisibility('flex');
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
    const newMaskImgs = [
      ...maskImgs.filter((mask) => mask.id != layerId),
      { id: layerId, img: imgUrl },
    ];
    setMaskImgs(newMaskImgs);
  }

  function handleMaskDelete(layerId) {
    const newMaskImgs = [...maskImgs.filter((mask) => mask.id != layerId)];
    setMaskImgs(newMaskImgs);
  }

  return [
    <ImageEditorDrawer
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onNewLayerSelected={(newLayerSelected) => setSelectedLayer(newLayerSelected)}
      onMaskUpdate={async (layerId) => await handleMaskUpdate(layerId)}
      onMaskDelete={(layerId) => handleMaskDelete(layerId)}
    />,
    <ImageEditor
      baseImg={baseImg}
      maskImgs={maskImgs}
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
    />,
    <ImageUploader onImageUpload={(imgFile) => handleImageUpload(imgFile)} />,
  ];
}
