import { useState } from 'react';
import {ImageUploader} from './components/upload_image/upload_image.js'
import {ImageEditorDrawer} from './components/side_nav/nav_bar.js'

export function ImageEditor(){
    const [sidebarVisibility, setSidebarVisibility] = useState('none');
    console.log(sidebarVisibility)

    function handleSidebarVisibilityChange(){
        setSidebarVisibility('flex')
    }


    return [
        <ImageEditorDrawer sidebarVisibility={sidebarVisibility}/>,
        <ImageUploader onImageUpload={handleSidebarVisibilityChange}/>,
        
    ]

}