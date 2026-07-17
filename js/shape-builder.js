// shape-builder.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDisplay = document.getElementById("statusDisplay");

const GRID = 8;
const TILE = canvas.width / GRID;

let targetGrid = [];
let playerGrid = [];
let movesLeft = 0;
let level = 1;
let gameOver = false;

// Generate random target shape
function generateTarget() {
    targetGrid = Array(GRID).fill(0).map(() => Array(GRID).fill(0));
    const blobs = 2 + Math.floor(Math.random() * 3);

    for (let b = 0; b < blobs; b++) {
        const cx = 1 + Math.floor(Math.random() * (GRID - 2));
        const cy = 1 + Math.floor(Math.random() * (GRID - 2));
        const radius = 1 + Math.floor(Math.random() * 2);

        for (let y = 0; y < GRID; y++) {
            for (let x = 0; x < GRID; x++) {
                const dist = Math.hypot(x - cx, y - cy);
                if (dist <= radius) {
                    targetGrid[y][x] = 1;
                }
            }
        }
    }
}

// Reset player grid
function resetPlayerGrid() {
    playerGrid = Array(GRID).fill(0).map(() => Array(GRID).fill(0));
}

// New level
function newLevel() {
    gameOver = false;
    generateTarget();
    resetPlayerGrid();
    movesLeft = Math.max(6, 14 - level); // fewer moves each level
    statusDisplay.textContent = `Level ${level} — Build the shape. Moves left: ${movesLeft}`;
    draw();
}

// Toggle plus pattern around clicked cell
function applyTool(x, y) {
    const coords = [
        [x, y],
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
    ];

    coords.forEach(([cx, cy]) => {
        if (cx >= 0 && cy >= 0 && cx < GRID && cy < GRID) {
            playerGrid[cy][cx] = playerGrid[cy][cx] ? 0 : 1;
        }
    });
}

// Check match
function gridsMatch() {
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            if (playerGrid[y][x] !== targetGrid[y][x]) return false;
        }
    }
    return true;
}

// Handle click
canvas.addEventListener("click", e => {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE);
    const y = Math.floor((e.clientY - rect.top) / TILE);

    applyTool(x, y);
    movesLeft--;

    if (gridsMatch()) {
        level++;
        statusDisplay.textContent = `Perfect match! Next level incoming...`;
        setTimeout(newLevel, 800);
        return;
    }

    if (movesLeft <= 0) {
        gameOver = true;
        statusDisplay.textContent = `Out of moves! Level reset.`;
        setTimeout(() => {
            level = Math.max(1, level - 1);
            newLevel();
        }, 800);
        return;
    }

    statusDisplay.textContent = `Level ${level} — Moves left: ${movesLeft}`;
    draw();
});

// Draw
function draw() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Target grid (top half)
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            const ty = y;
            const tx = x;

            ctx.strokeStyle = "#1f2937";
            ctx.strokeRect(tx * TILE, ty * TILE, TILE, TILE);

            if (targetGrid[ty][tx]) {
                ctx.fillStyle = "#38bdf8";
                ctx.fillRect(tx * TILE + 4, ty * TILE + 4, TILE - 8, TILE - 8);
            }
        }
    }

    // Player grid (bottom half, offset)
    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            const py = y;
            const px = x;

            const offsetY = canvas.height / 2;

            ctx.strokeStyle = "#1f2937";
            ctx.strokeRect(px * TILE, offsetY + py * TILE / GRID * GRID, TILE, TILE);

            if (playerGrid[py][px]) {
                ctx.fillStyle = "#f97316";
                ctx.fillRect(px * TILE + 4, offsetY + py * TILE / GRID * GRID + 4, TILE - 8, TILE - 8);
            }
        }
    }

    // Divider line
    ctx.strokeStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

newLevel();
