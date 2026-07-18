// logic-labyrinth.js (exit-safe version)

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
let enemies = [];
let keyItems = [];
let difficulty = "Normal";
let timeLeft = 60;
let lastTime = performance.now();

function getDifficultySettings() {
    if (difficulty === "Easy") return { enemyCount: 2, keyCount: 2, timeLimit: 90 };
    if (difficulty === "Hard") return { enemyCount: 6, keyCount: 4, timeLimit: 45 };
    return { enemyCount: 4, keyCount: 3, timeLimit: 60 };
}

function generateMaze() {
    grid = Array(GRID).fill(0).map(() => Array(GRID).fill(1));

    function carve(x, y) {
        const dirs = [[2,0],[-2,0],[0,2],[0,-2]].sort(() => Math.random() - 0.5);
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

    // force exit area open
    const ex = exit.x;
    const ey = exit.y;
    grid[ey][ex] = 0;
    if (ex > 1) grid[ey][ex - 1] = 0;
    if (ex < GRID - 2) grid[ey][ex + 1] = 0;
    if (ey > 1) grid[ey - 1][ex] = 0;
    if (ey < GRID - 2) grid[ey + 1][ex] = 0;

    // safety: if exit still boxed, regenerate
    if (!hasAdjacentFloor(ex, ey)) {
        generateMaze();
    }
}

function hasAdjacentFloor(x, y) {
    return (
        (x > 0 && grid[y][x - 1] === 0) ||
        (x < GRID - 1 && grid[y][x + 1] === 0) ||
        (y > 0 && grid[y - 1][x] === 0) ||
        (y < GRID - 1 && grid[y + 1][x] === 0)
    );
}

function placeSwitchesAndGates() {
    switches = [];
    gates = [];

    for (let i = 0; i < 4; i++) {
        let sx, sy, gx, gy;

        do {
            sx = 1 + Math.floor(Math.random() * (GRID - 2));
            sy = 1 + Math.floor(Math.random() * (GRID - 2));
        } while (
            grid[sy][sx] !== 0 ||
            (sx === player.x && sy === player.y) ||
            (sx === exit.x && sy === exit.y)
        );

        // gate cannot be on or adjacent to exit
        do {
            gx = 1 + Math.floor(Math.random() * (GRID - 2));
            gy = 1 + Math.floor(Math.random() * (GRID - 2));
        } while (
            grid[gy][gx] !== 1 ||
            !hasAdjacentFloor(gx, gy) ||
            (gx === exit.x && gy === exit.y) ||
            (Math.abs(gx - exit.x) + Math.abs(gy - exit.y) <= 1)
        );

        switches.push({ x: sx, y: sy, active: false });
        gates.push({ x: gx, y: gy, open: false });
    }
}

function placeKeys(count) {
    keyItems = [];
    for (let i = 0; i < count; i++) {
        let kx, ky;
        do {
            kx = 1 + Math.floor(Math.random() * (GRID - 2));
            ky = 1 + Math.floor(Math.random() * (GRID - 2));
        } while (
            grid[ky][kx] !== 0 ||
            (kx === player.x && ky === player.y) ||
            (kx === exit.x && ky === exit.y)
        );
        keyItems.push({ x: kx, y: ky, collected: false });
    }
}

function placeEnemies(count) {
    enemies = [];
    for (let i = 0; i < count; i++) {
        let ex, ey;
        do {
            ex = 1 + Math.floor(Math.random() * (GRID - 2));
            ey = 1 + Math.floor(Math.random() * (GRID - 2));
        } while (
            grid[ey][ex] !== 0 ||
            (ex === player.x && ey === player.y) ||
            (ex === exit.x && ey === exit.y)
        );
        enemies.push({
            x: ex,
            y: ey,
            dir: Math.random() < 0.5 ? 1 : -1,
            axis: Math.random() < 0.5 ? "x" : "y"
        });
    }
}

function resetGame() {
    const settings = getDifficultySettings();
    player = { x: 1, y: 1, keys: 0 };
    exit = { x: GRID - 2, y: GRID - 2 };
    timeLeft = settings.timeLimit;
    lastTime = performance.now();

    generateMaze();
    placeSwitchesAndGates();
    placeKeys(settings.keyCount);
    placeEnemies(settings.enemyCount);

    statusDisplay.textContent =
        `Mode: ${difficulty} | Collect keys, open gates, reach exit before time runs out.`;
    draw();
}

function handleInput(key) {
    if (key === "1") { difficulty = "Easy"; resetGame(); return; }
    if (key === "2") { difficulty = "Normal"; resetGame(); return; }
    if (key === "3") { difficulty = "Hard"; resetGame(); return; }

    let dx = 0, dy = 0;
    if (key === "ArrowUp" || key === "w") dy = -1;
    if (key === "ArrowDown" || key === "s") dy = 1;
    if (key === "ArrowLeft" || key === "a") dx = -1;
    if (key === "ArrowRight" || key === "d") dx = 1;

    if (dx !== 0 || dy !== 0) {
        tryMove(player.x + dx, player.y + dy);
    }
}

window.addEventListener("keydown", e => handleInput(e.key));

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE);
    const y = Math.floor((e.clientY - rect.top) / TILE);
    const dx = Math.sign(x - player.x);
    const dy = Math.sign(y - player.y);
    tryMove(player.x + dx, player.y + dy);
});

