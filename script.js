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

/* ---------- FULLSCREEN (LEGAL WAY) ---------- */
function forceFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

/* ---------- CLICK SOUND (GENERATED) ---------- */
let soundOn = true;

function clickSound() {
    if (!soundOn) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = 1200;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
}

/* ---------- SOUND TOGGLE ---------- */
soundBtn.onclick = () => {
    soundOn = !soundOn;
    soundBtn.innerText = soundOn ? "Sound: ON" : "Sound: OFF";
};

/* ---------- START GAME ---------- */
startBtn.onclick = () => {
    clickSound();
    forceFullscreen();             // USER TAP = ALLOWED
    setTimeout(() => window.scrollTo(0, 1), 100); // hide address bar

    menu.style.display = "none";
    game.style.display = "block";
};

/* ---------- PAUSE ---------- */
let paused = false;
pauseBtn.onclick = () => {
    paused = !paused;
    pauseBtn.innerText = paused ? "Resume" : "Pause";
};

/* ---------- BASIC SCORE LOAD ---------- */
function loadScores() {
    highScoreText.innerText =
        "High Score: " + (localStorage.getItem("highScore") || 0);
    recentScoreText.innerText =
        "Last Score: " + (localStorage.getItem("recentScore") || 0);
}
loadScores();
