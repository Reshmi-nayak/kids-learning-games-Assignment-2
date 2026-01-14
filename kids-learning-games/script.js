const cards = document.querySelectorAll(".card");
const container = document.getElementById("gameContainer");
const frame = document.getElementById("gameFrame");
const exitBtn = document.getElementById("exitBtn");

cards.forEach(card => {
  card.addEventListener("click", () => {
    const game = card.dataset.game;
    loadGame(game);
  });
});

function loadGame(folder) {
  try {
    frame.src = `${folder}/index.html`;
    container.classList.remove("hidden");
  } catch (e) {
    alert("Game failed to load.");
  }
}

exitBtn.onclick = () => {
  frame.src = "";
  container.classList.add("hidden");
};
