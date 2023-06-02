import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid'; // Grid version 1
//import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Box from '@mui/material/Box';
import ImageView from 'image_view.js'
import Slider from '@mui/material/Slider';


const [img, setImg] = useState()

function valueLabelFormat(value) {
    return `${value} ${'%'}`;
  }

/*
* Image editor
*/
export default function ImageEditor(){
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
    return (
        <Box xs ={{ flexGrow: 1}}>
            <Grid xs={8}>
                <ImageView url='web-page\frontend\src\assets\house.jpg'/>
            </Grid>
            <Grid xs={4}>
            </Grid>
            <Grid xs={8}>
                <Slider
                    aria-label='Hue'
                    default-value={0}
                    min={0}
                    max={360}
                    >
                </Slider>
                <Slider
                    aria-label='Saturation'>
                    default-value={0}
                    min={0}
                    max={100}
                    valueLabelFormat={valueLabelFormat}
                </Slider>
                <Slider
                    aria-label='Lightness'
                    default-value={0}
                    min={0}
                    max={100}
                    valueLabelFormat={valueLabelFormat}>
                </Slider>
            </Grid>
            <Grid xs={4}>
            </Grid>
        </Box>
    );
}

