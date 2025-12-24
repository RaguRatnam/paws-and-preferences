const container = document.getElementById("card-container");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const progressEl = document.getElementById("progress");

const TOTAL = 10;

let cards = [];
let liked = [];
let startX = 0;
let startY = 0;
let dragging = false;
let activeCard = null;
let isSummary = false;

/* INIT */
init();

function init() {
  cards = [];
  liked = [];
  isSummary = false;

  for (let i = 0; i < TOTAL; i++) {
    cards.push(`https://cataas.com/cat?random=${Date.now() + i}`);
  }

  render();
  updateProgress();
}

/* RENDER */
function render() {
  container.innerHTML = "";

  cards.forEach((src, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.zIndex = i + 1;

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
  const viewed = TOTAL - cards.length + 1;
  progressEl.textContent = `${Math.min(viewed, TOTAL)} / ${TOTAL}`;
}

/* TOUCH START */
container.addEventListener("touchstart", e => {
  if (isSummary) return;

  const card = topCard();
  if (!card) return;

  activeCard = card;
  dragging = true;

  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;

  card.style.transition = "none";
}, { passive: true });

/* TOUCH MOVE */
container.addEventListener("touchmove", e => {
  if (!dragging || !activeCard || isSummary) return;

  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;

  // Vertical scroll → allow browser
  if (Math.abs(dy) > Math.abs(dx)) return;

  // Horizontal swipe → block scroll
  e.preventDefault();

  activeCard.style.transform =
    `translateX(${dx}px) rotate(${dx * 0.07}deg)`;
}, { passive: false });

/* TOUCH END */
container.addEventListener("touchend", () => {
  if (!dragging || !activeCard) return;

  dragging = false;

  const rect = activeCard.getBoundingClientRect();
  const dx = rect.left - (window.innerWidth / 2 - rect.width / 2);
  const threshold = window.innerWidth * 0.25;

  if (dx > threshold) swipe(1);
  else if (dx < -threshold) swipe(-1);
  else {
    activeCard.style.transition = "transform 0.25s ease";
    activeCard.style.transform = "translateX(0)";
  }
});

/* SWIPE */
function swipe(dir) {
  if (dir === 1) liked.push(cards[cards.length - 1]);

  activeCard.style.transition = "transform 0.3s ease";
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
  isSummary = true;

  container.innerHTML = `
    <div class="summary">
      <h2>😻 You liked ${liked.length} cats!</h2>
      <div class="liked-grid">
        ${liked.map(src => `<img src="${src}">`).join("")}
      </div>
      <button class="restart-btn" id="restart">🔄 Restart</button>
    </div>
  `;

  document.getElementById("restart").onclick = init;
}

/* BUTTONS */
likeBtn.onclick = () => swipe(1);
dislikeBtn.onclick = () => swipe(-1);
