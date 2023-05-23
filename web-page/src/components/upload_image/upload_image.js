import React, { useState } from 'react';
import axios from 'axios';
import './upload_image.css';

function ImageUploader() { //Con esta función se puede cambiar la imagen seleccionada y se guarda en una variable.
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => { //maneja el cambio de la imagen seleccionada
    setSelectedImage(event.target.files[0]); // guarda la imagen seleccionada sin acceder al POST
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedImage) { //notifica un error en consola si no se cargó una imagen y se da click en "Submit"
      console.error("No se ha seleccionado ninguna imagen.");
      return;
    }

    const formData = new FormData(); 
    formData.append('imagen', selectedImage); // agrega la imagen a la variable formData.

    try {
      await axios.post('http://localhost:8000/api/image', formData); // Se conecta a la api POST y le da la imagen en formData
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