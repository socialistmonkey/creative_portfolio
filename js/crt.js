/* ===========================================================
   crt.js — the screen effects. Loaded on every page.

   initCrtCanvas()  scanlines + a slow light sweep, drawn on a canvas that
                    sits above the text, so redrawing it never moves the text.
   initPowerOn()    the "TV turning on" flash, once per browser session.
   =========================================================== */

const SCANLINE_COLOR = 'rgba(0, 0, 0, 0.14)';
const SWEEP_SPEED = 0.00005;   // fraction of the screen height per millisecond
const SWEEP_START = -0.25;     // starts and restarts above the screen...
const SWEEP_END = 1.25;        // ...and is wrapped once it is below it
const SWEEP_BAND = 0.16;       // half the band's height, as a fraction of the screen


function initCrtCanvas(){
  const canvas = document.getElementById('crtCanvas');
  const context = canvas.getContext('2d');
  const frame = document.getElementById('screenFrame');
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  let width = 0;
  let height = 0;
  let sweepPosition = SWEEP_START;
  let lastTime = performance.now();

  /* match the canvas resolution to the screen's size */
  function resize(){
    const size = frame.getBoundingClientRect();
    width = Math.max(1, Math.round(size.width * pixelRatio));
    height = Math.max(1, Math.round(size.height * pixelRatio));
    canvas.width = width;
    canvas.height = height;
  }

  /* fixed thin dark lines, never moving */
  function drawScanlines(){
    const spacing = Math.max(3, Math.round(4 * pixelRatio));
    const thickness = Math.max(1, Math.round(pixelRatio));
    context.fillStyle = SCANLINE_COLOR;
    for (let y = 0; y < height; y += spacing){
      context.fillRect(0, y, width, thickness);
    }
  }

  /* a soft horizontal band of light drifting slowly downward */
  function drawSweep(elapsed){
    sweepPosition += elapsed * SWEEP_SPEED;
    if (sweepPosition > SWEEP_END) sweepPosition = SWEEP_START;

    const center = sweepPosition * height;
    const half = height * SWEEP_BAND;
    const gradient = context.createLinearGradient(0, center - half, 0, center + half);
    gradient.addColorStop(0, 'rgba(255, 190, 110, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 190, 110, 0.045)');
    gradient.addColorStop(1, 'rgba(255, 190, 110, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, center - half, width, half * 2);
  }

  function drawFrame(now){
    const elapsed = Math.min(now - lastTime, 50);   // cap, so a background tab doesn't make the sweep jump
    lastTime = now;

    context.clearRect(0, 0, width, height);
    drawScanlines();
    drawSweep(elapsed);

    requestAnimationFrame(drawFrame);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(drawFrame);
}


/* The power-on flash plays on the first page of a visit only, not on
   every page change. Afterwards the screen just does its quiet flicker. */
function initPowerOn(){
  const frame = document.getElementById('screenFrame');

  try{
    if (sessionStorage.getItem('crtPowered') === '1') return;
    sessionStorage.setItem('crtPowered', '1');
  }catch(e){}

  frame.classList.add('power-on');
  frame.addEventListener('animationend', function onAnimationEnd(event){
    if (event.animationName !== 'powerOn') return;
    frame.classList.remove('power-on');
    frame.removeEventListener('animationend', onAnimationEnd);
  });
}
