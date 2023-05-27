import React, { useEffect } from 'react';
import axios from 'axios';

function CleanTempDir() {
  const handleCleanup = async () => {
    try {
      await axios.post('http://localhost:8000/api/cleanup'); //calls the cleanup_temp_dir in the api.
    } catch (error) {
    }
  };

  useEffect(() => {
    const handleWindowClose = async () => { 
      await handleCleanup(); // Waits fo the handleCleanup function to run for handleWindowClose running.
    };

    window.addEventListener('beforeunload', handleWindowClose); //calls the HandleWindowClose when the window or tab is closed

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose); //removes the event listener to reset its parameters.
    };
  }, []);

  return <div></div>; // Return an empty div as the component doesn't render any visible content
}

export default CleanTempDir;