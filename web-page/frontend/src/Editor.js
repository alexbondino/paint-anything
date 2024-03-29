import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/upload_image/upload_image.js';
import { ImageEditorDrawer } from './components/side_nav/nav_bar.js';
import ImageEditor from './components/image-editor/image_editor.js';
import LoadingComponent from './components/loading/loading.js';
import ModelSelector from './components/model-selector/model-selector.js';
import axios from 'axios';
import { resizeImgFile } from './helpers.js';
import Title from './components/side_nav/Title.js';
import Stack from '@mui/material/Stack';

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
  // model selection
  const [modelSelected, setModelSelected] = useState('large_model');
  // model selection confirmation modal
  const [modelConfirmation, setModelConfirmation] = useState(false);
  // image
  const [currentImage, setCurrentImage] = useState(null);
  // previous selected model
  const [previousModel, setPreviousModel] = useState('large_model');
  // drawer open
  const [drawerOpen, setDrawerOpen] = useState(true);

  function handleLayerVisibilityClick(layerId) {
    const newLayerDef = [...layersDef];
    const layerPos = newLayerDef.findIndex((l) => l.id === layerId);
    newLayerDef[layerPos].visibility = !newLayerDef[layerPos].visibility;
    setLayersDef(newLayerDef);
  }

  useEffect(() => {
    console.log('Model succesfully adressed', modelSelected);
  }, [modelSelected]);

  const handleSelectmodel = (event) => {
    if (sidebarVisibility === true) {
      console.log('sidebar model accesed');
      setModelSelected(event.target.value);
      setModelConfirmation(true);
    } else {
      setModelSelected(event.target.value);
    }
  };

  const handleCancelModelConfirmation = () => {
    setModelConfirmation(false);
    setModelSelected(previousModel);
  };

  const handleConfirmModelConfirmation = () => {
    setModelConfirmation(false);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  async function handleImageUpload(imgFile) {
    // initial layer shown after image is uploaded
    const initialLayer = {
      id: 0,
      visibility: true,
      imgUrl: null,
      imgContour: null,
      hsl: [],
      meanLightness: 0,
      hslInput: false,
    };
    console.log('Se ingresó a handle Image uploade');
    setLoaderVisibility(true);
    setSidebarVisibility(false);
    const newLayersDef = [initialLayer];
    setLayersDef(newLayersDef);
    setLayerPoints([]);
    setSelectedLayer(0);

    const resizedImgFile = await resizeImgFile(imgFile, 1024);
    const imgUrl = URL.createObjectURL(resizedImgFile);
    setBaseImg(imgUrl);
    // send new image to backend
    const formData = new FormData();
    formData.append('image', resizedImgFile);
    try {
      await axios.post('http://localhost:8000/api/model-selected', { model: modelSelected });
      console.log('Modelo enviado correctamente.');
      setPreviousModel(modelSelected);
    } catch (error) {
      console.error('Error al enviar el modelo:', error);
    }
    try {
      await axios.post('http://localhost:8000/api/image', formData);
      console.log('Imagen enviada correctamente.');
      setCurrentImage(resizedImgFile);
      setLoaderVisibility(false);
      setSidebarVisibility(true);
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
    }
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

  async function extractMaskHSL(layerId) {
    try {
      const hslResponse = await axios.get('http://localhost:8000/api/mask-base-hsl', {
        params: { layer_id: layerId },
      });
      return hslResponse.data.hsl;
    } catch (error) {
      console.error('failed trying to set initial hsl');
      return [];
    }
  }

  async function handleMaskUpdate(layerId) {
    const layerPos = layersDef.findIndex((l) => l.id === layerId);
    const newLayersDef = [...layersDef];
    // fetch mask for this layer from backend
    try {
      const payload = new URLSearchParams({
        layer_id: layerId,
      });
      const imgResponse = await fetch('http://localhost:8000/api/mask-img?' + payload);
      const maskContour = await fetch('http://localhost:8000/api/mask-contour?' + payload);
      // update url in layer definition
      newLayersDef[layerPos].imgUrl = URL.createObjectURL(await imgResponse.blob());
      newLayersDef[layerPos].imgContour = await maskContour.json();
    } catch (error) {
      console.error('failed trying to update mask data');
      return;
    }
    // set initial hsl with base img values if not set
    if (!newLayersDef[layerPos].hslInput || newLayersDef[layerPos].hsl.length === 0) {
      const maskHSL = await extractMaskHSL(layerId);
      newLayersDef[layerPos].hsl = [maskHSL[0], maskHSL[1], 0];
      newLayersDef[layerPos].meanLightness = maskHSL[2];
    }
    setLayersDef(newLayersDef);
  }

  /**
   * Updates layer coords based on pointer change
   * @param {int} layerId layer affected
   * @param {int} pointerChange direction of pointer change. -1 for undo and +1 for redo
   */
  const handlePointerChange = useCallback(
    async (layerId, pointerChange) => {
      console.log('handlePointerChange');
      const layerPtsIdx = layerPoints.findIndex((l) => l.id === layerId);
      if (layerPtsIdx === -1) {
        return;
      }
      const layerPtsData = layerPoints[layerPtsIdx];
      // computes new pointer
      const newPointer = layerPtsData.pointer + pointerChange;
      // retrieves most recent coordinates in history
      const lastPoints = layerPtsData.history[layerPtsData.history.length - 1];
      // handle pointer overflow
      if (newPointer < 0 || newPointer > lastPoints.length) {
        return;
      }
      // update coordinates with new slice
      const newLayerPoints = [...layerPoints];
      newLayerPoints[layerPtsIdx].pointer = newPointer;
      newLayerPoints[layerPtsIdx].coords = lastPoints.slice(0, newPointer);
      setLayerPoints(newLayerPoints);
      // triggers same operation in backend
      const layer_pointer = { layer_id: layerId, pointer: newPointer };
      axios
        .post('http://localhost:8000/api/move-pointer', layer_pointer)
        .then((response) => {
          // image is reset if points are null
          if (newLayerPoints[layerPtsIdx].coords.length === 0) {
            const newLayersDef = [...layersDef];
            const layerDefIdx = newLayersDef.findIndex((l) => l.id === layerId);
            newLayersDef[layerDefIdx].imgUrl = null;
            newLayersDef[layerDefIdx].hsl = [];
            setLayersDef(newLayersDef);
            return;
          }
          handleMaskUpdate(layerId);
        })
        .catch((error) => console.error('Error moving layer pointer:', error));
    },
    [layerPoints, layersDef, handleMaskUpdate]
  );

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
  
  // render image editor only when sidebar is visible
  const imgEditor = sidebarVisibility ? (
    <ImageEditor
      key="img_editor"
      baseImg={baseImg}
      layersDef={layersDef}
      selectedLayer={selectedLayer}
      onSelectLayer={handleSelectLayer}
      imageVisibility={sidebarVisibility}
      layerPoints={layerPoints}
      onPointerChange={handlePointerChange}
      onNewPoint={handleNewPoint}
    />
  ) : null;

  return (
    <React.Fragment>
      <Title sidebarVisibility={sidebarVisibility} onDrawerOpen={handleDrawerOpen} />
      {sidebarVisibility ? (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ height: '90vh', flexGrow: 1 }}
        >
          {imgEditor}
          <ImageEditorDrawer
            key="side_nav"
            sidebarVisibility={sidebarVisibility}
            layersDef={layersDef}
            selectedLayer={selectedLayer}
            onNewLayerDef={(newLayersDef) => setLayersDef(newLayersDef)}
            onImageUpload={async (imgFile) => await handleImageUpload(imgFile)}
            onHSLChange={(newHSL, layerId) => handleHSLChange(newHSL, layerId)}
            onSelectLayer={(layerId) => handleSelectLayer(layerId)}
            onHandleLayerVisibilityClick={(layerId) => handleLayerVisibilityClick(layerId)}
            onDeleteLayer={(layerId) => handleLayerDelete(layerId)}
            onHandleSelectModel={handleSelectmodel}
            modelSelected={modelSelected}
            openModelConfirmation={modelConfirmation}
            onCancelModelConfirmation={handleCancelModelConfirmation}
            onConfirmModelConfirmation={handleConfirmModelConfirmation}
            drawerOpen={drawerOpen}
            onDrawerClose={handleDrawerClose}
            currentImage={currentImage}
          />
        </Stack>
      ) : null}
      {sidebarVisibility || loaderVisibility ? null : (
        <Stack
          direction="column"
          spacing={3}
          sx={{
            marginTop: '15%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ModelSelector onHandleSelectModel={handleSelectmodel} baseImg={baseImg} />
          <ImageUploader
            key="upload_img"
            onImageUpload={async (imgFile) => await handleImageUpload(imgFile)}
          />
        </Stack>
      )}
      <LoadingComponent loaderVisibility={loaderVisibility} />
    </React.Fragment>
  );
}
