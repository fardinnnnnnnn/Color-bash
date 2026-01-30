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

// Click sound
const clickSound = new Audio("click.mp3");

// Level Up / Game Over popup
const popup = document.createElement("div");
popup.style.position = "absolute";
popup.style.top = "50%";
popup.style.left = "50%";
popup.style.transform = "translate(-50%, -50%)";
popup.style.padding = "30px 50px";
popup.style.background = "rgba(255,77,77,0.9)";
popup.style.color = "#fff";
popup.style.fontSize = "40px";
popup.style.fontWeight = "bold";
popup.style.borderRadius = "15px";
popup.style.textAlign = "center";
popup.style.display = "none";
popup.style.zIndex = "1000";
game.appendChild(popup);

let obstacles = [];
let coins = [];

let gameInterval, obstacleInterval, coinInterval, levelInterval;
let running = false;
let paused = false;

let score = 0;
let level = 1;
let speed = 2;

// Sound
let soundOn = true;
const savedSound = localStorage.getItem("soundOn");
if (savedSound !== null) soundOn = savedSound === "true";
updateSoundButton();

soundBtn.onclick = () => {
    soundOn = !soundOn;
    localStorage.setItem("soundOn", soundOn);
    updateSoundButton();
};

function updateSoundButton() {
    if (soundBtn) {
        soundBtn.innerText = soundOn ? "Sound: ON" : "Sound: OFF";
    }
}

// Load scores
function loadScores() {
    const high = localStorage.getItem("highScore") || 0;
    const recent = localStorage.getItem("recentScore") || 0;
    highScoreText.innerText = "High Score: " + high;
    recentScoreText.innerText = "Last Score: " + recent;
}
loadScores();

// Start button (ONLY CHANGE HERE: click sound added)
startBtn.onclick = () => {
    playClickSound();   // <-- click sound here
    menu.style.display = "none";
    game.style.display = "block";
    startGame();
};


// Pause / Resume
pauseBtn.onclick = () => {
    if (!running) return;
    paused = !paused;
    pauseBtn.innerText = paused ? "Resume" : "Pause";
};

// Start game
function startGame() {
    clearAll();
    score = 0; level = 1; speed = 2;
    running = true; paused = false;
    player.style.left = "175px";
    game.style.background = "#222";
    updateUI();

    gameInterval = setInterval(gameLoop, 20);
    obstacleInterval = setInterval(createObstacle, 1500);
    coinInterval = setInterval(createCoin, 1200);
    levelInterval = setInterval(levelUp, 20000);
}

// Level up
function levelUp() {
    if (!running) return;
    level++;
    speed += 0.5;

    const r = Math.floor(Math.random() * 200 + 30);
    const g = Math.floor(Math.random() * 200 + 30);
    const b = Math.floor(Math.random() * 200 + 30);
    game.style.background = `rgb(${r},${g},${b})`;

    showPopup(`Level ${level}`);
    playSound(600, 0.2);

    updateUI();
}

// Update UI
function updateUI() {
    scoreText.innerText = "Score: " + score;
    levelText.innerText = "Level: " + level;
}

// Game over
function endGame() {
    running = false; paused = false;
    clearAll();

    localStorage.setItem("recentScore", score);
    const high = localStorage.getItem("highScore") || 0;
    if (score > high) localStorage.setItem("highScore", score);
    loadScores();

    showPopup(`Game Over!\nScore: ${score}`, true);
    playSound(200, 0.5);
}

// Clear all
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

// Player movement keys
document.addEventListener("keydown", e => {
    if (!running || paused) return;
    let left = parseFloat(player.style.left);
    if (e.key === "ArrowLeft") left -= 20;
    if (e.key === "ArrowRight") left += 20;
    if (left < 0) left = 0;
    if (left > 350) left = 350;
    player.style.left = left + "px";
});

// Swipe controls
let touchStartX = 0;
document.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
});
document.addEventListener("touchmove", e => {
    if (!running || paused) return;
    const touchX = e.touches[0].clientX;
    let diff = touchX - touchStartX;
    let left = parseFloat(player.style.left) + diff;
    if (left < 0) left = 0;
    if (left > 350) left = 350;
    player.style.left = left + "px";
    touchStartX = touchX;
});

// Main loop
function gameLoop() {
    if (!running || paused) return;
    moveObstacles();
    moveCoins();
}

// Create block
function createObstacle() {
    if (!running || paused) return;

    const block = document.createElement("div");
    block.className = "block";

    let left = Math.random() * 300;
    while (coins.some(c => Math.abs(parseFloat(c.style.left) - left) < 40)) {
        left = Math.random() * 300;
    }
    block.style.left = left + "px";
    block.style.top = "-30px";

    game.appendChild(block);
    obstacles.push(block);
}

// Create coin
function createCoin() {
    if (!running || paused) return;

    const coin = document.createElement("div");
    coin.className = "coin";

    let left = Math.random() * 380;
    while (obstacles.some(o => Math.abs(parseFloat(o.style.left) - left) < 50)) {
        left = Math.random() * 380;
    }
    coin.style.left = left + "px";
    coin.style.top = "-20px";

    game.appendChild(coin);
    coins.push(coin);
}

// Move blocks
function moveObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        let top = parseFloat(obs.style.top) + speed;
        obs.style.top = top + "px";

        const obsLeft = parseFloat(obs.style.left);
        const obsRight = obsLeft + obs.offsetWidth;
        const obsBottom = top + obs.offsetHeight;

        const pLeft = parseFloat(player.style.left);
        const pRight = pLeft + player.offsetWidth;
        const pTop = player.offsetTop;
        const pBottom = pTop + player.offsetHeight;

        if (pRight > obsLeft && pLeft < obsRight && pBottom > top && pTop < obsBottom) {
            endGame();
            return;
        }
        if (top > game.offsetHeight) {
            obs.remove();
            obstacles.splice(i, 1);
        }
    }
}

// Move coins
function moveCoins() {
    const coinPenalty = level * 3;

    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        let top = parseFloat(coin.style.top) + speed;
        coin.style.top = top + "px";

        const cLeft = parseFloat(coin.style.left);
        const cRight = cLeft + coin.offsetWidth;
        const cBottom = top + coin.offsetHeight;

        const pLeft = parseFloat(player.style.left);
        const pRight = pLeft + player.offsetWidth;
        const pTop = player.offsetTop;
        const pBottom = pTop + player.offsetHeight;

        if (pRight > cLeft && pLeft < cRight && pBottom > top && pTop < cBottom) {
            score += 5;
            updateUI();
            playSound(1000, 0.1);
            coin.remove();
            coins.splice(i, 1);
            continue;
        }

        if (top > game.offsetHeight) {
            score -= coinPenalty;
            updateUI();
            coin.remove();
            coins.splice(i, 1);

            if (score < 0) endGame();
        }
    }
}

// Show popup
function showPopup(text, isGameOver=false) {
    popup.innerText = text;
    popup.style.display = "block";
    setTimeout(() => {
        popup.style.display = "none";
        if (isGameOver) {
            game.style.display = "none";
            menu.style.display = "flex";
        }
    }, 2000);
}

// Simple generated sound
function playSound(frequency, duration) {
    if (!soundOn) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playClickSound() {
    if (!soundOn) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";       // more "clicky"
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // high pitch
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05); // very short = click
}
