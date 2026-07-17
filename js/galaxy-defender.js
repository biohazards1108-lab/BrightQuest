// galaxy-defender.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Ship
const ship = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    w: 40,
    h: 24,
    speed: 6
};

let keys = {};
window.addEventListener("keydown", e => { keys[e.key] = true; });
window.addEventListener("keyup", e => { keys[e.key] = false; });

// Touch / mouse move for mobile
canvas.addEventListener("mousemove", e => {
    ship.x = e.clientX;
});
canvas.addEventListener("touchmove", e => {
    const t = e.touches[0];
    ship.x = t.clientX;
});

// Bullets & enemies
let bullets = [];
let enemies = [];
let score = 0;
let lastSpawn = 0;
let spawnInterval = 900; // ms, decreases over time

// Shoot
function shoot() {
    bullets.push({
        x: ship.x,
        y: ship.y - ship.h / 2,
        vy: -9
    });
}
window.addEventListener("click", shoot);
canvas.addEventListener("touchstart", shoot);

// Spawn enemy
function spawnEnemy() {
    const size = 26 + Math.random() * 18;
    enemies.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        w: size,
        h: size,
        vy: 2 + Math.random() * 3
    });
}

// Update
function update(timestamp) {
    // Ship movement (keyboard)
    if (keys["ArrowLeft"] || keys["a"]) ship.x -= ship.speed;
    if (keys["ArrowRight"] || keys["d"]) ship.x += ship.speed;

    // Clamp ship
    if (ship.x < ship.w / 2) ship.x = ship.w / 2;
    if (ship.x > canvas.width - ship.w / 2) ship.x = canvas.width - ship.w / 2;

    // Spawn enemies
    if (!lastSpawn) lastSpawn = timestamp;
    if (timestamp - lastSpawn > spawnInterval) {
        spawnEnemy();
        lastSpawn = timestamp;
        if (spawnInterval > 400) spawnInterval -= 10; // ramp difficulty
    }

    // Bullets
    bullets.forEach(b => {
        b.y += b.vy;
    });
    bullets = bullets.filter(b => b.y > -40);

    // Enemies
    enemies.forEach(e => {
        e.y += e.vy;
    });
    enemies = enemies.filter(e => e.y < canvas.height + 60);

    // Collisions bullet vs enemy
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (
                b.x > e.x &&
                b.x < e.x + e.w &&
                b.y > e.y &&
                b.y < e.y + e.h
            ) {
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
            }
        });
    });

    // Enemy hits ship (simple game over reset)
    enemies.forEach(e => {
        if (
            ship.x - ship.w / 2 < e.x + e.w &&
            ship.x + ship.w / 2 > e.x &&
            ship.y - ship.h / 2 < e.y + e.h &&
            ship.y + ship.h / 2 > e.y
        ) {
            // Reset game
            enemies = [];
            bullets = [];
            score = 0;
            spawnInterval = 900;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    });
}

// Draw
function drawBackground() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
    for (let i = 0; i < 60; i++) {
        const x = (i * 97) % canvas.width;
        const y = (i * 53) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawShip() {
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y - ship.h / 2);
    ctx.lineTo(ship.x - ship.w / 2, ship.y + ship.h / 2);
    ctx.lineTo(ship.x + ship.w / 2, ship.y + ship.h / 2);
    ctx.closePath();
    ctx.fill();
}

function drawBullets() {
    ctx.fillStyle = "#f97316";
    bullets.forEach(b => {
        ctx.fillRect(b.x - 3, b.y - 10, 6, 18);
    });
}

function drawEnemies() {
    ctx.fillStyle = "#ef4444";
    enemies.forEach(e => {
        ctx.fillRect(e.x, e.y, e.w, e.h);
    });
}

function loop(timestamp) {
    update(timestamp);
    drawBackground();
    drawShip();
    drawBullets();
    drawEnemies();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
