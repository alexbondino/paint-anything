import React, { useEffect } from 'react';

function ImageView(image) {
    return(
        <div>
            <img src={image.url}/>
        </div>
    );
}

export default ImageView;