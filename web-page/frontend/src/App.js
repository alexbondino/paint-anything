import React from 'react';
import ImageUploader from './components/upload_image/upload_image.js';
import CleanTempDir from './components/page_status/page_status.js';

const App = () => {
  return (
    <div>
      <ImageUploader/>
      <CleanTempDir/>
    </div>
  );
};

export default App;