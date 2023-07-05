import React, { useState } from 'react';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';
import axios from 'axios';

export function Editor() {
  const [sidebarVisibility, setSidebarVisibility] = useState('none');
  // base image to be edited
  const [baseImg, setBaseImg] = useState(null);
  // layerIds holds the list of existing layer ids
  const [layersDef, setLayersDef] = React.useState([]);
  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState(0);
  // layerVisibility
  const [layerVisibility, setLayerVisibility] = React.useState();

  function handleLayerVisibilityClick(layerId) {
    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === layerId);
    newLayerDef[layerPos].visibility = !newLayerDef[layerPos].visibility;
    setLayersDef(newLayerDef);
    setLayerVisibility(newLayerDef[layerPos].visibility);
  }

  function handleImageUpload(imgFile) {
    // initial layer shown after image is uploaded
    const initialLayer = {
      id: 0,
      visibility: true,
      imgUrl: null,
      hsl: [],
      layerTrueCoords: [],
      layerFalseCoords: [],
    };
    console.log('Se ingresó a handle Image uploade');
    setSidebarVisibility('flex');
    const newLayersDef = [initialLayer];
    setLayersDef(newLayersDef);
    setSelectedLayer(0);
    const imgObjectURL = URL.createObjectURL(imgFile);
    setBaseImg(imgObjectURL);
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
      setSelectedLayer(-1);
      return;
    }
    setSelectedLayer(layerId);

    const data = { layerId };
    try {
      await axios.post('http://localhost:8000/api/selected_layer', data);
      console.log('Layer enviada correctamente');
    } catch (error) {
      console.error('Error al enviar la layer seleccionada:', error);
    }
  }

  async function handleMaskUpdate(layerId) {
    const newLayersDef = [...layersDef];
    const layerPos = layersDef.findIndex((l) => l.id === layerId);
    // fetch mask for this layer from backend
    try {
      const imgResponse = await fetch(
        'http://localhost:8000/api/mask-img?' +
          new URLSearchParams({
            layer_id: layerId,
          })
      );
      // parse image and construct url
      const url = URL.createObjectURL(await imgResponse.blob());
      // update url in layer definition
      newLayersDef[layerPos].imgUrl = url;
    } catch (error) {
      console.error('failed trying to update mask data');
      return;
    }
    // set initial hsl with base img values if not set
    if (newLayersDef[layerPos].hsl.length === 0) {
      try {
        const hslResponse = await axios.get('http://localhost:8000/api/mask-base-hsl', {
          params: { layer_id: layerId },
        });
        const newHSL = hslResponse.data.hsl;
        newLayersDef[layerPos].hsl = newHSL;
        console.log(newHSL);
      } catch (error) {
        console.error('failed trying to set initial hsl');
      }
    }
    setLayersDef(newLayersDef);
  }

  return [
    <ImageEditorDrawer
      key="side_nav"
      baseImg={baseImg}
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      layerVisibility={layerVisibility}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onImageUpload={(imgFile) => handleImageUpload(imgFile)}
      onHSLChange={(newHSL, layerId) => handleHSLChange(newHSL, layerId)}
      onSelectLayer={(layerId) => handleSelectLayer(layerId)}
      onHandleLayerVisibilityClick={(layerId) => handleLayerVisibilityClick(layerId)}
    />,
    <ImageEditor
      key="img_editor"
      baseImg={baseImg}
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      layerVisibility={layerVisibility}
      selectedLayer={selectedLayer}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onMaskUpdate={handleMaskUpdate}
    />,
    <ImageUploader key="upload_img" onImageUpload={(imgFile) => handleImageUpload(imgFile)} />,
  ];
}
