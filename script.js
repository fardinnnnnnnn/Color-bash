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

/* ---------- Helpers ---------- */
function gameWidth() {
    return game.getBoundingClientRect().width;
}
function gameHeight() {
    return game.getBoundingClientRect().height;
}

/* ---------- Popup ---------- */
const popup = document.createElement("div");
popup.style.position = "absolute";
popup.style.top = "50%";
popup.style.left = "50%";
popup.style.transform = "translate(-50%, -50%)";
popup.style.padding = "30px 50px";
popup.style.background = "rgba(255,77,77,0.9)";
popup.style.color = "#fff";
popup.style.fontSize = "36px";
popup.style.borderRadius = "15px";
popup.style.display = "none";
popup.style.zIndex = "1000";
popup.style.textAlign = "center";
game.appendChild(popup);

let obstacles = [];
let coins = [];

let running = false;
let paused = false;
let score = 0;
let level = 1;
let speed = 2;

let gameInterval, obstacleInterval, coinInterval, levelInterval;

/* ---------- Sound ---------- */
let soundOn = localStorage.getItem("soundOn") !== "false";
updateSoundBtn();

soundBtn.onclick = () => {
    soundOn = !soundOn;
    localStorage.setItem("soundOn", soundOn);
    updateSoundBtn();
};

function updateSoundBtn() {
    soundBtn.innerText = soundOn ? "Sound: ON" : "Sound: OFF";
}

function playSound(freq, dur) {
    if (!soundOn) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
}

/* ---------- Scores ---------- */
function loadScores() {
    recentScoreText.innerText = "Last Score: " + (localStorage.getItem("recentScore") || 0);
    highScoreText.innerText = "High Score: " + (localStorage.getItem("highScore") || 0);
}
loadScores();

/* ---------- Start ---------- */
startBtn.onclick = () => {
    menu.style.display = "none";
    game.style.display = "block";
    startGame();
    playSound(800, 0.1);
};

pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerText = paused ? "Resume" : "Pause";
};

/* ---------- Game ---------- */
function startGame() {
    clearAll();
    score = 0;
    level = 1;
    speed = 2;
    running = true;
    paused = false;
    updateUI();

    player.style.left = gameWidth() / 2 - 25 + "px";

    gameInterval = setInterval(gameLoop, 20);
    obstacleInterval = setInterval(createObstacle, 1500);
    coinInterval = setInterval(createCoin, 1200);
    levelInterval = setInterval(levelUp, 20000);
}

function levelUp() {
    level++;
    speed += 0.5;
    game.style.background = `hsl(${Math.random()*360},40%,20%)`;
    showPopup("Level " + level);
    updateUI();
}

function endGame() {
    running = false;
    clearAll();

    localStorage.setItem("recentScore", score);
    const high = localStorage.getItem("highScore") || 0;
    if (score > high) localStorage.setItem("highScore", score);

    showPopup("Game Over\nScore: " + score, true);
}

function updateUI() {
    scoreText.innerText = "Score: " + score;
    levelText.innerText = "Level: " + level;
}

/* ---------- Objects ---------- */
function createObstacle() {
    if (!running || paused) return;
    const b = document.createElement("div");
    b.className = "block";
    b.style.left = Math.random() * (gameWidth() - 40) + "px";
    b.style.top = "-40px";
    game.appendChild(b);
    obstacles.push(b);
}

function createCoin() {
    if (!running || paused) return;
    const c = document.createElement("div");
    c.className = "coin";
    c.style.left = Math.random() * (gameWidth() - 20) + "px";
    c.style.top = "-20px";
    game.appendChild(c);
    coins.push(c);
}

/* ---------- Loop ---------- */
function gameLoop() {
    if (!running || paused) return;

    obstacles.forEach((o, i) => {
        o.style.top = o.offsetTop + speed + "px";
        if (collision(o)) endGame();
        if (o.offsetTop > gameHeight()) {
            o.remove();
            obstacles.splice(i, 1);
        }
    });

    coins.forEach((c, i) => {
        c.style.top = c.offsetTop + speed + "px";
        if (collision(c)) {
            score += 5;
            playSound(1000, 0.05);
            updateUI();
            c.remove();
            coins.splice(i, 1);
        } else if (c.offsetTop > gameHeight()) {
            score -= level * 3;
            updateUI();
            c.remove();
            coins.splice(i, 1);
            if (score < 0) endGame();
        }
    });
}

function collision(obj) {
    const p = player.getBoundingClientRect();
    const o = obj.getBoundingClientRect();
    return !(p.right < o.left || p.left > o.right || p.bottom < o.top || p.top > o.bottom);
}

/* ---------- Controls ---------- */
document.addEventListener("keydown", e => {
    if (!running || paused) return;
    let x = player.offsetLeft;
    if (e.key === "ArrowLeft") x -= 25;
    if (e.key === "ArrowRight") x += 25;
    x = Math.max(0, Math.min(gameWidth() - 50, x));
    player.style.left = x + "px";
});

let touchX = 0;
document.addEventListener("touchstart", e => touchX = e.touches[0].clientX);
document.addEventListener("touchmove", e => {
    if (!running || paused) return;
    let dx = e.touches[0].clientX - touchX;
    player.style.left = Math.max(0, Math.min(gameWidth() - 50, player.offsetLeft + dx)) + "px";
    touchX = e.touches[0].clientX;
});

/* ---------- Popup ---------- */
function showPopup(text, end=false) {
    popup.innerText = text;
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.display = "none";
        if (end) {
            game.style.display = "none";
            menu.style.display = "flex";
            menu.style.animation = "none";
            menu.offsetHeight;
            menu.style.animation = "fadeIn 0.6s ease";
            loadScores();
        }
    }, 2000);
}

function clearAll() {
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    clearInterval(coinInterval);
    clearInterval(levelInterval);
    obstacles.forEach(o => o.remove());
    coins.forEach(c => c.remove());
    obstacles = [];
    coins = [];
}
