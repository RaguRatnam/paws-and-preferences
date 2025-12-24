const container = document.getElementById("card-container");
const progressEl = document.getElementById("progress");

const TOTAL = 10;
const SWIPE_THRESHOLD = () => window.innerWidth * 0.25;

let cards = [];
let liked = [];

let startX = 0;
let startY = 0;
let currentX = 0;
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

    card.innerHTML = `
      <img src="${src}">
      <div class="swipe-emoji swipe-like">❤️</div>
      <div class="swipe-emoji swipe-nope">❌</div>
    `;

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

  activeCard = topCard();
  if (!activeCard) return;

  dragging = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  currentX = startX;

  activeCard.style.transition = "none";
}, { passive: true });

/* TOUCH MOVE */
container.addEventListener("touchmove", e => {
  if (!dragging || !activeCard) return;

  currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;

  const dx = currentX - startX;
  const dy = currentY - startY;

  // Vertical gesture → allow scroll
  if (Math.abs(dy) > Math.abs(dx)) return;

  e.preventDefault();

  const likeEmoji = activeCard.querySelector(".swipe-like");
  const nopeEmoji = activeCard.querySelector(".swipe-nope");

  const strength = Math.min(Math.abs(dx) / 120, 1);

  likeEmoji.style.opacity = dx > 0 ? strength : 0;
  nopeEmoji.style.opacity = dx < 0 ? strength : 0;

  activeCard.style.transform =
    `translateX(${dx}px) rotate(${dx * 0.06}deg)`;
}, { passive: false });

/* TOUCH END */
container.addEventListener("touchend", () => {
  if (!dragging || !activeCard) return;

  dragging = false;

  const dx = currentX - startX;
  const threshold = SWIPE_THRESHOLD();

  if (dx > threshold) swipe(1);
  else if (dx < -threshold) swipe(-1);
  else resetCard();
});

/* RESET CARD */
function resetCard() {
  activeCard.style.transition = "transform 0.25s ease";
  activeCard.style.transform = "translateX(0) rotate(0)";
  activeCard.querySelector(".swipe-like").style.opacity = 0;
  activeCard.querySelector(".swipe-nope").style.opacity = 0;
}

/* COMPLETE SWIPE */
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
      <h2>😻 You liked ${liked.length} cats</h2>
      <div class="liked-grid">
        ${liked.map(src => `<img src="${src}">`).join("")}
      </div>
      <button class="restart-btn" onclick="init()">Restart</button>
    </div>
  `;
}
