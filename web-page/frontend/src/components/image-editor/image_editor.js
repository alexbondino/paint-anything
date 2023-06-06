//import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid'; // Grid version 1
//import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Box from '@mui/material/Box';
import ImageView from './image_view.js'
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import './image-editor.scss';

//const [img, setImg] = useState()

function valueLabelFormat(value) {
    return `${value} ${'%'}`;
}

/*
* Image editor
*/
export default function ImageEditor(){
    // TODO: Get image from backend
    //Get image from API and display it.
    /*
    const [image, setImage] = useState([])

    const fetchImage = async () => {
        const res = await fetch('http://localhost:8000/api/image', {
            method: 'GET',
        });
        const imageBlob = await res.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setImg(imageObjectURL);
      };

    useEffect(() => {
        fetchImage();
    }, []);
    */
   //TODO: center image for vertical images
    return (
        <Box className="background-full" >
            <Box className='image-box'>
            
                <img src='../../assets/house.jpg'
                alt="uploaded"
                />
            </Box>
            <Box className="sliders-box">
                <Typography variant="button" id="input-slider" gutterBottom>
                Hue
                </Typography>
                <Slider
                    aria-label='Hue'
                    size="small"
                    default-value={0}
                    min={0}
                    max={360}
                    valueLabelDisplay="auto"
                    >
                </Slider>
                <Typography variant="button" id="input-slider" gutterBottom>
                    Saturation
                </Typography>
                <Slider
                    aria-label='Saturation'
                    default-value={0}
                    size="small"
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueLabelFormat}>
                </Slider>
                <Typography variant="button" id="input-slider" gutterBottom>
                    Lightness
                </Typography>
                <Slider
                    aria-label='Lightness'
                    default-value={0}
                    size="small"
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueLabelFormat}>
                </Slider>
            </Box>
        </Box>
    );
}

