import React from 'react';
import PropTypes from 'prop-types';

/**
 * Canvas wrapper for React. This is used to draw masks
 *
 * @param {int} layerId id of layer to draw
 * @param {function} draw this callable handles the drawing of the layer, with its appropriate hsl values
 * @param {int} zIndex indicates draw priority. When comparing two layers, the layer with the higher this
 * value will have draw priority in overlaps.
 * @returns
 */
const Canvas = ({ layerId, draw, zIndex }) => {
  const canvas = React.useRef();
  React.useEffect(() => {
    const context = canvas.current.getContext('2d', { willReadFrequently: true });
    draw(context, canvas);
  });
  return (
    <canvas
      id={`canvas-${layerId}`}
      ref={canvas}
      className={'mask-img'}
      style={{ zIndex: zIndex }}
    />
  );
};

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
};
export default Canvas;
