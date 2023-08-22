export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/**
 *  Converts hsl color model to hexadecimal string representation
 * @param {int} h hue value [0-360]
 * @param {int} s saturation value [0-100]
 * @param {int} deltaL lightness offset [-100-100]
 * @param {int} meanL mean lightness taken from original mask [0-100]
 * @returns hexadecimal string rep
 */
export function hslToPreviewHex(h, s, deltaL, meanL) {
  // adjust deltaL so that when it is applied to meanL it is in 0-100 range
  const adjustedDelta = deltaL > 0 ? (deltaL / 100) * (100 - meanL) : (deltaL / 100) * meanL;
  const l = (meanL + adjustedDelta) / 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const rgbToHSL = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

export const hslToRGB = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};

export const resizeImgFile = (file, dstSize) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (readerEvent) {
      var img = new Image();
      img.onload = function (imgEvent) {
        var canvas = document.createElement('canvas');
        var imgWidth = img.width;
        var imgHeight = img.height;
        if (imgWidth > imgHeight) {
          if (imgWidth > dstSize) {
            console.log('img is too wide, resizing it ...');
            imgHeight *= dstSize / imgWidth;
            imgWidth = dstSize;
          }
        } else {
          if (imgHeight > dstSize) {
            console.log('img is to tall, resizing it ...');
            imgWidth *= dstSize / imgHeight;
            imgHeight = dstSize;
          }
        }
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        canvas.getContext('2d').drawImage(img, 0, 0, imgWidth, imgHeight);
        canvas.toBlob(function (blob) {
          resolve(new File([blob], 'image/png'));
        });
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
