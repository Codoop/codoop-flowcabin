"use strict";

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#overlay");
const message = document.querySelector("#message");
const startButton = document.querySelector("#start");
const scoreNode = document.querySelector("#score");
const bestNode = document.querySelector("#best");
const keys = new Set();
const player = { x: 210, y: 505, width: 64, height: 12 };
let objects = [];
let score = 0;
let best = Number(localStorage.getItem("star-catcher-best") || 0);
let running = false;
const pauseReasons = new Set();
let frame = 0;
let previous = 0;

bestNode.textContent = String(best);

function reset() {
  objects = [];
  score = 0;
  player.x = canvas.width / 2;
  scoreNode.textContent = "0";
  running = true;
  pauseReasons.delete("user");
  canvas.focus();
  refreshPauseState();
}

function finish() {
  running = false;
  cancelAnimationFrame(frame);
  best = Math.max(best, score);
  localStorage.setItem("star-catcher-best", String(best));
  bestNode.textContent = String(best);
  message.textContent = `Run complete · ${score} caught`;
  startButton.textContent = "Try again";
  overlay.hidden = false;
}

function setPaused(reason, next) {
  if (next) pauseReasons.add(reason);
  else pauseReasons.delete(reason);
  if (next) keys.clear();
  refreshPauseState();
}

function refreshPauseState() {
  if (!running) return;
  if (pauseReasons.size) {
    cancelAnimationFrame(frame);
    const hostPaused = pauseReasons.has("host");
    message.textContent = hostPaused ? "Paused by Flow Cabin" : "Paused";
    startButton.textContent = hostPaused ? "Waiting for Flow Cabin" : "Resume";
    startButton.disabled = hostPaused;
    overlay.hidden = false;
  } else {
    startButton.disabled = false;
    overlay.hidden = true;
    previous = performance.now();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(loop);
  }
}

function spawn() {
  const danger = Math.random() < Math.min(.18 + score / 180, .42);
  objects.push({
    x: 18 + Math.random() * (canvas.width - 36),
    y: -16,
    radius: danger ? 11 : 8,
    speed: 105 + Math.random() * 75 + score * 1.5,
    danger
  });
}

function update(seconds) {
  const direction =
    Number(keys.has("KeyD") || keys.has("ArrowRight")) -
    Number(keys.has("KeyA") || keys.has("ArrowLeft"));
  player.x = Math.max(
    player.width / 2,
    Math.min(canvas.width - player.width / 2, player.x + direction * 260 * seconds)
  );
  if (Math.random() < seconds * 1.55) spawn();
  for (const item of objects) item.y += item.speed * seconds;
  for (const item of objects) {
    const caught =
      item.y + item.radius > player.y &&
      item.y - item.radius < player.y + player.height &&
      Math.abs(item.x - player.x) < player.width / 2 + item.radius;
    if (!caught) continue;
    if (item.danger) {
      finish();
      return;
    }
    item.caught = true;
    score += 1;
    scoreNode.textContent = String(score);
  }
  objects = objects.filter(item => !item.caught && item.y < canvas.height + 30);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#09122b");
  gradient.addColorStop(1, "#17112d");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#25345f";
  for (let x = 20; x < canvas.width; x += 44) context.fillRect(x, 80, 2, 2);
  for (const item of objects) {
    context.beginPath();
    context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    context.fillStyle = item.danger ? "#ff526f" : "#77e7ff";
    context.shadowColor = context.fillStyle;
    context.shadowBlur = 22;
    context.fill();
  }
  context.shadowBlur = 24;
  context.shadowColor = "#f6f1a2";
  context.fillStyle = "#f6f1a2";
  context.fillRect(player.x - player.width / 2, player.y, player.width, player.height);
  context.shadowBlur = 0;
}

function loop(now) {
  if (!running || pauseReasons.size) return;
  update(Math.min((now - previous) / 1000, .04));
  draw();
  previous = now;
  if (running) frame = requestAnimationFrame(loop);
}

window.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }
  keys.add(event.code);
  if (event.code === "Space") {
    setPaused("user", !pauseReasons.has("user"));
  }
  if (event.code === "KeyR") reset();
});
window.addEventListener("keyup", event => keys.delete(event.code));
canvas.addEventListener("pointerdown", event => {
  const bounds = canvas.getBoundingClientRect();
  player.x = (event.clientX - bounds.left) * canvas.width / bounds.width;
  if (!running) reset();
});
canvas.addEventListener("pointermove", event => {
  if (!(event.buttons & 1) || !running) return;
  const bounds = canvas.getBoundingClientRect();
  player.x = (event.clientX - bounds.left) * canvas.width / bounds.width;
});
startButton.addEventListener("click", () => {
  if (pauseReasons.has("user")) setPaused("user", false);
  else reset();
});

const host = window.FlowCabinGame;
const offPause = host?.onPause?.(() => setPaused("host", true));
const offResume = host?.onResume?.(() => setPaused("host", false));
window.addEventListener("beforeunload", () => {
  if (typeof offPause === "function") offPause();
  if (typeof offResume === "function") offResume();
});

draw();
