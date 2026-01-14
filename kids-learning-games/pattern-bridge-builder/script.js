/* ======================================================
   PATTERN BRIDGE BUILDER – IMPROVED VERSION
====================================================== */

// ---------- SCREENS ----------
const screens = ["home", "game", "win"];
function showScreen(id) {
  screens.forEach(s => document.getElementById(s).classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- ELEMENTS ----------
const bridge = document.getElementById("bridge");
const choices = document.getElementById("choices");
const robot = document.getElementById("robot");
const levelLabel = document.getElementById("levelLabel");
const feedback = document.getElementById("feedback");

// ---------- AUDIO ----------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(freq, time = 0.2) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.frequency.value = freq;
  o.connect(g).connect(audioCtx.destination);
  g.gain.setValueAtTime(0.001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time);
  o.start();
  o.stop(audioCtx.currentTime + time);
}

// ---------- GAME DATA ----------
let level = 0;

const LEVELS = [
  { p: ["red","blue","red"], a:"blue" },
  { p: ["yellow","yellow","green"], a:"green" },
  { p: ["red","blue","yellow"], a:"red" },
  { p: ["green","purple","green"], a:"purple" },
  { p: ["blue","green","blue"], a:"green" },

  { p: [{c:"red",big:1},{c:"blue"},{c:"red",big:1}], a:{c:"blue"} },
  { p: [{c:"yellow",round:1},{c:"green"},{c:"yellow",round:1}], a:{c:"green"} },
  { p: [{c:"purple",big:1,round:1},{c:"red"},{c:"purple",big:1,round:1}], a:{c:"red"} },

  { p: ["red","yellow","red"], a:"yellow" },
  { p: ["blue","purple","blue"], a:"purple" }
];

const COLORS = ["red","blue","yellow","green","purple"];

// ---------- LEVEL ----------
function startLevel() {
  bridge.innerHTML = "";
  choices.innerHTML = "";
  feedback.textContent = "";
  robot.style.transform = "translateX(0)";
  levelLabel.textContent = `Level ${level+1} / 10`;

  const data = LEVELS[level];
  [...data.p, "missing"].forEach(v => {
    const pl = document.createElement("div");
    pl.className = "plank";
    if (v === "missing") {
      pl.classList.add("missing");
    } else {
      stylePlank(pl, v);
    }
    bridge.appendChild(pl);
  });

  buildChoices(data.a);
}

function stylePlank(el, v) {
  if (typeof v === "string") {
    el.style.background = v;
  } else {
    el.style.background = v.c;
    if (v.big) el.classList.add("big");
    if (v.round) el.classList.add("round");
  }
}

// ---------- CHOICES ----------
function buildChoices(answer) {
  const correct = typeof answer === "string" ? answer : answer.c;
  const opts = new Set([correct]);
  while (opts.size < 3) {
    opts.add(COLORS[Math.floor(Math.random()*COLORS.length)]);
  }

  [...opts].sort(()=>Math.random()-0.5).forEach(c=>{
    const ch = document.createElement("div");
    ch.className = "choice";
    ch.style.background = c;
    ch.onclick = ()=>check(c);
    choices.appendChild(ch);
  });
}

// ---------- CHECK ----------
function check(color) {
  const correct = typeof LEVELS[level].a === "string"
    ? LEVELS[level].a
    : LEVELS[level].a.c;

  if (color === correct) {
    beep(700);
    feedback.textContent = "✅ Great job!";
    reveal();
    walkRobot();
  } else {
    beep(180,0.3);
    feedback.textContent = "❌ Try again!";
  }
}

// ---------- SUCCESS ----------
function reveal() {
  const m = bridge.querySelector(".missing");
  m.classList.remove("missing");
  stylePlank(m, LEVELS[level].a);
}

function walkRobot() {
  const distance = bridge.children.length * 58;
  robot.style.transform = `translateX(${distance}px)`;
  setTimeout(()=>{
    level++;
    if (level >= LEVELS.length) {
      showScreen("win");
      confetti();
    } else {
      startLevel();
    }
  },1500);
}

// ---------- CONFETTI ----------
function confetti() {
  const c = document.getElementById("confetti");
  const ctx = c.getContext("2d");
  c.width = innerWidth;
  c.height = innerHeight;
  const bits = Array.from({length:120},()=>({
    x:Math.random()*c.width,
    y:Math.random()*c.height,
    r:Math.random()*6+4,
    d:Math.random()*3+2
  }));
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    bits.forEach(b=>{
      ctx.beginPath();
      ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
      ctx.fillStyle=`hsl(${Math.random()*360},100%,60%)`;
      ctx.fill();
      b.y+=b.d;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ---------- BUTTONS ----------
startBtn.onclick = ()=>{ level=0; showScreen("game"); startLevel(); };
menuBtn.onclick = resetBtn.onclick = backHome.onclick = ()=>showScreen("home");
howBtn.onclick = ()=>howModal.classList.remove("hidden");
closeHow.onclick = ()=>howModal.classList.add("hidden");
