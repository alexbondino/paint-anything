import React from 'react';
import PropTypes from 'prop-types';

const Canvas = ({ draw, zIndex }) => {
  const canvas = React.useRef();
  React.useEffect(() => {
    const context = canvas.current.getContext('2d');
    draw(context, canvas);
  });
  return <canvas ref={canvas} className="mask-img" style={{ zIndex: zIndex }} />;
};

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
};
export default Canvas;
