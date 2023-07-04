import React, { useState } from 'react';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';
import axios from 'axios';

// initial layer shown after image is uploaded
const initialLayer = {
  id: 0,
  visibility: true,
  imgUrl: null,
  hsl: [],
  layerTrueCoords: [],
  layerFalseCoords: [],
};

export function Editor() {
  const [sidebarVisibility, setSidebarVisibility] = useState('none');
  // base image to be edited
  const [baseImg, setBaseImg] = useState(null);
  // layerIds holds the list of existing layer ids
  const [layersDef, setLayersDef] = React.useState([]);
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
    const newLayersDef = [...layersDef];
    const layerPos = layersDef.findIndex((l) => l.id === layerId);
    // update url in layer definition
    newLayersDef[layerPos].imgUrl = url;
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

  function handleHSLChange(newHSL, layerId) {
    const newLayersDef = [...layersDef];
    const layerPos = layersDef.findIndex((l) => l.id === layerId);
    // update hsl in layer definition
    newLayersDef[layerPos].hsl = newHSL;
    setLayersDef(newLayersDef);
  }

  async function handleSelectLayer(layerId) {
    // deselect layer if it has already been selected
    if (layerId === selectedLayer) {
      setSelectedLayer('');
      return;
    }
    setSelectedLayer(layerId);

    const data = { layerId };
    try {
      await axios.post('http://localhost:8000/api/selected_layer', data);
    } catch (error) {
      console.error('Error al enviar la layer seleccionada:', error);
    }
  }

  return [
    <ImageEditorDrawer
      key="side_nav"
      baseImg={baseImg}
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onImageUpload={(imgFile) => handleImageUpload(imgFile)}
      onHSLChange={(newHSL, layerId) => handleHSLChange(newHSL, layerId)}
      onSelectLayer={(layerId) => handleSelectLayer(layerId)}
    />,
    <ImageEditor
      key="img_editor"
      baseImg={baseImg}
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onMaskUpdate={handleMaskUpdate}
    />,
    <ImageUploader key="upload_img" onImageUpload={(imgFile) => handleImageUpload(imgFile)} />,
  ];
}
