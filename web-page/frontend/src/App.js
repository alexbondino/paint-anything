import React from 'react';
import ImageUploader from './components/upload_image/upload_image.js';
import CleanTempDir from './components/page_status/page_status.js';
import ImageEditorDrawer from './components/side_nav/nav_bar.js';
import { ThemeProvider } from '@mui/material/styles';
import AppTheme from './app_theme.js';

const App = () => {
  return (
    <ThemeProvider theme={AppTheme()}>
      <div>
        <ImageEditorDrawer />
        <ImageUploader />
        <CleanTempDir />
      </div>
    </ThemeProvider>
  );
};

export default App;
