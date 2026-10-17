/* ===========================================================
   player.js — shows a work's video / images above the CRT effects.

   Loaded on work pages only. Each page describes its media in its own
   HTML, on the frame that reserves the space:

     <div class="media-box" id="mediaBox" data-title="Work title"
          data-media='[{"type":"video","src":"../media/x/1.mp4"}, ...]'>

   "type" is "video" or "image". One entry shows a single player; several
   entries get previous / next arrows (a carousel).

   The player is NOT inside the page flow. It lives in #mediaPortal, a
   layer above the scanlines and vignette, so the piece is never dimmed
   or tinted. Every animation frame the portal is moved to sit exactly
   over the page's #mediaBox (see placePortalOverBox).
   =========================================================== */

const mediaPortal = document.getElementById('mediaPortal');
const mediaScreenFrame = document.getElementById('screenFrame');
const mediaScrollArea = document.getElementById('itemBody');

let mediaBox = null;       // the empty frame in the page that the portal covers
let mediaTitle = '';
let mediaSlides = [];      // [{ type, src }, ...]
let slideIndex = 0;

const VIDEO_CONTROLS_HTML = `
  <div class="player-controls">
    <button class="pc-btn pc-play" type="button" aria-label="Play">▶</button>
    <div class="pc-scrub"><div class="pc-scrub-track"><div class="pc-scrub-fill"></div></div></div>
    <span class="pc-time">0:00 / 0:00</span>
    <button class="pc-btn pc-mute" type="button" aria-label="Toggle sound">SOUND</button>
    <button class="pc-btn pc-full" type="button" aria-label="Fullscreen">⛶</button>
  </div>`;

const IMAGE_CONTROLS_HTML = `
  <div class="img-controls">
    <button class="pc-btn ic-full" type="button" aria-label="Fullscreen">⛶ FULL</button>
  </div>`;


/* ---------- start-up ---------- */

/* Read this page's media description and show the first slide. */
function initWorkMedia(){
  const box = document.getElementById('mediaBox');
  if (!box) return;   // this page has no media (it shows a link instead)

  try{
    mediaSlides = JSON.parse(box.dataset.media);
  }catch(e){
    return;
  }

  mediaBox = box;
  mediaTitle = box.dataset.title || '';
  showSlide(0);
  keepPortalOverBox();
}


/* ---------- slides ---------- */

function showSlide(index){
  slideIndex = index;
  const slide = mediaSlides[slideIndex];
  const hasSeveralSlides = mediaSlides.length > 1;

  mediaPortal.innerHTML = slide.type === 'video'
    ? videoPlayerHtml(slide, hasSeveralSlides)
    : imagePlayerHtml(slide, hasSeveralSlides);

  const player = mediaPortal.querySelector('.player');
  if (slide.type === 'video') wireVideoControls(player);
  else wireImageControls(player);
  if (hasSeveralSlides) wireCarouselArrows(player);

  placePortalOverBox();
}

function videoPlayerHtml(slide, hasSeveralSlides){
  return `<div class="player">
    <video src="${slide.src}" playsinline></video>
    ${hasSeveralSlides ? carouselArrowsHtml() : ''}
    ${VIDEO_CONTROLS_HTML}
  </div>`;
}

function imagePlayerHtml(slide, hasSeveralSlides){
  return `<div class="player">
    <img src="${slide.src}" alt="">
    ${hasSeveralSlides ? carouselArrowsHtml() : ''}
    ${IMAGE_CONTROLS_HTML}
  </div>`;
}

function carouselArrowsHtml(){
  return `<div class="carousel-nav">
    <button class="cn-btn cn-prev" type="button" aria-label="Previous">‹</button>
    <span class="cn-count">${slideIndex + 1} / ${mediaSlides.length}</span>
    <button class="cn-btn cn-next" type="button" aria-label="Next">›</button>
  </div>`;
}

function wireCarouselArrows(player){
  const count = mediaSlides.length;
  player.querySelector('.cn-prev').addEventListener('click', () => showSlide((slideIndex - 1 + count) % count));
  player.querySelector('.cn-next').addEventListener('click', () => showSlide((slideIndex + 1) % count));
}


/* ---------- image controls ---------- */

