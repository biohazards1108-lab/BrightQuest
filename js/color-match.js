// color-match.js

const cmCanvas = document.getElementById("gameCanvas");
const cmCtx = cmCanvas.getContext("2d");
const cmStatus = document.getElementById("statusDisplay");

const CM_COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7"];
let cmTarget = null;
let cmChoices = [];
let cmScore = 0;
let cmTimeLeft = 20;
let cmLastTime = performance.now();
let cmGameOver = false;

function cmNewRound() {
    cmChoices = [];
    const count = 4;
    while (cmChoices.length < count) {
        const c = CM_COLORS[Math.floor(Math.random() * CM_COLORS.length)];
        if (!cmChoices.includes(c)) cmChoices.push(c);
    }
    cmTarget = cmChoices[Math.floor(Math.random() * cmChoices.length)];
    cmStatus.textContent = `Color Match — Click the ${cmTarget} tile | Score: ${cmScore}`;
    cmDraw();
}

cmCanvas.addEventListener("click", e => {
    if (cmGameOver) return;
    const rect = cmCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tileW = cmCanvas.width / cmChoices.length;

    const index = Math.floor(x / tileW);
    const chosen = cmChoices[index];

    if (chosen === cmTarget) {
        cmScore += 5;
        cmTimeLeft += 2;
        cmNewRound();
    } else {
        cmScore = Math.max(0, cmScore - 3);
        cmTimeLeft -= 3;
        cmStatus.textContent = `Wrong! Target: ${cmTarget} | Score: ${cmScore}`;
    }
});

function cmUpdateTimer() {
    const now = performance.now();
    const delta = (now - cmLastTime) / 1000;
    cmLastTime = now;
    cmTimeLeft -= delta;
    if (cmTimeLeft <= 0) {
        cmTimeLeft = 0;
        cmGameOver = true;
        cmStatus.textContent = `Time’s up! Final Score: ${cmScore}`;
    }
}

function cmDraw() {
    cmCtx.fillStyle = "#020617";
    cmCtx.fillRect(0, 0, cmCanvas.width, cmCanvas.height);

    const tileW = cmCanvas.width / cmChoices.length;
    cmChoices.forEach((c, i) => {
        cmCtx.fillStyle = c;
        cmCtx.fillRect(i * tileW + 8, cmCanvas.height / 2 - 60, tileW - 16, 120);
    });

    cmCtx.fillStyle = "#e5e7eb";
    cmCtx.font = "24px Nunito";
    cmCtx.fillText(`Time: ${Math.ceil(cmTimeLeft)}s`, 20, 40);
    cmCtx.fillText(`Score: ${cmScore}`, 20, 70);
}

function cmLoop() {
    if (!cmGameOver) cmUpdateTimer();
    cmDraw();
    requestAnimationFrame(cmLoop);
}

cmNewRound();
cmLoop();
