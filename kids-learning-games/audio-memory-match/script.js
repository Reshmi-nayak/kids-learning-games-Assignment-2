/* =========================================================
   AUDIO MEMORY MATCH
   Senior-level, safe, commented vanilla JS
========================================================= */

// ---------- SCREEN MANAGEMENT ----------
const screens = {
  home: document.getElementById("home"),
  game: document.getElementById("game"),
  win: document.getElementById("win")
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ---------- ELEMENTS ----------
const grid = document.getElementById("grid");
const progress = document.getElementById("progress");
const listenAgainBtn = document.getElementById("listenAgain");

// ---------- GAME STATE ----------
const TOTAL_ROUNDS = 10;
const GRID_SIZE = 4; // Locked 2x2 grid

let round = 1;
let sequence = [];
let playerInput = [];
let tileSounds = [];
let canInput = false;
let listenAgainUsed = false;

// ---------- AUDIO ----------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 0.25) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.frequency.value = freq;
  osc.type = "sine";

  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// Distinct sound pool
const SOUND_POOL = [220, 330, 440, 550, 660, 770];

// ---------- GRID SETUP ----------
function createGrid() {
  grid.innerHTML = "";
  for (let i = 0; i < GRID_SIZE; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = i;
    tile.addEventListener("pointerdown", () => handleTilePress(i, tile));
    grid.appendChild(tile);
  }
}

// ---------- ROUND SETUP ----------
function startRound() {
  canInput = false;
  listenAgainUsed = false;
  listenAgainBtn.disabled = false;

  progress.textContent = `Round ${round} / ${TOTAL_ROUNDS}`;
  playerInput = [];
  sequence = [];

  // Shuffle sounds every round
  tileSounds = shuffle([...SOUND_POOL]).slice(0, GRID_SIZE);

  // Create new sequence
  const length = Math.min(2 + round, 8);
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * GRID_SIZE));
  }

  playSequence();
}

// ---------- PLAY SEQUENCE ----------
async function playSequence() {
  for (let index of sequence) {
    await activateTile(index);
  }
  canInput = true;
}

// ---------- TILE FEEDBACK ----------
function activateTile(index) {
  return new Promise(resolve => {
    const tile = grid.children[index];
    tile.classList.add("active");
    playTone(tileSounds[index]);

    setTimeout(() => {
      tile.classList.remove("active");
      setTimeout(resolve, 150);
    }, 350);
  });
}

// ---------- PLAYER INPUT ----------
function handleTilePress(index, tile) {
  if (!canInput) return;

  tile.classList.add("active");
  playTone(tileSounds[index]);
  setTimeout(() => tile.classList.remove("active"), 150);

  playerInput.push(index);

  const step = playerInput.length - 1;
  if (playerInput[step] !== sequence[step]) {
    failFeedback();
    return;
  }

  if (playerInput.length === sequence.length) {
    round++;
    if (round > TOTAL_ROUNDS) {
      showScreen("win");
      launchConfetti();
    } else {
      setTimeout(startRound, 600);
    }
  }
}

// ---------- FAIL ----------
function failFeedback() {
  canInput = false;
  playTone(120, 0.4);
  playerInput = [];
  playSequence();
}

// ---------- LISTEN AGAIN ----------
listenAgainBtn.onclick = () => {
  if (listenAgainUsed) return;
  listenAgainUsed = true;
  listenAgainBtn.disabled = true;
  playSequence();
};

// ---------- UTIL ----------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- CONFETTI ----------
function launchConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 6 + 4,
    dx: Math.random() - 0.5,
    dy: Math.random() * 3 + 2
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${Math.random() * 360},100%,60%)`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ---------- BUTTONS ----------
document.getElementById("startBtn").onclick = () => {
  createGrid();
  round = 1;
  showScreen("game");
  startRound();
};

document.getElementById("menuBtn").onclick =
document.getElementById("backHome").onclick = () => showScreen("home");

document.getElementById("resetBtn").onclick = () => {
  round = 1;
  startRound();
};

// HOW TO PLAY
document.getElementById("howBtn").onclick = () =>
  document.getElementById("howModal").classList.remove("hidden");

document.getElementById("closeHow").onclick = () =>
  document.getElementById("howModal").classList.add("hidden");
