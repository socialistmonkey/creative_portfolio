/* ===========================================================
   main.js — behaviour shared by every page.

   There are three kinds of page, set on <body data-page="…">:
     cover   index.html         boot sequence, then the title screen
     index   portfolio.html     list of all works
     work    works/NN-*.html    one work (data-index = its number, 1-13)

   <body data-root=""> or data-root="../" is the path back to the site
   root, so the same code builds correct links from any folder.

   Script order on every page: data.js, crt.js, [player.js], main.js
   =========================================================== */


/* ===========================================================
   1. WHERE AM I?
   =========================================================== */
const ROOT = document.body.dataset.root || '';
const PAGE = document.body.dataset.page;
const TOTAL = PROJECTS.length;
const CURRENT = PAGE === 'work' ? Number(document.body.dataset.index) - 1 : -1;   // 0-based, -1 when not a work page

const COVER_URL = ROOT + 'index.html';
const INDEX_URL = ROOT + 'portfolio.html';

function pad(number){
  return String(number).padStart(2, '0');
}

/* i is 0-based: workUrl(0) → "works/01-digital-decay.html" */
function workUrl(i){
  return ROOT + 'works/' + pad(i + 1) + '-' + PROJECTS[i].slug + '.html';
}

function go(url){
  window.location.href = url;
}


/* ===========================================================
   2. SESSION MEMORY
   Remembers, until the tab is closed: which works were opened (the dot
   on the channel bar), the last selected row of the index, and whether
   the boot sequence has already played.
   =========================================================== */
function recall(key, fallback){
  try{
    const stored = sessionStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  }catch(e){
    return fallback;
  }
}

function remember(key, value){
  try{
    sessionStorage.setItem(key, JSON.stringify(value));
  }catch(e){}
}

const visited = new Set(recall('visited', []));
let menuIndex = Math.min(Math.max(recall('menuIndex', 0), 0), TOTAL - 1);
let isBooting = false;   // true only on the cover page while the boot lines play

if (PAGE === 'work'){
  visited.add(CURRENT);
  remember('visited', [...visited]);
  remember('menuIndex', CURRENT);   // so "back to index" lands on this work's row
}


/* ===========================================================
   3. ELEMENTS
   =========================================================== */
const ui = {
  screen: document.getElementById('screen'),
  boot: document.getElementById('stage-boot'),
  intro: document.getElementById('stage-intro'),
  menuList: document.getElementById('menuList'),
  channelBar: document.getElementById('channelBar'),
  nowViewing: document.getElementById('nowViewing'),
};


/* ===========================================================
   4. SCREEN FURNITURE (label in the corner + channel bar)
   =========================================================== */
function nowViewingText(){
  if (PAGE === 'cover') return isBooting ? '' : 'COVER';
  if (PAGE === 'index') return 'INDEX · ' + TOTAL + ' FILES';
  return 'CH ' + pad(CURRENT + 1) + ' / ' + TOTAL;
}

function updateNowViewing(){
  ui.nowViewing.textContent = nowViewingText();
}

/* the row of buttons under the screen: R (cover) | 01 02 … 13 */
function buildChannelBar(){
  ui.channelBar.innerHTML = '';

  const label = document.createElement('span');
  label.className = 'ch-label';
  label.textContent = 'CHANNEL';
  ui.channelBar.appendChild(label);

  const coverButton = document.createElement('a');
  coverButton.className = 'channel-btn cover';
  coverButton.textContent = 'R';
  coverButton.title = 'Return to cover page';
  coverButton.href = COVER_URL;
  ui.channelBar.appendChild(coverButton);

  const divider = document.createElement('div');
  divider.className = 'channel-divider';
  ui.channelBar.appendChild(divider);

  PROJECTS.forEach((project, i) => {
    const button = document.createElement('a');
    button.className = 'channel-btn';
    button.dataset.idx = i;
    button.href = workUrl(i);
    button.title = project.title;
    button.innerHTML = '<span class="ch-num">' + pad(i + 1) + '</span>';
    ui.channelBar.appendChild(button);
  });
}

/* light up the current page's button and mark opened works */
function updateChannelBar(){
  ui.channelBar.querySelectorAll('.channel-btn').forEach((button) => {
    if (button.classList.contains('cover')){
      button.classList.toggle('active', PAGE === 'cover' && !isBooting);
      return;
    }
    const i = Number(button.dataset.idx);
    button.classList.toggle('active', i === CURRENT);
    button.classList.toggle('visited', visited.has(i));
  });
}


/* ===========================================================
   5. COVER PAGE — boot lines, then the title screen
   =========================================================== */
const BOOT_LINES = [
  'initializing display driver ... OK',
  'loading phosphor buffer ... OK',
  'mounting /portfolio ... OK',
  TOTAL + ' files found',
];
const BOOT_LINE_DELAY = 260;   // ms between lines
const BOOT_PAUSE = 500;        // ms to wait after the last line

let bootTimer = null;

