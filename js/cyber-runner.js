// cyber-runner.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 120,
    w: 40,
    h: 40,
    speed: 7
};

let keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Mobile movement
canvas.addEventListener("touchmove", e => {
    const t = e.touches[0];
    player.x = t.clientX;
});

// Obstacles
let obstacles = [];
let lastSpawn = 0;
let spawnInterval = 900;
let gameSpeed = 4;
let score = 0;

// Spawn obstacle
function spawnObstacle() {
    const width = 40 + Math.random() * 60;
    const height = 20 + Math.random() * 40;
    const x = Math.random() * (canvas.width - width);

    obstacles.push({
        x,
        y: -height,
        w: width,
        h: height,
        vy: gameSpeed + Math.random() * 3
    });
}

// Update
function update(timestamp) {
    // Player movement
    if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
    if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

    // Clamp
    if (player.x < player.w / 2) player.x = player.w / 2;
    if (player.x > canvas.width - player.w / 2) player.x = canvas.width - player.w / 2;

    // Spawn obstacles
    if (!lastSpawn) lastSpawn = timestamp;
    if (timestamp - lastSpawn > spawnInterval) {
        spawnObstacle();
        lastSpawn = timestamp;

        // Increase difficulty
        if (spawnInterval > 350) spawnInterval -= 10;
        gameSpeed += 0.05;
    }

    // Move obstacles
    obstacles.forEach(o => o.y += o.vy);
    obstacles = obstacles.filter(o => o.y < canvas.height + 60);

    // Collision detection
    obstacles.forEach(o => {
        if (
            player.x - player.w / 2 < o.x + o.w &&
            player.x + player.w / 2 > o.x &&
            player.y - player.h / 2 < o.y + o.h &&
            player.y + player.h / 2 > o.y
        ) {
            // Reset game
            obstacles = [];
            score = 0;
            gameSpeed = 4;
            spawnInterval = 900;
        }
    });

    // Score
    score += 1;
    scoreDisplay.textContent = `Score: ${score}`;
}

// Draw
function drawBackground() {
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid
    ctx.strokeStyle = "rgba(0,255,255,0.2)";
    ctx.lineWidth = 1;

    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

function drawPlayer() {
    ctx.fillStyle = "#00eaff";
    ctx.fillRect(player.x - player.w / 2, player.y - player.h / 2, player.w, player.h);
}

function drawObstacles() {
    ctx.fillStyle = "#ff0077";
    obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
    });
}

function loop(timestamp) {
    update(timestamp);
    drawBackground();
    drawPlayer();
    drawObstacles();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
