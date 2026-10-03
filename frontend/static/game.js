const API = window.API_URL + "/api/scores";
const N = 20, C = 24;
const cv = document.getElementById("board"), ctx = cv.getContext("2d");
const form = document.getElementById("submit");
const list = document.getElementById("board-list");
const statusEl = document.getElementById("status");
const nameInput = document.getElementById("player");
const KEYS = { ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1],
               ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0] };

let snake, dir, queued, food, score, over, waiting, timer, lastId = null;

function spawn() {
  for (;;) {
    const c = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)];
    if (!snake.some(s => s[0] === c[0] && s[1] === c[1])) return c;
  }
}

function reset() {
  clearTimeout(timer);
  snake = [[10,10],[9,10],[8,10]];
  dir = queued = [1,0];
  score = 0; over = false; waiting = true; lastId = null;
  food = spawn();
  form.hidden = true;
  draw();
}

function tick() {
  if (over) return;
  dir = queued;
  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
  const eats = head[0] === food[0] && head[1] === food[1];
  const body = eats ? snake : snake.slice(0, -1);
  if (head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N ||
      body.some(s => s[0] === head[0] && s[1] === head[1])) return gameOver();
  snake.unshift(head);
  if (eats) { score += 10; food = spawn(); } else snake.pop();
  draw();
  timer = setTimeout(tick, Math.max(55, 130 - snake.length * 3));
}

function gameOver() {
  over = true;
  draw();
  document.getElementById("final").textContent = "Score " + score;
  nameInput.value = localStorage.getItem("player") || "";
  form.hidden = false;
  nameInput.focus();
}

function draw() {
  ctx.fillStyle = "#0b1512"; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = "#e0524d";
  ctx.beginPath(); ctx.arc(food[0]*C + C/2, food[1]*C + C/2, C/2 - 3, 0, 7); ctx.fill();
  snake.forEach((s, i) => {
    ctx.fillStyle = i ? "#4fb286" : "#b8f2d4";
    ctx.fillRect(s[0]*C + 1, s[1]*C + 1, C - 2, C - 2);
  });
  ctx.fillStyle = "#7fa393"; ctx.font = "14px sans-serif";
  ctx.fillText("Score " + score, 8, 18);
}

async function loadBoard() {
  try {
    const res = await fetch(API);
    const rows = await res.json();
    list.innerHTML = "";
    rows.forEach(r => {
      const li = document.createElement("li");
      if (r.id === lastId) li.className = "me";
      li.textContent = r.player;
      const b = document.createElement("b"); b.textContent = r.score;
      li.append(b); list.append(li);
    });
    statusEl.textContent = rows.length ? "" : "No scores yet. Be the first.";
  } catch (e) {
    statusEl.textContent = "Can't reach the API. Is the backend container running?";
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const player = nameInput.value.trim();
  localStorage.setItem("player", player);
  try {
    const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" },
                                   body: JSON.stringify({ player, score }) });
    if (!res.ok) throw new Error();
    const saved = await res.json();
    lastId = saved.id;
    statusEl.textContent = "Saved. You ranked #" + saved.rank + ".";
    form.hidden = true;
    loadBoard();
  } catch (err) {
    statusEl.textContent = "Couldn't save your score. Try again.";
  }
};

document.getElementById("again").onclick = reset;

document.addEventListener("keydown", (e) => {
  if (e.target === nameInput || !KEYS[e.key]) return;
  e.preventDefault();
  const k = KEYS[e.key];
  if (k[0] === -dir[0] && k[1] === -dir[1]) return;
  queued = k;
  if (waiting && !over) { waiting = false; tick(); }
});

reset();
loadBoard();
