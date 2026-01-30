// FULLSCREEN ON MOBILE (SAFE)
function goFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const soundBtn = document.getElementById("soundBtn");
const recentScoreText = document.getElementById("recentScore");
const highScoreText = document.getElementById("highScore");

const game = document.getElementById("game");
const player = document.getElementById("player");

const scoreText = document.getElementById("scoreText");
const levelText = document.getElementById("levelText");
const pauseBtn = document.getElementById("pauseBtn");

/* ---------- YOUR EXISTING GAME CODE ---------- */
/* (Everything below is exactly same behavior) */

let obstacles = [];
let coins = [];

let gameInterval, obstacleInterval, coinInterval, levelInterval;
let running = false;
let paused = false;

let score = 0;
let level = 1;
let speed = 2;

/* SOUND */
let soundOn = true;
const savedSound = localStorage.getItem("soundOn");
if (savedSound !== null) soundOn = savedSound === "true";

soundBtn.innerText = soundOn ? "Sound: ON" : "Sound: OFF";

soundBtn.onclick = () => {
    soundOn = !soundOn;
    localStorage.setItem("soundOn", soundOn);
    soundBtn.innerText = soundOn ? "Sound: ON" : "Sound: OFF";
};

/* LOAD SCORES */
function loadScores() {
    highScoreText.innerText = "High Score: " + (localStorage.getItem("highScore") || 0);
    recentScoreText.innerText = "Last Score: " + (localStorage.getItem("recentScore") || 0);
}
loadScores();

/* START GAME */
startBtn.onclick = () => {
    goFullscreen();       // ✅ ONLY ADDITION
    menu.style.display = "none";
    game.style.display = "block";
    startGame();
};

/* PAUSE */
pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerText = paused ? "Resume" : "Pause";
};

function startGame() {
    clearAll();
    score = 0;
    level = 1;
    speed = 2;
    running = true;
    paused = false;

    updateUI();

    gameInterval = setInterval(gameLoop, 20);
    obstacleInterval = setInterval(createObstacle, 1500);
    coinInterval = setInterval(createCoin, 1200);
    levelInterval = setInterval(levelUp, 20000);
}

function updateUI() {
    scoreText.innerText = "Score: " + score;
    levelText.innerText = "Level: " + level;
}

/* KEY + SWIPE CONTROLS */
document.addEventListener("keydown", e => {
    if (!running || paused) return;
    let x = player.offsetLeft;
    if (e.key === "ArrowLeft") x -= 20;
    if (e.key === "ArrowRight") x += 20;
    player.style.left = Math.max(0, Math.min(x, game.clientWidth - 50)) + "px";
});

let touchX = 0;
document.addEventListener("touchstart", e => touchX = e.touches[0].clientX);
document.addEventListener("touchmove", e => {
    if (!running || paused) return;
    let dx = e.touches[0].clientX - touchX;
    player.style.left = Math.max(0, Math.min(player.offsetLeft + dx, game.clientWidth - 50)) + "px";
    touchX = e.touches[0].clientX;
});

/* LOOP */
function gameLoop() {
    if (!running || paused) return;
    moveObstacles();
    moveCoins();
}

/* OBJECTS */
function createObstacle() {
    const o = document.createElement("div");
    o.className = "block";
    o.style.left = Math.random() * (game.clientWidth - 50) + "px";
    o.style.top = "-50px";
    game.appendChild(o);
    obstacles.push(o);
}

function createCoin() {
    const c = document.createElement("div");
    c.className = "coin";
    c.style.left = Math.random() * (game.clientWidth - 20) + "px";
    c.style.top = "-20px";
    game.appendChild(c);
    coins.push(c);
}

function moveObstacles() {
    obstacles.forEach((o, i) => {
        o.style.top = o.offsetTop + speed + "px";
        if (o.offsetTop > game.clientHeight) {
            o.remove();
            obstacles.splice(i, 1);
        }
    });
}

function moveCoins() {
    coins.forEach((c, i) => {
        c.style.top = c.offsetTop + speed + "px";
        if (c.offsetTop > game.clientHeight) {
            c.remove();
            coins.splice(i, 1);
        }
    });
}

function levelUp() {
    level++;
    speed += 0.5;
    updateUI();
}

function clearAll() {
    obstacles.forEach(o => o.remove());
    coins.forEach(c => c.remove());
    obstacles = [];
    coins = [];
}