function tryMove(nx, ny) {
    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) return;

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

    keyItems.forEach(k => {
        if (!k.collected && k.x === player.x && k.y === player.y) {
            k.collected = true;
            player.keys += 1;
        }
    });

    enemies.forEach(e => {
        if (e.x === player.x && e.y === player.y) {
            statusDisplay.textContent = "Caught by an enemy! New maze.";
            setTimeout(resetGame, 800);
        }
    });

    const allKeysCollected = keyItems.every(k => k.collected);
    if (player.x === exit.x && player.y === exit.y) {
        if (!allKeysCollected) {
            statusDisplay.textContent = "You need all keys before exiting!";
        } else {
            statusDisplay.textContent = "You escaped! New maze generated.";
            setTimeout(resetGame, 800);
        }
    }

    draw();
}

function updateEnemies() {
    enemies.forEach(e => {
        let nx = e.x;
        let ny = e.y;

        if (e.axis === "x") nx += e.dir;
        else ny += e.dir;

        if (
            nx <= 0 || ny <= 0 ||
            nx >= GRID - 1 || ny >= GRID - 1 ||
            grid[ny][nx] === 1
        ) {
            e.dir *= -1;
        } else {
            e.x = nx;
            e.y = ny;
        }

        if (e.x === player.x && e.y === player.y) {
            statusDisplay.textContent = "Caught by an enemy! New maze.";
            setTimeout(resetGame, 800);
        }
    });
}

function updateTimer() {
    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    timeLeft -= delta;
    if (timeLeft <= 0) {
        timeLeft = 0;
        statusDisplay.textContent = "Time’s up! New maze.";
        setTimeout(resetGame, 800);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            const dist = Math.hypot(x - player.x, y - player.y);
            const visible = dist < 4;

            ctx.fillStyle = visible
                ? (grid[y][x] === 1 ? "#1e293b" : "#0f172a")
                : "#020617";
            ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
    }

    gates.forEach(g => {
        const dist = Math.hypot(g.x - player.x, g.y - player.y);
        if (dist < 4) {
            ctx.fillStyle = g.open ? "#22c55e" : "#ef4444";
            ctx.fillRect(g.x * TILE, g.y * TILE, TILE, TILE);
        }
    });

    switches.forEach(s => {
        const dist = Math.hypot(s.x - player.x, s.y - player.y);
        if (dist < 4) {
            ctx.fillStyle = s.active ? "#22c55e" : "#eab308";
            ctx.beginPath();
            ctx.arc(s.x * TILE + TILE / 2, s.y * TILE + TILE / 2, TILE / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    keyItems.forEach(k => {
        const dist = Math.hypot(k.x - player.x, k.y - player.y);
        if (!k.collected && dist < 4) {
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(k.x * TILE + TILE / 2, k.y * TILE + TILE / 2, TILE / 5, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    const distExit = Math.hypot(exit.x - player.x, exit.y - player.y);
    if (distExit < 4) {
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(exit.x * TILE + 8, exit.y * TILE + 8, TILE - 16, TILE - 16);
    }

    enemies.forEach(e => {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist < 4) {
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(e.x * TILE + 8, e.y * TILE + 8, TILE - 16, TILE - 16);
        }
    });

    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(player.x * TILE + TILE / 2, player.y * TILE + TILE / 2, TILE / 3, 0, Math.PI * 2);
    ctx.fill();

    statusDisplay.textContent =
        `Mode: ${difficulty} | Keys: ${player.keys}/${keyItems.length} | Time: ${Math.ceil(timeLeft)}s`;
}

function loop() {
    updateEnemies();
    updateTimer();
    draw();
    requestAnimationFrame(loop);
}

resetGame();
loop();
