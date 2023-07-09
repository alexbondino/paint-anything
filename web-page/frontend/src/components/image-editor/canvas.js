import React from "react";
import PropTypes from 'prop-types';
import zIndex from "@mui/material/styles/zIndex";

const Canvas = ({draw, height, width}) => {
    const canvas = React.useRef();
    React.useEffect(() => {
      const context = canvas.current.getContext('2d');
      draw(context, canvas);
    });
    return (
        <canvas ref={canvas} className="mask-img"/>
      );
    };

    Canvas.propTypes = {
      draw: PropTypes.func.isRequired,
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
    };
export default Canvas;