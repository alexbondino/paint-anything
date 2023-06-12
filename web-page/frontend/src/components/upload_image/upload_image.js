import React, { useState } from 'react';
import axios from 'axios';
import './upload_image.css';
import { Button, Input } from '@mui/material';




 export function ImageUploader() { //Change the selected image and save it in a variable
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploaderVisibility, setUploaderVisibility] = useState({ display: 'block' });

  function handleImageChange(event){
    setSelectedImage(event.target.files[0]);
  }

  async function handleSubmit(event){
    event.preventDefault();

    if (!selectedImage) { 
      console.error("No se ha seleccionado ninguna imagen.");
      return;
    }

    const formData = new FormData(); 
    formData.append('image', selectedImage); // adds the image to the formData variable

    try {
      await axios.post('http://localhost:8000/api/image', formData); // Connects to the POST API and sends the image in the formData const
      console.log("Imagen enviada correctamente.");

      setUploaderVisibility({ display: 'none' });

    } catch (error) {
      console.error("Error al enviar la imagen:", error);
    }
  };

/* Returns a button of upload_image and a submit button.
upload_image: utiliza la función handleImageChange para que la
submit button: utiliza la función handle sumbit para que cuando se presione, se cargue la imagen en la api */
  return (
    <div>
      <form onSubmit={handleSubmit} className="initial_form"> 
        <label htmlFor="file_upload" className="custom-file-upload">
        </label>
        <Input 
        type="file" 
        onChange={handleImageChange} 
        sx={{ width: '500px', height: '55px', ...uploaderVisibility}}/>

        <Button 
        type="submit" 
        variant="contained"
        size="large"
        sx={{ fontSize: '20px', padding: '12px', ...uploaderVisibility }}
        >Submit</Button>
      </form>
    </div>
  );
}

export default ImageUploader;
