import React, { useState } from 'react';
import axios from 'axios';
import './upload_image.css';

function ImageUploader() { //Change the selected image and save it in a variable
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => { //manages the selected image change
    setSelectedImage(event.target.files[0]); // This saves the image in cache without calling the POST API.
  };

  const handleSubmit = async (event) => {
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
        <span>Select File</span>
        </label>
        <input id="file_upload" hidden type="file" accept="image/*" name="imagen" className="upload_image"  onChange={handleImageChange} />
        <button type="submit" className="primary_button">Submit</button>
      </form>

    </div>
  );
}

export default ImageUploader;