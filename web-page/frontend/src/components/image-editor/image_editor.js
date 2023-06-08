import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import './image-editor.scss';


function valueLabelFormat(value) {
    return `${value} ${'%'}`;
}

/*
* Image editor
*/
export default function ImageEditor(){
    // TODO: Get image from backend
    //Get an image from link and display it.

    return (
        <Box className="background-full" >
            <Box className='image-box'>
                <img src={require("../../assets/house.jpg")}
                alt="Image not working"
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

