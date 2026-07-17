// logic-labyrinth.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDisplay = document.getElementById("statusDisplay");

const TILE = 40;
const GRID = 16;

let grid = [];
let player = { x: 1, y: 1 };
let exit = { x: GRID - 2, y: GRID - 2 };
let switches = [];
let gates = [];
let keys = {};

window.addEventListener("keydown", e => {
    keys[e.key] = true;
    handleInput(e.key);
});
window.addEventListener("keyup", e => { keys[e.key] = false; });

// Mobile tap movement
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE);
    const y = Math.floor((e.clientY - rect.top) / TILE);
    moveTowards(x, y);
});

function initGrid() {
    grid = [];
    for (let y = 0; y < GRID; y++) {
        const row = [];
        for (let x = 0; x < GRID; x++) {
            // 1 = wall, 0 = floor
            const border = (x === 0 || y === 0 || x === GRID - 1 || y === GRID - 1);
            row.push(border ? 1 : (Math.random() < 0.2 ? 1 : 0));
        }
        grid.push(row);
    }

    // Clear start and exit
    grid[player.y][player.x] = 0;
    grid[exit.y][exit.x] = 0;

    // Generate switches and gates
    switches = [];
    gates = [];

    for (let i = 0; i < 4; i++) {
        const sx = 2 + Math.floor(Math.random() * (GRID - 4));
        const sy = 2 + Math.floor(Math.random() * (GRID - 4));
        const gx = 2 + Math.floor(Math.random() * (GRID - 4));
        const gy = 2 + Math.floor(Math.random() * (GRID - 4));

        switches.push({ x: sx, y: sy, active: false });
        gates.push({ x: gx, y: gy, open: false });

        grid[sy][sx] = 0; // ensure floor under switch
        grid[gy][gx] = 1; // gate starts as wall
    }
}

function resetGame() {
    player = { x: 1, y: 1 };
    exit = { x: GRID - 2, y: GRID - 2 };
    initGrid();
    statusDisplay.textContent = "Reach the exit. Switches open gates.";
    draw();
}

function handleInput(key) {
    let dx = 0, dy = 0;
    if (key === "ArrowUp" || key === "w") dy = -1;
    if (key === "ArrowDown" || key === "s") dy = 1;
    if (key === "ArrowLeft" || key === "a") dx = -1;
    if (key === "ArrowRight" || key === "d") dx = 1;

    if (dx !== 0 || dy !== 0) {
        tryMove(player.x + dx, player.y + dy);
    }
}

function moveTowards(tx, ty) {
    const dx = Math.sign(tx - player.x);
    const dy = Math.sign(ty - player.y);
    tryMove(player.x + dx, player.y + dy);
}

function tryMove(nx, ny) {
    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) return;
    if (grid[ny][nx] === 1) return; // wall or closed gate

    player.x = nx;
    player.y = ny;

    // Check switches
    switches.forEach((s, i) => {
        if (s.x === player.x && s.y === player.y && !s.active) {
            s.active = true;
            gates[i].open = true;
            grid[gates[i].y][gates[i].x] = 0; // open gate
        }
    });

    // Check exit
    if (player.x === exit.x && player.y === exit.y) {
        statusDisplay.textContent = "You escaped! New maze generated.";
        setTimeout(resetGame, 800);
    }

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            const tile = grid[y][x];
            if (tile === 1) {
                ctx.fillStyle = "#1e293b";
            } else {
                ctx.fillStyle = "#0f172a";
            }
            ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
    }

    // Gates
    gates.forEach(g => {
        ctx.fillStyle = g.open ? "#22c55e" : "#ef4444";
        ctx.fillRect(g.x * TILE, g.y * TILE, TILE, TILE);
    });

    // Switches
    switches.forEach(s => {
        ctx.fillStyle = s.active ? "#22c55e" : "#eab308";
        ctx.beginPath();
        ctx.arc(s.x * TILE + TILE / 2, s.y * TILE + TILE / 2, TILE / 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Exit
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(exit.x * TILE + 8, exit.y * TILE + 8, TILE - 16, TILE - 16);

    // Player
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(player.x * TILE + TILE / 2, player.y * TILE + TILE / 2, TILE / 3, 0, Math.PI * 2);
    ctx.fill();
}

// Start
resetGame();
