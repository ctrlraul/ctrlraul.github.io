'use strict';


init()



// Functions

function init () {

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 128;
  canvas.height = 64;

  disableAntialiasing(canvas, ctx);

  const pixels = new Array(canvas.width * canvas.height).fill(0);
  let frame = 0;

  // Add fire source floor
  for (let i = 0; i < canvas.width; i++) {
    pixels[i] = 1;
  }

  const loop = () => {
    frame++;
    update(canvas, pixels, frame);
    render(canvas, ctx, pixels);
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

}


function update (canvas, pixels, frame) {

  const decay = 0.05;
  const windForce = 1;

  for (let i = pixels.length; i--;) {

    const x = i % canvas.width;
    const y = Math.floor(i / canvas.width);

    const pixel = pixels[i];
    const indexOfPixelBelow = x + (y - 1) * canvas.width;
    const indexOfPixelAbove = x + (y + 1) * canvas.width;

    const wind = Math.round(Math.random() * windForce);


    if (pixels[indexOfPixelAbove] !== undefined) {
      if (Math.random() > 0.2)
      pixels[indexOfPixelAbove + wind] = Math.max(0, pixel - decay * Math.random());
      else pixels[indexOfPixelAbove + wind] = pixel
    }

    pixels[i] = Math.max(0, pixel - decay);

    if (pixels[indexOfPixelBelow] === undefined) {
      pixels[i] = 1;
    }
  
    const indexOfPixelAboveAbove = x + (y + 2) * canvas.width;

    if (Math.random() < pixel / 4) {
      if (pixels[indexOfPixelAboveAbove] !== undefined) {
        pixels[indexOfPixelAboveAbove] = Math.min(1, pixels[indexOfPixelAboveAbove] + decay)
      }
    }

  }

}


function render (canvas, ctx, pixels) {

  for (let i = 0; i < pixels.length; i++) {

    const x = i % canvas.width;
    const y = Math.floor(i / canvas.width);

    ctx.fillStyle = getFireColor(pixels[i]);
    ctx.fillRect(x, y, 1, 1);

  }

}


function disableAntialiasing (canvas, ctx) {

  canvas.style.imageRendering = 'pixelated';

  ctx.imageSmoothingEnabled = false;       // standard
  ctx.mozImageSmoothingEnabled = false;    // Firefox
  ctx.oImageSmoothingEnabled = false;      // Opera
  ctx.webkitImageSmoothingEnabled = false; // Safari
  ctx.msImageSmoothingEnabled = false;     // IE

}


function getFireColor (scale) {
  const r = Math.round(scale * 255);
  const g = Math.round(r - (255 - r) / 2);
  const b = Math.round(r - (255 - r) * 2);
  return `rgb(${r}, ${g}, ${b})`;
}
