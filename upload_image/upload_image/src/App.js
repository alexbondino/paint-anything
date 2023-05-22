import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  /// Variables
  const [data, setData] = useState(null);

  /// Usa un efecto para obtener data
  useEffect(() => {
    fetchData();
  }, []);

  /// Esta función realiza una petición get a la url /api/data
  const fetchData = () => {
    axios.get('http://localhost:8000/api/data')
      .then((response) => {  /// Esto accede al json de respuesta y almacena la data
        setData(response.data); //Actualiza el estado de react con la respuesta a la solicitud.
        console.log(response.data)
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      {data ? (
        <p>{data.message}</p>
      ) : (
        <p>Daniel Smith</p>
      )}
    </div>
  );
}

export default App;