function wireImageControls(player){
  const image = player.querySelector('img');
  image.alt = mediaTitle;
  player.querySelector('.ic-full').addEventListener('click', () => enterFullscreen(image));
}


/* ---------- video controls ---------- */

function wireVideoControls(player){
  const video = player.querySelector('video');
  const playButton = player.querySelector('.pc-play');
  const muteButton = player.querySelector('.pc-mute');
  const fullscreenButton = player.querySelector('.pc-full');
  const seekBar = player.querySelector('.pc-scrub');
  const seekFill = player.querySelector('.pc-scrub-fill');
  const timeLabel = player.querySelector('.pc-time');

  function togglePlay(){
    if (video.paused) video.play();
    else video.pause();
  }

  function showProgress(){
    const duration = video.duration || 0;
    const fraction = duration ? video.currentTime / duration : 0;
    seekFill.style.width = (fraction * 100) + '%';
    timeLabel.textContent = formatTime(video.currentTime) + ' / ' + formatTime(duration);
  }

  function seekTo(event){
    const bar = seekBar.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - bar.left) / bar.width));
    if (video.duration) video.currentTime = fraction * video.duration;
  }

  function showMuteState(){
    muteButton.textContent = video.muted ? 'MUTED' : 'SOUND';
  }

  /* play / pause */
  playButton.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  video.addEventListener('play', () => { playButton.textContent = '❚❚'; });
  video.addEventListener('pause', () => { playButton.textContent = '▶'; });

  /* progress + seeking (click or drag on the bar) */
  video.addEventListener('timeupdate', showProgress);
  video.addEventListener('loadedmetadata', showProgress);
  seekBar.addEventListener('pointerdown', (event) => {
    seekBar.setPointerCapture(event.pointerId);
    seekTo(event);
  });
  seekBar.addEventListener('pointermove', (event) => {
    if (event.buttons === 1) seekTo(event);
  });
  seekBar.addEventListener('pointerup', (event) => {
    try{ seekBar.releasePointerCapture(event.pointerId); }catch(e){}
  });

  /* sound + fullscreen */
  showMuteState();
  muteButton.addEventListener('click', () => {
    video.muted = !video.muted;
    showMuteState();
  });
  fullscreenButton.addEventListener('click', () => enterFullscreen(video));
}

function formatTime(seconds){
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return minutes + ':' + String(rest).padStart(2, '0');
}

function enterFullscreen(element){
  if (element.requestFullscreen) element.requestFullscreen();
  else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
  else if (element.webkitEnterFullscreen) element.webkitEnterFullscreen();   // iPhone video
}


/* ---------- keeping the portal on top of the page's media frame ---------- */

function keepPortalOverBox(){
  placePortalOverBox();
  requestAnimationFrame(keepPortalOverBox);
}

/* The page text scrolls inside #itemBody, so only the part of the media
   frame that is currently visible inside that scroll area is shown. The
   player inside the portal keeps the full frame size and is offset so it
   appears to be clipped, not squashed. */
function placePortalOverBox(){
  const box = mediaBox.getBoundingClientRect();
  const scrollArea = mediaScrollArea.getBoundingClientRect();
  const screen = mediaScreenFrame.getBoundingClientRect();

  const visibleLeft = Math.max(box.left, scrollArea.left);
  const visibleTop = Math.max(box.top, scrollArea.top);
  const visibleRight = Math.min(box.right, scrollArea.right);
  const visibleBottom = Math.min(box.bottom, scrollArea.bottom);
  const visibleWidth = visibleRight - visibleLeft;
  const visibleHeight = visibleBottom - visibleTop;

  const isScrolledOutOfView = visibleWidth <= 0 || visibleHeight <= 0;
  mediaPortal.classList.toggle('active', !isScrolledOutOfView);
  if (isScrolledOutOfView) return;

  mediaPortal.style.left = (visibleLeft - screen.left) + 'px';
  mediaPortal.style.top = (visibleTop - screen.top) + 'px';
  mediaPortal.style.width = visibleWidth + 'px';
  mediaPortal.style.height = visibleHeight + 'px';

  const player = mediaPortal.firstElementChild;
  if (player){
    player.style.left = (box.left - visibleLeft) + 'px';
    player.style.top = (box.top - visibleTop) + 'px';
    player.style.width = box.width + 'px';
    player.style.height = box.height + 'px';
  }
}
