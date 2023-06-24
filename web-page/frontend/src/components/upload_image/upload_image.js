import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input } from '@mui/material';
import Box from '@mui/material/Box';

export function ImageUploader({ onImageUpload }) {
  const [uploaderVisibility, setUploaderVisibility] = useState('block');
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

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      onImageUpload(selectedImage);
      setUploaderVisibility({ display: 'none' });
      await axios.post('http://localhost:8000/api/image', formData);
      console.log('Imagen enviada correctamente.');
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
    }
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="60vh">
      <form onSubmit={handleSubmit} className="initial_form">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label htmlFor="file_upload" className="custom-file-upload"></label>
          <Input
            type="file"
            onChange={handleImageChange}
            id="image_uploader"
            sx={{ width: '500px', height: '55px', display: uploaderVisibility }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ fontSize: '20px', padding: '12px', display: uploaderVisibility }}
          >
            Submit
          </Button>
        </div>
      </form>
    </Box>
  );
}

export default ImageUploader;
