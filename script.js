/* =========================
   ELEMENTS
   ========================= */
const container = document.getElementById("card-container");
const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const progressEl = document.getElementById("progress");
const restartBtn = document.getElementById("restart");

/* =========================
   CONFIG
   ========================= */
const TOTAL = 10;

/* =========================
   STATE
   ========================= */
let cardsData = [];
let liked = [];

let startX = 0;
let currentX = 0;
let dragging = false;
let activeCard = null;

/* =========================
   INIT
   ========================= */
init();

function init() {
  liked = [];
  cardsData = [];

  for (let i = 0; i < TOTAL; i++) {
    cardsData.push(`https://cataas.com/cat?random=${Date.now() + i}`);
  }

  restartBtn.style.display = "none";
  renderCards();
  updateProgress();
}

/* =========================
   RENDER
   ========================= */
function renderCards() {
  container.innerHTML = "";

  const total = cardsData.length;

  cardsData.forEach((src, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const offset = total - index - 1;

    card.style.zIndex = index + 1;
    card.style.transform = `
      translateY(${offset * 6}px)
      scale(${1 - offset * 0.03})
    `;

    const img = document.createElement("img");
    img.src = src;
    img.alt = "Cat";
    img.loading = "eager";
    img.decoding = "async";

    card.appendChild(img);
    container.appendChild(card);
  });
}

/* =========================
   HELPERS
   ========================= */
function getTopCard() {
  const cards = document.querySelectorAll(".card");
  return cards[cards.length - 1] || null;
}

function updateProgress() {
  const viewed = TOTAL - cardsData.length + 1;
  progressEl.textContent = `${Math.min(viewed, TOTAL)} / ${TOTAL}`;
}

/* =========================
   DRAG HANDLERS
   ========================= */
function start(e) {
  const target = e.target.closest(".card");
  if (!target || target !== getTopCard()) return;

  activeCard = target;
  dragging = true;

  startX = e.type === "mousedown"
    ? e.clientX
    : e.touches[0].clientX;

  currentX = startX;
  activeCard.style.transition = "none";
}

function move(e) {
  if (!dragging || !activeCard) return;

  if (e.type === "touchmove") e.preventDefault(); // 🔥 stop scroll

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
  const dx = currentX - startX;
  const threshold = window.innerWidth * 0.25; // 🔥 mobile-friendly

  activeCard.style.transition = "transform 0.3s ease";

  if (dx > threshold) swipe(1);
  else if (dx < -threshold) swipe(-1);
  else activeCard.style.transform = "translateX(0) rotate(0)";
}

/* =========================
   SWIPE LOGIC
   ========================= */
function swipe(direction) {
  const swipedSrc = cardsData[cardsData.length - 1];

  if (direction === 1) liked.push(swipedSrc);

  activeCard.style.transform =
    `translateX(${direction * window.innerWidth}px) rotate(${direction * 25}deg)`;

  setTimeout(() => {
    cardsData.pop();
    activeCard = null;

    if (cardsData.length === 0) {
      showSummary();
    } else {
      renderCards();
      updateProgress();
    }
  }, 300);
}

/* =========================
   SUMMARY
   ========================= */
function showSummary() {
  container.innerHTML = `
    <div class="summary">
      <h2>😻 You liked ${liked.length} cats!</h2>
      <div class="liked-grid">
        ${liked.map(src => `<img src="${src}" />`).join("")}
      </div>
    </div>
  `;

  restartBtn.style.display = "inline-block";
}

/* =========================
   RESTART
   ========================= */
restartBtn.addEventListener("click", init);

/* =========================
   EVENTS (IMPORTANT CHANGE)
   ========================= */
container.addEventListener("touchstart", start, { passive: false });
container.addEventListener("touchmove", move, { passive: false });
container.addEventListener("touchend", end);

document.addEventListener("mousedown", start);
document.addEventListener("mousemove", move);
document.addEventListener("mouseup", end);

/* =========================
   BUTTONS
   ========================= */
likeBtn.addEventListener("click", () => {
  activeCard = getTopCard();
  if (activeCard) swipe(1);
});

dislikeBtn.addEventListener("click", () => {
  activeCard = getTopCard();
  if (activeCard) swipe(-1);
});

/* =========================
   KEYBOARD
   ========================= */
document.addEventListener("keydown", (e) => {
  activeCard = getTopCard();
  if (!activeCard) return;

  if (e.key === "ArrowRight") swipe(1);
  if (e.key === "ArrowLeft") swipe(-1);
});
