'use strict';


const infoElement = document.getElementById('info');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const updateTimer = new Timer();
const renderTimer = new Timer();
const pixels = [];

const canvasSizeMax = 400;
const tickInterval = 2;

let decay = 0;
let wind = 0;
let windVelocity = 0;
let lastMouseX = 0


init();


function init()
{
	infoElement.style.display = 'none';

	adjustToWindowSize();

	window.addEventListener('resize', adjustToWindowSize);
	window.addEventListener('click', toggleInfo);
	window.addEventListener('mousemove', adjustWind);

	disableAntialiasing(canvas, ctx);
	requestAnimationFrame(tick);
}

function adjustToWindowSize()
{
	canvas.width = Math.round(window.innerWidth / 6);
	canvas.height = Math.round(window.innerHeight / 8);

	// Add/Remove pixels
	const oldLength = pixels.length;
	pixels.length = canvas.width * canvas.height;
	if (oldLength < pixels.length)
		pixels.fill(0, oldLength);

	// Adjust delay
	decay = 10 / canvas.height;
	
	// Regenerate fire source rows
	for (let i = 0; i < canvas.width; i++)
		pixels[i] = 1;
}

function toggleInfo(event)
{
	if (event.ctrlKey)
		infoElement.style.display = infoElement.style.display ? '' : 'none';
}

function tick()
{
	const frame = requestAnimationFrame(tick);

	if (frame % tickInterval != 0)
		return;

	updateTimer.start();
	update(canvas, pixels, decay, wind);
	updateTimer.stop();

	renderTimer.start();
	render(canvas, ctx, pixels);
	renderTimer.stop();

	// Wind decay
	wind += windVelocity;
	windVelocity *= 0;
	wind *= 0.92;

	if (frame % 60 == 0)
	{
		infoElement.textContent = [
			`FPS: ${(1000 / (updateTimer.time + renderTimer.time)).toFixed(1)}`,
			`Update: ${updateTimer.time.toFixed(1)} ms`,
			`Render: ${renderTimer.time.toFixed(1)} ms`
		].join('\n');
	}
}

function adjustWind(event)
{
	windVelocity += event.movementX * 15;
	lastMouseX = event.pageX / window.innerWidth * canvas.width;
}

function disableAntialiasing(canvas, ctx)
{
	canvas.style.imageRendering = 'pixelated';
	ctx.imageSmoothingEnabled = false;       // standard
	ctx.mozImageSmoothingEnabled = false;    // Firefox
	ctx.oImageSmoothingEnabled = false;      // Opera
	ctx.webkitImageSmoothingEnabled = false; // Safari
	ctx.msImageSmoothingEnabled = false;     // IE
}

function update(canvas, pixels, decay, wind)
{
	for (let i = pixels.length; i--;)
	{
		const x = i % canvas.width;
		const y = Math.floor(i / canvas.width);

		const pixel = pixels[i];
		const upperIndex = x + (y + 1) * canvas.width;

		if (pixels[upperIndex] !== undefined)
		{
			const spread = Math.random() * 2 - 1;
			const mouseInfluence = Math.pow((1 - Math.abs(x - lastMouseX) / canvas.width), 3);
			const windInfluence = (0.3 + (y / canvas.height) * 0.7) * (mouseInfluence / 1000);
			const windForce = Math.round(spread + wind * windInfluence * 2.5);
			const localDecay = decay * Math.random() * (1.7 - mouseInfluence);
			pixels[upperIndex + windForce] = Math.max(0, pixel - localDecay);
		}
	
		if (Math.random() < pixel / 3)
		{
			const upperUpperIndex = x + (y + 2) * canvas.width;

			if (pixels[upperUpperIndex] !== undefined)
				pixels[upperUpperIndex] = Math.pow(pixels[upperUpperIndex], 0.75)
		}
	}
}

function render(canvas, ctx, pixels)
{
	const imageData = new ImageData(canvas.width, canvas.height);

	for (let i = pixels.length; i--;)
	{
		if (pixels[i])
		{
			const rgb = getFireColor(pixels[i]);
			const offset = i * 4

			imageData.data[offset    ] = rgb[0]; // R
			imageData.data[offset + 1] = rgb[1]; // G
			imageData.data[offset + 2] = rgb[2]; // B
			imageData.data[offset + 3] = rgb[3]; // A
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

function getFireColor(scale) {
	const r = Math.round(scale * 255);
	const g = 2 * r - 255;
	const b = 3 * r - 510;
	// const a = Math.pow(scale, 0.25) * 255;
	return [r, g, b, 255];
}
