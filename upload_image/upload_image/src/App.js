import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedImage) {
      console.error("No se ha seleccionado ninguna imagen.");
      return;
    }

    const formData = new FormData();
    formData.append('imagen', selectedImage);

    try {
      await axios.post('http://localhost:8000/api/image', formData);
      console.log("Imagen enviada correctamente.");
    } catch (error) {
      console.error("Error al enviar la imagen:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} class="initial_form">
        <label for="file_upload" class="custom-file-upload">
          <span>Seleccionar archivo</span>
        </label>
        <input id="file_upload" hidden type="file" accept="image/*" name="imagen"class="upload_image"  onChange={handleImageChange} />
        <button type="submit" class="primary_button">Submit</button>
      </form>
    </div>
  );
}

export default ImageUploader;