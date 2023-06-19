import { useState } from 'react';
import {ImageUploader} from './components/upload_image/upload_image.js'
import {ImageEditorDrawer} from './components/side_nav/nav_bar.js'
import ImageEditor from './components/image-editor/image_editor.js'

export function SidebarVisibility(){
    const [sidebarVisibility, setSidebarVisibility] = useState('none');
    console.log(sidebarVisibility)

    function handleSidebarVisibilityChange(){
        setSidebarVisibility('flex')
    }


    return [
        <ImageEditorDrawer sidebarVisibility={sidebarVisibility}/>,
        <ImageEditor sidebarVisibility={sidebarVisibility}/>,
        <ImageUploader onImageUpload={handleSidebarVisibilityChange}/>
        
        
    ]

}