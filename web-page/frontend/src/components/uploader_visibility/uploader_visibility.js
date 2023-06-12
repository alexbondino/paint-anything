import { useState } from 'react';

export function ImageUploaderVisibility() {
  const [uploaderVisibility, setUploaderVisibility] = useState('block');
  const [sidebarVisibility, setSidebarVisibility] = useState('none');

  return {
    uploaderVisibility,
    sidebarVisibility,
    setUploaderVisibility,
    setSidebarVisibility,
  };
}
