import React, { useState } from 'react';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';

export function Editor() {
  const [sidebarVisibility, setSidebarVisibility] = useState('none');
  // layerIds holds the list of existing layer ids
  const [layersDef, setLayersDef] = React.useState([]);
  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState('');
  console.log(sidebarVisibility);

  function handleSidebarVisibilityChange() {
    setSidebarVisibility('flex');
  }

  return [
    <ImageEditorDrawer
      sidebarVisibility={sidebarVisibility}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
      onNewLayerSelected={(newLayerSelected) => setSelectedLayer(newLayerSelected)}
    />,
    <ImageEditor sidebarVisibility={sidebarVisibility} />,
    <ImageUploader onImageUpload={handleSidebarVisibilityChange} />,
  ];
}
