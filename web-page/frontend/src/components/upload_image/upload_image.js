import React, { useState } from 'react';
import { Button, Input } from '@mui/material';
import Box from '@mui/material/Box';

// TODO: replicate upload logic from here in nav bar component
export function ImageUploader({onImageUpload}) {

  const [selectedImage, setSelectedImage] = useState(null);

  function handleImageChange(event) {
    setSelectedImage(event.target.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedImage) {
      console.error('No se ha seleccionado ninguna imagen.');
      return;
    }
    onImageUpload(selectedImage);
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="50vh">
      <form onSubmit={handleSubmit} className="initial_form">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="file_upload" className="custom-file-upload"></label>
          <Input
            type="file"
            onChange={handleImageChange}
            id="image_uploader"
            sx={{ width: '500px', height: '55px' }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ fontSize: '20px', padding: '12px' }}
          >
            Submit
          </Button>
        </div>
      </form>
    </Box>
  );
}

export default ImageUploader;