/* Fade the boot lines in one by one, then show the title screen. */
function playBootSequence(){
  isBooting = true;
  ui.boot.innerHTML = '';

  BOOT_LINES.forEach((text, i) => {
    const line = document.createElement('div');
    line.className = 'line';
    line.textContent = '> ' + text;
    ui.boot.appendChild(line);
    setTimeout(() => { line.style.opacity = '1'; }, i * BOOT_LINE_DELAY);
  });

  bootTimer = setTimeout(() => {
    remember('booted', true);
    showTitleScreen();
  }, BOOT_LINES.length * BOOT_LINE_DELAY + BOOT_PAUSE);
}

function showTitleScreen(){
  clearTimeout(bootTimer);
  isBooting = false;
  ui.boot.style.display = 'none';
  ui.intro.classList.add('is-active');
  updateChannelBar();
  updateNowViewing();
}

/* Links from the old single-page site: "#p04" and "#index".
   Returns true if the visitor was sent somewhere else. */
function redirectOldLink(){
  const hash = window.location.hash.replace('#', '');
  const workMatch = hash.match(/^p(\d{1,2})$/);

  if (workMatch){
    const number = parseInt(workMatch[1], 10);
    if (number >= 1 && number <= TOTAL){
      window.location.replace(workUrl(number - 1));
      return true;
    }
  }
  if (hash === 'index'){
    window.location.replace(INDEX_URL);
    return true;
  }
  return false;
}


/* ===========================================================
   6. INDEX PAGE — keyboard selection of a row
   (the rows are plain links in portfolio.html)
   =========================================================== */
function selectMenuRow(newIndex){
  menuIndex = Math.min(Math.max(newIndex, 0), TOTAL - 1);
  highlightMenuRow();
}

function highlightMenuRow(){
  [...ui.menuList.children].forEach((row, i) => {
    row.classList.toggle('active', i === menuIndex);
  });
  const selected = ui.menuList.children[menuIndex];
  if (selected) selected.scrollIntoView({ block: 'nearest' });
}


/* ===========================================================
   7. WORK PAGES — next work
   =========================================================== */
function goToNextWork(){
  if (CURRENT < TOTAL - 1){
    go(workUrl(CURRENT + 1));
  } else {
    remember('menuIndex', 0);   // came to the end: back to the top of the index
    go(INDEX_URL);
  }
}


/* ===========================================================
   8. KEYBOARD
   =========================================================== */

/* Typing a number jumps to that channel: "7" → work 7, "12" → work 12,
   "0" → cover. Digits typed within 550 ms of each other form one number. */
const DIGIT_WINDOW = 550;
let typedDigits = '';
let digitTimer = null;

function typeDigit(digit){
  typedDigits += digit;
  clearTimeout(digitTimer);
  digitTimer = setTimeout(() => {
    const number = parseInt(typedDigits, 10);
    typedDigits = '';
    jumpToChannel(number);
  }, DIGIT_WINDOW);
}

function jumpToChannel(number){
  if (number === 0){
    go(COVER_URL);
  } else if (number >= 1 && number <= TOTAL){
    remember('menuIndex', number - 1);
    go(workUrl(number - 1));
  }
}

/* one handler per page type */
const keyHandlers = {
  cover(event){
    if (event.key === 'Enter') go(INDEX_URL);
  },

  index(event){
    switch (event.key){
      case 'ArrowDown':
        event.preventDefault();
        selectMenuRow(menuIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectMenuRow(menuIndex - 1);
        break;
      case 'Enter':
        go(workUrl(menuIndex));
        break;
      case 'Escape':
      case 'Backspace':
        go(COVER_URL);
        break;
    }
  },

  work(event){
    switch (event.key){
      case 'Enter':
      case 'ArrowRight':
        goToNextWork();
        break;
      case 'Escape':
      case 'ArrowLeft':
      case 'Backspace':
        event.preventDefault();
        go(INDEX_URL);
        break;
    }
  },
};

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;   // leave browser shortcuts alone
  if (isBooting) return;
  if (event.key === 'Enter' && event.target.closest && event.target.closest('a')) return;   // a focused link opens itself

  if (/^[0-9]$/.test(event.key)){
    typeDigit(event.key);
    return;
  }
  keyHandlers[PAGE](event);
});

/* clicking the cover screen: skip the boot, or continue to the index */
ui.screen.addEventListener('click', () => {
  if (PAGE !== 'cover') return;
  if (isBooting) showTitleScreen();
  else go(INDEX_URL);
});


/* ===========================================================
   9. START
   =========================================================== */
const pageStarters = {
  cover(){
    if (recall('booted', false)) showTitleScreen();
    else playBootSequence();
  },

  index(){
    highlightMenuRow();
  },

  work(){
    initWorkMedia();   // from player.js
  },
};

(function start(){
  if (PAGE === 'cover' && redirectOldLink()) return;

  buildChannelBar();
  initCrtCanvas();   // from crt.js
  initPowerOn();     // from crt.js
  pageStarters[PAGE]();

  updateChannelBar();
  updateNowViewing();
})();
