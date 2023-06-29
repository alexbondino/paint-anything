import React from 'react';
import Box from '@mui/material/Box';
import './image-editor.scss';

/*
 * Image editor
 */
// TODO: image highlighting is very hacky :p, should find a more efficient way
export default function ImageEditor({ baseImg, sidebarVisibility, layersDef, selectedLayer }) {
  // construct mask images dynamically from layer definitions
  const maskImgComps = layersDef
    .filter((l) => l.imgUrl !== null)
    .map((layer) => {
      try {
        return (
          <img
            key={layer.id}
            src={layer.imgUrl}
            alt={`mask_image_${layer.id}`}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              visibility: layer.visibility ? 'visible' : 'hidden',
              filter:
                layer.id === selectedLayer
                  ? 'drop-shadow(1px 1px 0 yellow) drop-shadow(-1px -1px 0 yellow) drop-shadow(1px -1px 0 yellow) drop-shadow(-1px 1px 0 yellow)'
                  : 'none',
            }}
          />
        );
      } catch {
        console.log(`Image for layer ${layer.id} not found`);
        return;
      }
    });

  return (
    <Box className="background-full" sx={{ display: sidebarVisibility, flexDirection: 'column' }}>
      <Box className="image-box" sx={{ position: 'relative' }}>
        <img src={baseImg} alt="base_image" />
        {maskImgComps}
      </Box>
    </Box>
  );
}
