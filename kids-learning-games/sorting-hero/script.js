const screens = {
  home: document.getElementById("home"),
  game: document.getElementById("game"),
  win: document.getElementById("win")
};

const itemEl = document.getElementById("item");
const binA = document.getElementById("binA");
const binB = document.getElementById("binB");
const ruleText = document.getElementById("ruleText");
const feedback = document.getElementById("feedback");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const menuBtn = document.getElementById("menuBtn");
const restartBtn = document.getElementById("restartBtn");

let round = 0;
let score = 0;
let currentRule;
let currentItem;
let dragging = false;
let offsetX, offsetY;

/* ---------- RULE SETS ---------- */
const rules = [
  {
    label: "SORT BY COLOR",
    bins: ["Red", "Blue"],
    check: item => item.color
  },
  {
    label: "SORT: ANIMAL or BIRD",
    bins: ["Animal", "Bird"],
    check: item => item.type
  },
  {
    label: "SORT: DOMESTIC or WILD",
    bins: ["Domestic", "Wild"],
    check: item => item.habitat
  },
  {
    label: "SORT: SWIMMER or FLIER",
    bins: ["Swimmer", "Flier"],
    check: item => item.ability
  }
];

const items = [
  { emoji: "🐶", type: "Animal", habitat: "Domestic", ability: "Walker", color: "Red" },
  { emoji: "🐱", type: "Animal", habitat: "Domestic", ability: "Walker", color: "Blue" },
  { emoji: "🦁", type: "Animal", habitat: "Wild", ability: "Walker", color: "Red" },
  { emoji: "🐦", type: "Bird", habitat: "Wild", ability: "Flier", color: "Blue" },
  { emoji: "🐟", type: "Animal", habitat: "Wild", ability: "Swimmer", color: "Red" }
];

/* ---------- SCREEN CONTROL ---------- */
function show(screen) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[screen].classList.add("active");
}

/* ---------- ROUND SETUP ---------- */
function nextRound() {
  round++;
  if (round > 10) return show("win");

  currentRule = rules[round % rules.length];
  currentItem = items[Math.floor(Math.random() * items.length)];

  ruleText.textContent = currentRule.label;
  binA.textContent = currentRule.bins[0];
  binB.textContent = currentRule.bins[1];

  itemEl.textContent = currentItem.emoji;
  itemEl.style.background = currentItem.color.toLowerCase();
  itemEl.style.left = "50%";
  itemEl.style.top = "40%";
}

/* ---------- DRAG ---------- */
itemEl.addEventListener("pointerdown", e => {
  dragging = true;
  offsetX = e.clientX - itemEl.offsetLeft;
  offsetY = e.clientY - itemEl.offsetTop;
  itemEl.classList.add("dragging");
});

window.addEventListener("pointermove", e => {
  if (!dragging) return;
  itemEl.style.left = `${e.clientX - offsetX}px`;
  itemEl.style.top = `${e.clientY - offsetY}px`;
});

window.addEventListener("pointerup", e => {
  if (!dragging) return;
  dragging = false;
  itemEl.classList.remove("dragging");

  const drop = [binA, binB].find(bin => {
    const r = bin.getBoundingClientRect();
    return e.clientX > r.left && e.clientX < r.right &&
           e.clientY > r.top && e.clientY < r.bottom;
  });

  if (!drop) return fail();

  const value = currentRule.check(currentItem);
  const correct = drop.textContent === value;

  correct ? success() : fail();
});

/* ---------- FEEDBACK ---------- */
function success() {
  feedback.textContent = "✅";
  score++;
  setTimeout(() => {
    feedback.textContent = "";
    nextRound();
  }, 600);
}

function fail() {
  feedback.textContent = "❌";
  itemEl.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-10px)" }, { transform: "translateX(10px)" }, { transform: "translateX(0)" }],
    { duration: 300 }
  );
  setTimeout(() => feedback.textContent = "", 600);
}

/* ---------- BUTTONS ---------- */
startBtn.onclick = () => { show("game"); round = 0; nextRound(); };
resetBtn.onclick = () => nextRound();
menuBtn.onclick = () => show("home");
restartBtn.onclick = () => show("home");
