'use strict';


class Timer {

  history = new Array(16).fill(0)
  startTime = 0

  start () {
    this.startTime = performance.now()
  }

  stop () {
    this.history.push(performance.now() - this.startTime)
    this.history.shift()
    return this.history.reduce((x, y) => x + y, 0) / this.history.length
  }

}


function init () {
  
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  const info = document.getElementById('info');
  const updateTime = document.getElementById('update-time');
  const renderTime = document.getElementById('render-time');
  const windRange = document.getElementById('wind-range');
  const delayRange = document.getElementById('delay-range');
  
  const updateTimer = new Timer();
  const renderTimer = new Timer();
  
  const pixels = [];

  let decay = 0;
  let wind = 0;


  const adjust = () => {

    // Adjust canvas
    canvas.width = Math.min(300, Math.round(window.innerWidth / 4));
    canvas.height = Math.min(300, Math.round(window.innerHeight / 4));

    // Add/Remove pixels
    const oldLength = pixels.length;
    pixels.length = canvas.width * canvas.height;
    if (oldLength < pixels.length) {
      pixels.fill(0, oldLength);
    }

    // Adjust decay
    decay = 10 / canvas.height;

  };

  const adjustWind = () => {
    wind = windRange.value / 50 + (windRange.value < 0 ? -0.6 : 0.6);
  };

  const loop = () => {
  
    const frame = requestAnimationFrame(loop);

    if (delayRange.value === delayRange.max || frame % delayRange.value > 0) {
      return;
    }

    updateTimer.start();
    update(canvas, pixels, decay, wind);
    updateTime.textContent = 'Update: ' + updateTimer.stop().toFixed(1) + 'ms';
  
    renderTimer.start();
    render(canvas, ctx, pixels);
    renderTime.textContent = 'Render: ' + renderTimer.stop().toFixed(1) + 'ms';

  };

  const toggleInfo = () => {
    info.style.display = info.style.display ? '' : 'none';
  };

  
  adjust();
  adjustWind();
  canvas.addEventListener('click', toggleInfo);
  window.addEventListener('resize', adjust);
  windRange.addEventListener('input', adjustWind);
  disableAntialiasing(canvas, ctx);
  requestAnimationFrame(loop);

}


function disableAntialiasing (canvas, ctx) {
  canvas.style.imageRendering = 'pixelated';
  ctx.imageSmoothingEnabled = false;       // standard
  ctx.mozImageSmoothingEnabled = false;    // Firefox
  ctx.oImageSmoothingEnabled = false;      // Opera
  ctx.webkitImageSmoothingEnabled = false; // Safari
  ctx.msImageSmoothingEnabled = false;     // IE
}


function update (canvas, pixels, decay, wind) {

  for (let i = pixels.length; i--;) {

    const x = i % canvas.width;
    const y = Math.floor(i / canvas.width);

    const pixel = pixels[i];
    const indexOfPixelBelow = x + (y - 1) * canvas.width;
    const indexOfPixelAbove = x + (y + 1) * canvas.width;

    const windForce = Math.round(Math.random() * wind);

    // Burn (spread fire upwards)
    if (pixels[indexOfPixelAbove] !== undefined) {
      pixels[indexOfPixelAbove + windForce] = Math.max(0, pixel - decay * Math.random());
    }

    // Makes it so fire is always decaying
    // pixels[i] = Math.max(0, pixel - decay);

    // Make it so pixels at the bottom never stop burning
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

  const imageData = new ImageData(canvas.width, canvas.height)

  for (let i = pixels.length; i--;) {
    if (pixels[i]) { // Having this check saves 0.1ms
      
      const rgb = getFireColor(pixels[i]);
      const offset = i * 4

      imageData.data[offset    ] = rgb[0]; // R
      imageData.data[offset + 1] = rgb[1]; // G
      imageData.data[offset + 2] = rgb[2]; // B
      imageData.data[offset + 3] = 255;    // A

    }
  }

  ctx.putImageData(imageData, 0, 0)

}


function getFireColor (scale) {
  const r = Math.round(scale * 255);
  const g = Math.round(r - (255 - r) / 2);
  const b = Math.round(r - (255 - r) * 2);
  return [r, g, b];
}


init();
