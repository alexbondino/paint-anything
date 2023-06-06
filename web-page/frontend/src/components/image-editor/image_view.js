//import React, { useEffect } from 'react';

function ImageView(image) {
    return(
        <div>
            <img src={image.path} alt="uploaded"/>
        </div>
    );
}

export default ImageView;