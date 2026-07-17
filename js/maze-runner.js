// maze-runner.js

const mrCanvas = document.getElementById("gameCanvas");
const mrCtx = mrCanvas.getContext("2d");
const mrStatus = document.getElementById("statusDisplay");

const MR_TILE = 32;
const MR_GRID = 20;

let mrGrid = [];
let mrPlayer = { x: 1, y: 1 };
let mrExit = { x: MR_GRID - 2, y: MR_GRID - 2 };
let mrKeys = {};
let mrTimeLeft = 40;
let mrLastTime = performance.now();
let mrGameOver = false;

window.addEventListener("keydown", e => {
    mrKeys[e.key] = true;
    mrHandleInput(e.key);
});
window.addEventListener("keyup", e => { mrKeys[e.key] = false; });

mrCanvas.addEventListener("click", e => {
    const rect = mrCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / MR_TILE);
    const y = Math.floor((e.clientY - rect.top) / MR_TILE);
    const dx = Math.sign(x - mrPlayer.x);
    const dy = Math.sign(y - mrPlayer.y);
    mrTryMove(mrPlayer.x + dx, mrPlayer.y + dy);
});

function mrGenerateMaze() {
    mrGrid = Array(MR_GRID).fill(0).map(() => Array(MR_GRID).fill(1));

    function carve(x, y) {
        const dirs = [[2,0],[-2,0],[0,2],[0,-2]].sort(() => Math.random() - 0.5);
        mrGrid[y][x] = 0;
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && ny > 0 && nx < MR_GRID - 1 && ny < MR_GRID - 1) {
                if (mrGrid[ny][nx] === 1) {
                    mrGrid[y + dy / 2][x + dx / 2] = 0;
                    carve(nx, ny);
                }
            }
        }
    }

    carve(1, 1);
    mrGrid[mrExit.y][mrExit.x] = 0;
}

function mrResetGame() {
    mrPlayer = { x: 1, y: 1 };
    mrExit = { x: MR_GRID - 2, y: MR_GRID - 2 };
    mrTimeLeft = 40;
    mrLastTime = performance.now();
    mrGameOver = false;
    mrGenerateMaze();
    mrStatus.textContent = "Maze Runner — Reach the exit before time runs out.";
    mrDraw();
}

function mrHandleInput(key) {
    let dx = 0, dy = 0;
    if (key === "ArrowUp" || key === "w") dy = -1;
    if (key === "ArrowDown" || key === "s") dy = 1;
    if (key === "ArrowLeft" || key === "a") dx = -1;
    if (key === "ArrowRight" || key === "d") dx = 1;

    if (dx !== 0 || dy !== 0) {
        mrTryMove(mrPlayer.x + dx, mrPlayer.y + dy);
    }
}

function mrTryMove(nx, ny) {
    if (mrGameOver) return;
    if (nx < 0 || ny < 0 || nx >= MR_GRID || ny >= MR_GRID) return;
    if (mrGrid[ny][nx] === 1) return;

    mrPlayer.x = nx;
    mrPlayer.y = ny;

    if (mrPlayer.x === mrExit.x && mrPlayer.y === mrExit.y) {
        mrStatus.textContent = "You escaped! New maze incoming...";
        mrGameOver = true;
        setTimeout(mrResetGame, 800);
    }

    mrDraw();
}

function mrUpdateTimer() {
    const now = performance.now();
    const delta = (now - mrLastTime) / 1000;
    mrLastTime = now;
    mrTimeLeft -= delta;
    if (mrTimeLeft <= 0) {
        mrTimeLeft = 0;
        mrGameOver = true;
        mrStatus.textContent = "Time’s up! New maze incoming...";
        setTimeout(mrResetGame, 800);
    }
}

function mrDraw() {
    mrCtx.fillStyle = "#020617";
    mrCtx.fillRect(0, 0, mrCanvas.width, mrCanvas.height);

    for (let y = 0; y < MR_GRID; y++) {
        for (let x = 0; x < MR_GRID; x++) {
            mrCtx.fillStyle = mrGrid[y][x] === 1 ? "#1e293b" : "#0f172a";
            mrCtx.fillRect(x * MR_TILE, y * MR_TILE, MR_TILE, MR_TILE);
        }
    }

    mrCtx.fillStyle = "#38bdf8";
    mrCtx.fillRect(mrExit.x * MR_TILE + 6, mrExit.y * MR_TILE + 6, MR_TILE - 12, MR_TILE - 12);

    mrCtx.fillStyle = "#f97316";
    mrCtx.beginPath();
    mrCtx.arc(mrPlayer.x * MR_TILE + MR_TILE / 2, mrPlayer.y * MR_TILE + MR_TILE / 2, MR_TILE / 3, 0, Math.PI * 2);
    mrCtx.fill();

    mrCtx.fillStyle = "#e5e7eb";
    mrCtx.font = "20px Nunito";
    mrCtx.fillText(`Time: ${Math.ceil(mrTimeLeft)}s`, 20, 30);
}

function mrLoop() {
    if (!mrGameOver) mrUpdateTimer();
    mrDraw();
    requestAnimationFrame(mrLoop);
}

mrResetGame();
mrLoop();
