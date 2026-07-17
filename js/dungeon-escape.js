// dungeon-escape.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDisplay = document.getElementById("statusDisplay");

const TILE = 40;
const GRID = 16;

let grid = [];
let player = { x: 1, y: 1, hp: 3 };
let exit = { x: GRID - 2, y: GRID - 2 };
let traps = [];
let monsters = [];
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

function initDungeon() {
    grid = [];
    for (let y = 0; y < GRID; y++) {
        const row = [];
        for (let x = 0; x < GRID; x++) {
            const border = (x === 0 || y === 0 || x === GRID - 1 || y === GRID - 1);
            row.push(border ? 1 : (Math.random() < 0.18 ? 1 : 0)); // 1 = wall
        }
        grid.push(row);
    }

    grid[player.y][player.x] = 0;
    grid[exit.y][exit.x] = 0;

    traps = [];
    monsters = [];

    for (let i = 0; i < 10; i++) {
        const tx = 2 + Math.floor(Math.random() * (GRID - 4));
        const ty = 2 + Math.floor(Math.random() * (GRID - 4));
        if ((tx === player.x && ty === player.y) || (tx === exit.x && ty === exit.y)) continue;
        traps.push({ x: tx, y: ty });
        grid[ty][tx] = 0;
    }

    for (let i = 0; i < 5; i++) {
        const mx = 2 + Math.floor(Math.random() * (GRID - 4));
        const my = 2 + Math.floor(Math.random() * (GRID - 4));
        if ((mx === player.x && my === player.y) || (mx === exit.x && my === exit.y)) continue;
        monsters.push({ x: mx, y: my, dir: Math.random() < 0.5 ? 1 : -1 });
        grid[my][mx] = 0;
    }
}

function resetGame() {
    player = { x: 1, y: 1, hp: 3 };
    exit = { x: GRID - 2, y: GRID - 2 };
    initDungeon();
    statusDisplay.textContent = "Avoid traps, reach the exit.";
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
    if (grid[ny][nx] === 1) return;

    player.x = nx;
    player.y = ny;

    traps.forEach(t => {
        if (t.x === player.x && t.y === player.y) {
            player.hp -= 1;
            statusDisplay.textContent = `You stepped on a trap! HP: ${player.hp}`;
        }
    });

    monsters.forEach(m => {
        if (m.x === player.x && m.y === player.y) {
            player.hp -= 1;
            statusDisplay.textContent = `A monster hit you! HP: ${player.hp}`;
        }
    });

    if (player.hp <= 0) {
        statusDisplay.textContent = "You died. New dungeon generated.";
        setTimeout(resetGame, 800);
        return;
    }

    if (player.x === exit.x && player.y === exit.y) {
        statusDisplay.textContent = "You escaped! New dungeon generated.";
        setTimeout(resetGame, 800);
        return;
    }

    draw();
}

function updateMonsters() {
    monsters.forEach(m => {
        const nx = m.x + m.dir;
        if (nx <= 1 || nx >= GRID - 2 || grid[m.y][nx] === 1) {
            m.dir *= -1;
        } else {
            m.x = nx;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            const tile = grid[y][x];
            ctx.fillStyle = tile === 1 ? "#1e293b" : "#0f172a";
            ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
    }

    traps.forEach(t => {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(t.x * TILE + TILE / 2, t.y * TILE + TILE / 2, TILE / 5, 0, Math.PI * 2);
        ctx.fill();
    });

    monsters.forEach(m => {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(m.x * TILE + 8, m.y * TILE + 8, TILE - 16, TILE - 16);
    });

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(exit.x * TILE + 8, exit.y * TILE + 8, TILE - 16, TILE - 16);

    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(player.x * TILE + TILE / 2, player.y * TILE / 2 + TILE / 2, TILE / 3, 0, Math.PI * 2);
    ctx.fill();
}

function loop() {
    updateMonsters();
    draw();
    requestAnimationFrame(loop);
}

resetGame();
loop();
