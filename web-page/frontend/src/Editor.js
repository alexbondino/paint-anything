import React, { useState } from 'react';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';

export function Editor() {
  const [sidebarVisibility, setSidebarVisibility] = useState('none');
  // layerIds holds the list of existing layer ids
  const [layerNames, setLayerNames] = React.useState(new Set());
  // map to indicate layer visibility
  const [layersVisibility, setLayersVisibility] = React.useState(new Map());
  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState('');
  console.log(sidebarVisibility);

  function handleSidebarVisibilityChange() {
    setSidebarVisibility('flex');
  }

  return [
    <ImageEditorDrawer
      sidebarVisibility={sidebarVisibility}
      layerNames={layerNames}
      selectedLayer={selectedLayer}
      layersVis={layersVisibility}
      onNewLayerNames={(newLayerNames) => setLayerNames(newLayerNames)}
      onNewLayerSelected={(newLayerSelected) => setSelectedLayer(newLayerSelected)}
      onNewLayersVis={(newVis) => setLayersVisibility(newVis)}
    />,
    <ImageEditor sidebarVisibility={sidebarVisibility} />,
    <ImageUploader onImageUpload={handleSidebarVisibilityChange} />,
  ];
}
