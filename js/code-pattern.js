// code-pattern.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDisplay = document.getElementById("statusDisplay");

const GRID = 6;
const TILE = canvas.width / GRID;

let pattern = [];
let playerInput = [];
let stage = 1;
let timeLeft = 12;
let lastTime = performance.now();
let scrambleNoise = [];
let gameOver = false;

// Generate random pattern
function generatePattern(length) {
    const arr = [];
    for (let i = 0; i < length; i++) {
        arr.push(Math.floor(Math.random() * GRID * GRID));
    }
    return arr;
}

// Generate visual noise
function generateNoise() {
    scrambleNoise = [];
    for (let i = 0; i < 40; i++) {
        scrambleNoise.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 8 + 2,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1
        });
    }
}

// Reset game
function resetGame() {
    stage = 1;
    timeLeft = 12;
    gameOver = false;
    pattern = generatePattern(3);
    playerInput = [];
    generateNoise();
    draw();
}

// Convert tile index to x,y
function indexToXY(index) {
    const x = index % GRID;
    const y = Math.floor(index / GRID);
    return { x, y };
}

// Handle click
canvas.addEventListener("click", e => {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE);
    const y = Math.floor((e.clientY - rect.top) / TILE);

    const index = y * GRID + x;
    playerInput.push(index);

    if (playerInput.length === pattern.length) {
        checkPattern();
    }

    draw();
});

// Check correctness
function checkPattern() {
    let correct = true;
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== playerInput[i]) {
            correct = false;
            break;
        }
    }

    if (correct) {
        stage++;
        timeLeft = Math.max(6, 14 - stage * 1.2);
        pattern = generatePattern(3 + stage);
        playerInput = [];
        generateNoise();
        statusDisplay.textContent = `Stage ${stage} — Correct!`;
    } else {
        statusDisplay.textContent = "Wrong pattern! Resetting...";
        setTimeout(resetGame, 1000);
    }
}

// Update timer
function updateTimer() {
    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    timeLeft -= delta;
    if (timeLeft <= 0) {
        timeLeft = 0;
        gameOver = true;
        statusDisplay.textContent = "Time’s up! Game Over.";
    }
}

// Update noise
function updateNoise() {
    scrambleNoise.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });
}

// Draw everything
function draw() {
    ctx.fillStyle = "#0a0a16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            ctx.strokeStyle = "#222";
            ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
        }
    }

    // Draw pattern (flashes)
    pattern.forEach((index, i) => {
        const { x, y } = indexToXY(index);
        ctx.fillStyle = `rgba(0, 255, 255, ${0.25 + Math.sin((i + performance.now() / 200) * 0.5) * 0.25})`;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    });

    // Draw player input
    playerInput.forEach(index => {
        const { x, y } = indexToXY(index);
        ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    });

    // Draw noise
    scrambleNoise.forEach(n => {
        ctx.fillStyle = "rgba(255, 0, 100, 0.25)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // Timer
    ctx.fillStyle = "#00eaff";
    ctx.font = "24px Nunito";
    ctx.fillText(`Time: ${Math.ceil(timeLeft)}`, canvas.width - 140, 30);

    // Stage
    ctx.fillText(`Stage: ${stage}`, canvas.width - 140, 60);
}

// Game loop
function loop() {
    if (!gameOver) {
        updateTimer();
        updateNoise();
    }
    draw();
    requestAnimationFrame(loop);
}

resetGame();
loop();
