import React, { useState } from 'react';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';
import LoadingComponent from './components/loading/loading.js';
import axios from 'axios';

// TODO: show loading status while image embeddings are being computed
export function Editor() {
  // base image to be edited
  const [baseImg, setBaseImg] = useState(null);
  // layerIds holds the list of existing layer ids
  const [layersDef, setLayersDef] = React.useState([]);

  // selectedLayerIdx is the index of the layer selected. -1 indicates no layer is selected
  const [selectedLayer, setSelectedLayer] = React.useState(0);
  // list of layer points as objects {coords:[[x1,y1,v1],[x2,y2,v2]], history:[coords_t1, coords_t2], pointer:pointer_value}
  const [layerPoints, setLayerPoints] = useState([]);
  // image and sidebar visibility
  const [sidebarVisibility, setSidebarVisibility] = React.useState(false);
  // loader visibility
  const [loaderVisibility, setLoaderVisibility] = React.useState(false);

  function handleLayerVisibilityClick(layerId) {
    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === layerId);
    newLayerDef[layerPos].visibility = !newLayerDef[layerPos].visibility;
    setLayersDef(newLayerDef);
  }

  async function handleImageUpload(imgFile) {
    // initial layer shown after image is uploaded
    const initialLayer = {
      id: 0,
      visibility: true,
      imgUrl: null,
      hsl: [],
      hslInput: false,
    };
    console.log('Se ingresó a handle Image uploade');
    setLoaderVisibility(true);
    const newLayersDef = [initialLayer];
    setLayersDef(newLayersDef);
    setLayerPoints([]);
    setSelectedLayer(0);
    const imgObjectURL = URL.createObjectURL(imgFile);
    setBaseImg(imgObjectURL);
    // send new image to backend
    const formData = new FormData();
    formData.append('image', imgFile);
    try {
      await axios.post('http://localhost:8000/api/image', formData);

      console.log('Imagen enviada correctamente.');
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
    }
    setLoaderVisibility(false);
    setSidebarVisibility(true);
  }

  function handleHSLChange(newHSL, layerId) {
    const newLayersDef = [...layersDef];
    const layerPos = layersDef.findIndex((l) => l.id === layerId);
    // update hsl in layer definition
    newLayersDef[layerPos].hsl = newHSL;
    setLayersDef(newLayersDef);
    newLayersDef[layerPos].hslInput = true;
  }

  async function handleSelectLayer(layerId) {
    // deselect layer if it has already been selected
    if (layerId === selectedLayer) {
      setSelectedLayer(-1);
      return;
    }
    setSelectedLayer(layerId);
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
    if (!newLayersDef[layerPos].hslInput) {
      try {
        const hslResponse = await axios.get('http://localhost:8000/api/mask-base-hsl', {
          params: { layer_id: layerId },
        });
        const newHSL = hslResponse.data.hsl;
        newLayersDef[layerPos].hsl = newHSL;
      } catch (error) {
        console.error('failed trying to set initial hsl');
      }
    }
    setLayersDef(newLayersDef);
  }

  /**
   * Updates layer coords based on pointer change
   * @param {int} layerId layer affected
   * @param {int} pointerChange direction of pointer change. -1 for undo and +1 for redo
   */
  async function handlePointerChange(layerId, pointerChange) {
    const layerIndex = layerPoints.findIndex((l) => l.id === layerId);
    const layerDef = layerPoints[layerIndex];
    // computes new pointer
    const newPointer = layerDef.pointer + pointerChange;
    // retrieves most recent coordinates in history
    const lastPoints = layerDef.history[layerDef.history.length - 1];
    // handle pointer overflow
    if (newPointer < 0 || newPointer > lastPoints.length) {
      return;
    }
    // update coordinates with new slice
    const newLayerPoints = [...layerPoints];
    newLayerPoints[layerIndex].pointer = newPointer;
    newLayerPoints[layerIndex].coords = lastPoints.slice(0, newPointer);
    setLayerPoints(newLayerPoints);
    // triggers same operation in backend
    const layer_pointer = { layer_id: layerId, pointer: newPointer };
    axios
      .post('http://localhost:8000/api/move-pointer', layer_pointer)
      .then((response) => {
        handleMaskUpdate(layerId);
      })
      .catch((error) => console.error('Error moving layer pointer:', error));
  }

  /**
   * Adds new point to layer
   * @param {int} layerId
   * @param {number[]} point new point to add [x1,y1,v1]
   */
  async function handleNewPoint(layerId, point) {
    const layerIndex = layerPoints.findIndex((l) => l.id === layerId);
    let newLayerPoints = [];
    if (layerIndex === -1) {
      // first layer point
      newLayerPoints = [
        ...layerPoints,
        { id: layerId, coords: [point], pointer: 1, history: [[point]] },
      ];
    } else {
      newLayerPoints = [...layerPoints];
      const layerPointer = layerPoints[layerIndex].pointer;
      // add new point to current points after pointer and discard the rest
      const newPoints = [...newLayerPoints[layerIndex].coords.slice(0, layerPointer), point];
      const newHistory = [...newLayerPoints[layerIndex].history, newPoints];
      newLayerPoints[layerIndex].coords = newPoints;
      newLayerPoints[layerIndex].pointer += 1;
      newLayerPoints[layerIndex].history = newHistory;
    }
    setLayerPoints(newLayerPoints);
    // send new point to backend
    const data = { layer_id: layerId, x_coord: point[0], y_coord: point[1], type: point[2] };
    axios
      .post('http://localhost:8000/api/point_&_click', data)
      .then((response) => {
        handleMaskUpdate(layerId);
      })
      .catch((error) => console.error('Error al enviar coordenadas:', error));
  }

  /**
   * Erase layer with specified id from here to backend
   * @param {int} layerId layer to delete
   */
  async function handleLayerDelete(layerId) {
    // erase mask from disk
    fetch(
      'http://localhost:8000/api/delete-mask?' +
        new URLSearchParams({
          layer_id: layerId,
        })
    )
      .then((response) => {
        if (response.status === 200) {
          console.log('layer file successfully deleted');
        } else {
          console.error('failed deleting mask file with error: ', response.message);
        }
      })
      .catch((error) => {
        console.error('Error deleting mask', error);
      });
    const newLayerDef = [...layersDef.filter((l) => l.id !== layerId)];
    const newLayerPoints = [...layerPoints.filter((l) => l.id !== layerId)];
    if (selectedLayer === layerId) {
      setSelectedLayer(-1);
    }
    setLayersDef(newLayerDef);
    setLayerPoints(newLayerPoints);
  }

  // render upload if no image has been loaded
  const imgUploader = loaderVisibility ? null : (
    <ImageUploader
      key="upload_img"
      onImageUpload={async (imgFile) => await handleImageUpload(imgFile)}
    />
  );
  // render image editor only when sidebar is visible
  const imgEditor = sidebarVisibility ? (
    <ImageEditor
      key="img_editor"
      baseImg={baseImg}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      imageVisibility={sidebarVisibility}
      layerPoints={layerPoints}
      onPointerChange={handlePointerChange}
      onNewPoint={handleNewPoint}
    />
  ) : null;

  return (
    <div style={{ height: '78vh' }}>
      <ImageEditorDrawer
        key="side_nav"
        baseImg={baseImg}
        sidebarVisibility={sidebarVisibility}
        layersDef={layersDef}
        selectedLayer={selectedLayer}
        onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
        onImageUpload={async (imgFile) => await handleImageUpload(imgFile)}
        onHSLChange={(newHSL, layerId) => handleHSLChange(newHSL, layerId)}
        onSelectLayer={(layerId) => handleSelectLayer(layerId)}
        onHandleLayerVisibilityClick={(layerId) => handleLayerVisibilityClick(layerId)}
        onDeleteLayer={(layerId) => handleLayerDelete(layerId)}
      />
      {imgEditor}
      {imgUploader}
      <LoadingComponent
        loaderVisibility={loaderVisibility}
      />
    </div>
    
  );
}
