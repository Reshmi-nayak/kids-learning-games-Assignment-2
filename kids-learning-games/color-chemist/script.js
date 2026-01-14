/************************************************
 * THE COLOR CHEMIST – FINAL FIXED VERSION
 ************************************************/

/* ---------- ELEMENTS ---------- */
const screens = {
  home: document.getElementById("homeScreen"),
  game: document.getElementById("gameScreen"),
  win: document.getElementById("winScreen")
};

const howModal = document.getElementById("howModal");

const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const closeHow = document.getElementById("closeHow");
const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");
const playAgain = document.getElementById("playAgain");

const mixer = document.getElementById("mixer");
const mixBtn = document.getElementById("mixBtn");
const targetColorEl = document.getElementById("targetColor");
const progressText = document.getElementById("progressText");
const confettiContainer = document.getElementById("confettiContainer");

const blobs = document.querySelectorAll(".blob");

/* ---------- GAME STATE ---------- */
let mixerContents = [];
let wins = 0;
let currentRecipe = null;

/* ---------- VALID RECIPES ---------- */
const RECIPES = [
  { inputs: ["red", "yellow"], result: "orange" },
  { inputs: ["yellow", "blue"], result: "green" },
  { inputs: ["red", "blue"], result: "purple" }
];

/* ---------- NAVIGATION ---------- */
startBtn.onclick = startGame;
howBtn.onclick = () => howModal.classList.remove("hidden");
closeHow.onclick = () => howModal.classList.add("hidden");
backBtn.onclick = () => location.reload();
resetBtn.onclick = startGame;
playAgain.onclick = () => location.reload();

/* ---------- START GAME ---------- */
function startGame() {
  switchScreen("game");
  wins = 0;
  updateProgress();
  newTarget();
  clearMixer();
}

/* ---------- SCREEN SWITCH ---------- */
function switchScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

/* ---------- TARGET ---------- */
function newTarget() {
  currentRecipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  targetColorEl.style.background = currentRecipe.result;
}

/* ---------- DRAG SYSTEM ---------- */
blobs.forEach(blob => makeDraggable(blob));

function makeDraggable(el) {
  let offsetX, offsetY;

  const start = e => {
    const p = e.touches ? e.touches[0] : e;
    offsetX = p.clientX - el.getBoundingClientRect().left;
    offsetY = p.clientY - el.getBoundingClientRect().top;
    el.style.position = "fixed";
    el.style.zIndex = 1000;
  };

  const move = e => {
    if (!el.style.position) return;
    const p = e.touches ? e.touches[0] : e;
    el.style.left = p.clientX - offsetX + "px";
    el.style.top = p.clientY - offsetY + "px";
  };

  const end = () => {
    tryDrop(el);
    el.style.position = "";
    el.style.left = "";
    el.style.top = "";
    el.style.zIndex = "";
  };

  el.addEventListener("mousedown", start);
  el.addEventListener("touchstart", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("touchmove", move);
  window.addEventListener("mouseup", end);
  window.addEventListener("touchend", end);
}

/* ---------- DROP ---------- */
function tryDrop(el) {
  if (mixerContents.length >= 2) return;

  if (intersects(el, mixer)) {
    const color = el.dataset.color;
    playPop();
    mixerContents.push(color);

    const layer = document.createElement("div");
    layer.className = "mixer-layer";
    layer.style.background = getGradient(color);
    layer.style.left = `${30 + mixerContents.length * 10}px`;
    layer.style.top = `${30 + mixerContents.length * 8}px`;
    mixer.appendChild(layer);
  }
}

/* ---------- MIX ---------- */
mixBtn.onclick = () => {
  if (mixerContents.length !== 2) return;

  const attempt = [...mixerContents].sort().join(",");
  const correct = [...currentRecipe.inputs].sort().join(",");

  if (attempt === correct) {
    mixer.style.background = currentRecipe.result;
    playWinSound();
    wins++;
    updateProgress();
    burstConfetti();

    if (wins >= 10) {
      setTimeout(() => switchScreen("win"), 800);
      return;
    }

    setTimeout(() => {
      newTarget();
      clearMixer();
    }, 900);
  } else {
    mixer.classList.add("shake");
    playFailSound();
    setTimeout(() => mixer.classList.remove("shake"), 300);
    clearMixer();
  }
};

/* ---------- UTIL ---------- */
function clearMixer() {
  mixerContents = [];
  mixer.style.background = "#eee";
  mixer.querySelectorAll(".mixer-layer").forEach(l => l.remove());
}

function updateProgress() {
  progressText.textContent = `Wins: ${wins} / 10`;
}

function intersects(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return !(ar.right < br.left || ar.left > br.right || ar.bottom < br.top || ar.top > br.bottom);
}

/* ---------- COLOR GRADIENT ---------- */
function getGradient(color) {
  return {
    red: "radial-gradient(circle, #ff6f6f, #d60000)",
    yellow: "radial-gradient(circle, #fff176, #fbc02d)",
    blue: "radial-gradient(circle, #64b5f6, #1976d2)"
  }[color];
}

/* ---------- SOUNDS ---------- */
function playPop() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 500;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

function playWinSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 800;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function playFailSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 200;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

/* ---------- CONFETTI ---------- */
function burstConfetti() {
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.background = `hsl(${Math.random() * 360},100%,50%)`;
    c.style.left = window.innerWidth / 2 + "px";
    c.style.top = window.innerHeight / 2 + "px";
    confettiContainer.appendChild(c);

    const angle = Math.random() * Math.PI * 2;
    let speed = Math.random() * 6 + 2;
    let x = 0, y = 0, gravity = 0.2;

    const anim = setInterval(() => {
      x += Math.cos(angle) * speed;
      y += Math.sin(angle) * speed + gravity;
      gravity += 0.05;
      c.style.transform = `translate(${x}px, ${y}px) rotate(${y}deg)`;

      if (y > window.innerHeight) {
        clearInterval(anim);
        c.remove();
      }
    }, 16);
  }
}
