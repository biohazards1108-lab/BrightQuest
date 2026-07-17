// logic-labyrinth.js (fixed version)

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

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE);
    const y = Math.floor((e.clientY - rect.top) / TILE);
    moveTowards(x, y);
});

// ------------------------------------------------------------
// PERFECT MAZE GENERATOR (DFS)
// ------------------------------------------------------------
function generateMaze() {
    grid = Array(GRID).fill(0).map(() => Array(GRID).fill(1)); // all walls

    function carve(x, y) {
        const dirs = [
            [2, 0], [-2, 0], [0, 2], [0, -2]
        ].sort(() => Math.random() - 0.5);

        grid[y][x] = 0;

        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx > 0 && ny > 0 && nx < GRID - 1 && ny < GRID - 1) {
                if (grid[ny][nx] === 1) {
                    grid[y + dy / 2][x + dx / 2] = 0;
                    carve(nx, ny);
                }
            }
        }
    }

    carve(1, 1);
}

// ------------------------------------------------------------
// SWITCHES + GATES (always solvable)
// ------------------------------------------------------------
function placeSwitchesAndGates() {
    switches = [];
    gates = [];

    for (let i = 0; i < 4; i++) {
        let sx, sy, gx, gy;

        // Find valid switch tile
        do {
            sx = 1 + Math.floor(Math.random() * (GRID - 2));
            sy = 1 + Math.floor(Math.random() * (GRID - 2));
        } while (grid[sy][sx] !== 0 || (sx === player.x && sy === player.y));

        // Find valid gate tile (must be a wall next to a path)
        do {
            gx = 1 + Math.floor(Math.random() * (GRID - 2));
            gy = 1 + Math.floor(Math.random() * (GRID - 2));
        } while (
            grid[gy][gx] !== 1 ||
            (gx === exit.x && gy === exit.y) ||
            !hasAdjacentFloor(gx, gy)
        );

        switches.push({ x: sx, y: sy, active: false });
        gates.push({ x: gx, y: gy, open: false });
    }
}

function hasAdjacentFloor(x, y) {
    return (
        (grid[y][x - 1] === 0) ||
        (grid[y][x + 1] === 0) ||
        (grid[y - 1][x] === 0) ||
        (grid[y + 1][x] === 0)
    );
}

// ------------------------------------------------------------
// GAME RESET
// ------------------------------------------------------------
function resetGame() {
    player = { x: 1, y: 1 };
    exit = { x: GRID - 2, y: GRID - 2 };

    generateMaze();
    grid[exit.y][exit.x] = 0;

    placeSwitchesAndGates();

    statusDisplay.textContent = "Reach the exit. Switches open gates.";
    draw();
}

// ------------------------------------------------------------
// MOVEMENT
// ------------------------------------------------------------
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

    // Gate check
    const gateIndex = gates.findIndex(g => g.x === nx && g.y === ny && !g.open);
    if (gateIndex !== -1) return;

    if (grid[ny][nx] === 1) return;

    player.x = nx;
    player.y = ny;

    switches.forEach((s, i) => {
        if (s.x === player.x && s.y === player.y && !s.active) {
            s.active = true;
            gates[i].open = true;
        }
    });

    if (player.x === exit.x && player.y === exit.y) {
        statusDisplay.textContent = "You escaped! New maze generated.";
        setTimeout(resetGame, 800);
    }

    draw();
}

// ------------------------------------------------------------
// DRAW
// ------------------------------------------------------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            ctx.fillStyle = grid[y][x] === 1 ? "#1e293b" : "#0f172a";
            ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
    }

    gates.forEach(g => {
        ctx.fillStyle = g.open ? "#22c55e" : "#ef4444";
        ctx.fillRect(g.x * TILE, g.y * TILE, TILE, TILE);
    });

    switches.forEach(s => {
        ctx.fillStyle = s.active ? "#22c55e" : "#eab308";
        ctx.beginPath();
        ctx.arc(s.x * TILE + TILE / 2, s.y * TILE + TILE / 2, TILE / 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(exit.x * TILE + 8, exit.y * TILE + 8, TILE - 16, TILE - 16);

    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(player.x * TILE + TILE / 2, player.y * TILE + TILE / 2, TILE / 3, 0, Math.PI * 2);
    ctx.fill();
}

resetGame();
