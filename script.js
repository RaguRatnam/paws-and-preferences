const container = document.getElementById("card-container");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const progressEl = document.getElementById("progress");
const restartBtn = document.getElementById("restart");

const TOTAL = 10;

let cards = [];
let liked = [];
let startX = 0;
let currentX = 0;
let dragging = false;
let activeCard = null;

/* INIT */
init();

function init() {
  cards = [];
  liked = [];

  for (let i = 0; i < TOTAL; i++) {
    cards.push(`https://cataas.com/cat?random=${Date.now() + i}`);
  }

  restartBtn.style.display = "none";
  render();
  updateProgress();
}

/* RENDER */
function render() {
  container.innerHTML = "";

  cards.forEach((src, i) => {
    const card = document.createElement("div");
    card.className = "card";

    const offset = cards.length - i - 1;
    card.style.zIndex = i + 1;
    card.style.transform = `
      translateY(${offset * 6}px)
      scale(${1 - offset * 0.03})
    `;

    const img = document.createElement("img");
    img.src = src;

    card.appendChild(img);
    container.appendChild(card);
  });
}

/* HELPERS */
function topCard() {
  return container.lastElementChild;
}

function updateProgress() {
  progressEl.textContent = `${TOTAL - cards.length + 1} / ${TOTAL}`;
}

/* TOUCH + MOUSE */
function start(e) {
  const target = e.target.closest(".card");
  if (!target || target !== topCard()) return;

  activeCard = target;
  dragging = true;
  document.body.style.overflow = "hidden";

  startX = e.type === "mousedown"
    ? e.clientX
    : e.touches[0].clientX;

  currentX = startX;
  activeCard.style.transition = "none";
}

function move(e) {
  if (!dragging || !activeCard) return;
  e.preventDefault();

  currentX = e.type === "mousemove"
    ? e.clientX
    : e.touches[0].clientX;

  const dx = currentX - startX;
  activeCard.style.transform =
    `translateX(${dx}px) rotate(${dx * 0.07}deg)`;
}

function end() {
  if (!dragging || !activeCard) return;

  dragging = false;
  document.body.style.overflow = "";

  const dx = currentX - startX;
  const threshold = window.innerWidth * 0.25;

  activeCard.style.transition = "transform 0.3s ease";

  if (dx > threshold) swipe(1);
  else if (dx < -threshold) swipe(-1);
  else activeCard.style.transform = "translateX(0)";
}

/* SWIPE */
function swipe(dir) {
  if (dir === 1) liked.push(cards[cards.length - 1]);

  activeCard.style.transform =
    `translateX(${dir * window.innerWidth}px) rotate(${dir * 25}deg)`;

  setTimeout(() => {
    cards.pop();
    activeCard = null;

    if (cards.length === 0) showSummary();
    else {
      render();
      updateProgress();
    }
  }, 300);
}

/* SUMMARY */
function showSummary() {
  container.innerHTML = `
    <div class="summary">
      <h2>😻 You liked ${liked.length} cats!</h2>
      <div class="liked-grid">
        ${liked.map(src => `<img src="${src}">`).join("")}
      </div>
    </div>
  `;
  restartBtn.style.display = "block";
}

/* EVENTS */
container.addEventListener("touchstart", start, { passive: false });
container.addEventListener("touchmove", move, { passive: false });
container.addEventListener("touchend", end);

document.addEventListener("mousedown", start);
document.addEventListener("mousemove", move);
document.addEventListener("mouseup", end);

/* BUTTONS */
likeBtn.onclick = () => activeCard && swipe(1);
dislikeBtn.onclick = () => activeCard && swipe(-1);
restartBtn.onclick = init;
