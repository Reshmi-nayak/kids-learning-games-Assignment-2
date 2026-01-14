/************************************************
 * SHADOW DETECTIVE – IMPROVED VERSION
 ************************************************/

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const howModal = document.getElementById("howModal");

const startBtn = document.getElementById("startBtn");
const howBtn = document.getElementById("howBtn");
const closeHow = document.getElementById("closeHow");
const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

const objectsEl = document.getElementById("objects");
const shadowsEl = document.getElementById("shadows");
const confettiContainer = document.getElementById("confettiContainer");

let level = 1;

/* ---------- ITEMS WITH SHAPES ---------- */
const ITEMS = [
  { id: "cat", shape: "circle" },
  { id: "fish", shape: "oval" },
  { id: "apple", shape: "blob" },
  { id: "bird", shape: "triangle" },
  { id: "banana", shape: "capsule" },
  { id: "dog", shape: "hexagon" }
];

let matched = 0;

/* ---------- NAV ---------- */
startBtn.onclick = () => startGame();
howBtn.onclick = () => howModal.classList.remove("hidden");
closeHow.onclick = () => howModal.classList.add("hidden");
backBtn.onclick = () => location.reload();
resetBtn.onclick = () => startGame();

/* ---------- GAME START ---------- */
function startGame() {
  homeScreen.classList.remove("active");
  gameScreen.classList.add("active");

  matched = 0;
  objectsEl.innerHTML = "";
  shadowsEl.innerHTML = "";
  confettiContainer.innerHTML = "";

  const count = Math.min(2 + level, ITEMS.length);
  const selected = shuffle([...ITEMS]).slice(0, count);

  shuffle([...selected]).forEach(item => {
    const obj = createShape(item, true);
    objectsEl.appendChild(obj);
  });

  shuffle([...selected]).forEach(item => {
    const shadow = createShape(item, false);
    shadowsEl.appendChild(shadow);
  });
}

/* ---------- CREATE SHAPE ---------- */
function createShape(item, draggable) {
  const el = document.createElement("div");
  el.className = `shape ${item.shape} ${draggable ? "draggable" : "shadow"}`;
  el.dataset.id = item.id;

  if (draggable) makeDraggable(el);
  return el;
}

/* ---------- DRAG SYSTEM ---------- */
function makeDraggable(el) {
  let offsetX, offsetY;

  const start = e => {
    const p = e.touches ? e.touches[0] : e;
    offsetX = p.clientX - el.getBoundingClientRect().left;
    offsetY = p.clientY - el.getBoundingClientRect().top;
    el.style.position = "fixed";
  };

  const move = e => {
    if (!el.style.position) return;
    const p = e.touches ? e.touches[0] : e;
    el.style.left = p.clientX - offsetX + "px";
    el.style.top = p.clientY - offsetY + "px";
  };

  const end = () => {
    checkDrop(el);
    el.style.position = "";
    el.style.left = "";
    el.style.top = "";
  };

  el.addEventListener("mousedown", start);
  el.addEventListener("touchstart", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("touchmove", move);
  window.addEventListener("mouseup", end);
  window.addEventListener("touchend", end);
}

/* ---------- MATCH CHECK ---------- */
function checkDrop(el) {
  document.querySelectorAll(".shadow").forEach(shadow => {
    if (intersects(el, shadow)) {
      if (el.dataset.id === shadow.dataset.id) {
        playPop();
        el.classList.add("matched");
        el.style.pointerEvents = "none";
        shadow.style.opacity = "0.8";
        matched++;

        if (matched === document.querySelectorAll(".shadow").length) {
          level++;
          burstConfetti();
        }
      } else {
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 300);
      }
    }
  });
}

/* ---------- COLLISION ---------- */
function intersects(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return !(ar.right < br.left || ar.left > br.right || ar.bottom < br.top || ar.top > br.bottom);
}

/* ---------- SOUND ---------- */
function playPop() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 500;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/* ---------- BETTER CONFETTI ---------- */
function burstConfetti() {
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.background = `hsl(${Math.random()*360},100%,50%)`;
    c.style.left = window.innerWidth / 2 + "px";
    c.style.top = window.innerHeight / 2 + "px";

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    let x = 0, y = 0, gravity = 0.3;

    confettiContainer.appendChild(c);

    const anim = setInterval(() => {
      x += Math.cos(angle) * speed;
      y += Math.sin(angle) * speed + gravity;
      gravity += 0.1;

      c.style.transform = `translate(${x}px, ${y}px) rotate(${y}deg)`;

      if (y > window.innerHeight) {
        clearInterval(anim);
        c.remove();
      }
    }, 16);
  }
}

/* ---------- UTILS ---------- */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
