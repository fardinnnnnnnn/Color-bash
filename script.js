const menu = document.getElementById("menu");
const game = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const soundBtn = document.getElementById("soundBtn");
const pauseBtn = document.getElementById("pauseBtn");

const player = document.getElementById("player");
const scoreText = document.getElementById("scoreText");
const levelText = document.getElementById("levelText");
const recentScoreText = document.getElementById("recentScore");
const highScoreText = document.getElementById("highScore");

/* ---------- State ---------- */
let obstacles = [];
let coins = [];
let score = 0;
let level = 1;
let speed = 2;
let running = false;
let paused = false;

/* ---------- Timers ---------- */
let gameLoopId, obstacleId, coinId, levelId;

/* ---------- Helpers ---------- */
const gw = () => game.clientWidth;
const gh = () => game.clientHeight;

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
    menu.classList.replace("show", "hide");
    game.classList.replace("hide", "show");
    startGame();
    playSound(800, 0.1);
};

pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerText = paused ? "Resume" : "Pause";
};

/* ---------- Game ---------- */
function startGame() {
    clearGame();
    score = 0;
    level = 1;
    speed = 2;
    running = true;
    paused = false;

    player.style.left = gw() / 2 - 25 + "px";
    updateUI();

    gameLoopId = setInterval(gameLoop, 20);
    obstacleId = setInterval(spawnObstacle, 1400);
    coinId = setInterval(spawnCoin, 1100);
    levelId = setInterval(levelUp, 20000);
}

function levelUp() {
    level++;
    speed += 0.5;
    game.style.background = `hsl(${Math.random() * 360},40%,20%)`;
    updateUI();
}

function endGame() {
    running = false;
    clearGame();

    localStorage.setItem("recentScore", score);
    const high = localStorage.getItem("highScore") || 0;
    if (score > high) localStorage.setItem("highScore", score);

    setTimeout(() => {
        game.classList.replace("show", "hide");
        menu.classList.replace("hide", "show");
        menu.style.animation = "none";
        menu.offsetHeight;
        menu.style.animation = "menuFade 0.6s ease";
        loadScores();
    }, 300);
}

function updateUI() {
    scoreText.innerText = "Score: " + score;
    levelText.innerText = "Level: " + level;
}

/* ---------- Objects ---------- */
function spawnObstacle() {
    if (!running || paused) return;
    const b = document.createElement("div");
    b.className = "block";
    b.style.left = Math.random() * (gw() - 40) + "px";
    b.style.top = "-40px";
    game.appendChild(b);
    obstacles.push(b);
}

function spawnCoin() {
    if (!running || paused) return;
    const c = document.createElement("div");
    c.className = "coin";
    c.style.left = Math.random() * (gw() - 20) + "px";
    c.style.top = "-20px";
    game.appendChild(c);
    coins.push(c);
}

/* ---------- Loop ---------- */
function gameLoop() {
    if (!running || paused) return;

    obstacles.forEach((o, i) => {
        o.style.top = o.offsetTop + speed + "px";
        if (hit(o)) endGame();
        if (o.offsetTop > gh()) {
            o.remove();
            obstacles.splice(i, 1);
        }
    });

    coins.forEach((c, i) => {
        c.style.top = c.offsetTop + speed + "px";
        if (hit(c)) {
            score += 5;
            playSound(1000, 0.05);
            updateUI();
            c.remove();
            coins.splice(i, 1);
        } else if (c.offsetTop > gh()) {
            score -= level * 3;
            updateUI();
            c.remove();
            coins.splice(i, 1);
            if (score < 0) endGame();
        }
    });
}

function hit(el) {
    const a = player.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

/* ---------- Controls ---------- */
document.addEventListener("keydown", e => {
    if (!running || paused) return;
    let x = player.offsetLeft;
    if (e.key === "ArrowLeft") x -= 25;
    if (e.key === "ArrowRight") x += 25;
    player.style.left = Math.max(0, Math.min(gw() - 50, x)) + "px";
});

let touchX = 0;
document.addEventListener("touchstart", e => touchX = e.touches[0].clientX);
document.addEventListener("touchmove", e => {
    if (!running || paused) return;
    let dx = e.touches[0].clientX - touchX;
    player.style.left = Math.max(0, Math.min(gw() - 50, player.offsetLeft + dx)) + "px";
    touchX = e.touches[0].clientX;
});

/* ---------- Cleanup ---------- */
function clearGame() {
    clearInterval(gameLoopId);
    clearInterval(obstacleId);
    clearInterval(coinId);
    clearInterval(levelId);
    obstacles.forEach(o => o.remove());
    coins.forEach(c => c.remove());
    obstacles = [];
    coins = [];
}
