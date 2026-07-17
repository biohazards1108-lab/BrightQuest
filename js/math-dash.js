// math-dash.js

const mdCanvas = document.getElementById("gameCanvas");
const mdCtx = mdCanvas.getContext("2d");
const mdStatus = document.getElementById("statusDisplay");

let mdQuestion = null;
let mdAnswers = [];
let mdCorrectIndex = 0;
let mdScore = 0;
let mdTimeLeft = 25;
let mdLastTime = performance.now();
let mdGameOver = false;

function mdGenerateQuestion() {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let result;

    if (op === "+") result = a + b;
    else if (op === "-") result = a - b;
    else result = a * b;

    mdQuestion = `${a} ${op} ${b} = ?`;

    mdAnswers = [];
    mdCorrectIndex = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) {
        if (i === mdCorrectIndex) {
            mdAnswers.push(result);
        } else {
            let wrong;
            do {
                wrong = result + (Math.floor(Math.random() * 11) - 5);
            } while (wrong === result || mdAnswers.includes(wrong));
            mdAnswers.push(wrong);
        }
    }

    mdStatus.textContent = `Math Dash — Solve fast! Score: ${mdScore}`;
    mdDraw();
}

mdCanvas.addEventListener("click", e => {
    if (mdGameOver) return;
    const rect = mdCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tileW = mdCanvas.width / 2;
    const tileH = mdCanvas.height / 2;

    const col = Math.floor(x / tileW);
    const row = Math.floor(y / tileH);
    const index = row * 2 + col;

    if (index === mdCorrectIndex) {
        mdScore += 10;
        mdTimeLeft += 3;
        mdGenerateQuestion();
    } else {
        mdScore = Math.max(0, mdScore - 5);
        mdTimeLeft -= 4;
        mdStatus.textContent = `Wrong! Try again. Score: ${mdScore}`;
    }
});

function mdUpdateTimer() {
    const now = performance.now();
    const delta = (now - mdLastTime) / 1000;
    mdLastTime = now;
    mdTimeLeft -= delta;
    if (mdTimeLeft <= 0) {
        mdTimeLeft = 0;
        mdGameOver = true;
        mdStatus.textContent = `Time’s up! Final Score: ${mdScore}`;
    }
}

function mdDraw() {
    mdCtx.fillStyle = "#020617";
    mdCtx.fillRect(0, 0, mdCanvas.width, mdCanvas.height);

    mdCtx.fillStyle = "#e5e7eb";
    mdCtx.font = "32px Nunito";
    mdCtx.textAlign = "center";
    mdCtx.fillText(mdQuestion, mdCanvas.width / 2, 80);

    const tileW = mdCanvas.width / 2;
    const tileH = mdCanvas.height / 2;

    for (let i = 0; i < 4; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col * tileW;
        const y = 150 + row * tileH;

        mdCtx.fillStyle = "#1f2937";
        mdCtx.fillRect(x + 10, y + 10, tileW - 20, tileH - 20);

        mdCtx.fillStyle = "#38bdf8";
        mdCtx.font = "28px Nunito";
        mdCtx.fillText(mdAnswers[i], x + tileW / 2, y + tileH / 2);
    }

    mdCtx.fillStyle = "#e5e7eb";
    mdCtx.font = "22px Nunito";
    mdCtx.textAlign = "left";
    mdCtx.fillText(`Time: ${Math.ceil(mdTimeLeft)}s`, 20, 40);
    mdCtx.fillText(`Score: ${mdScore}`, 20, 70);
}

function mdLoop() {
    if (!mdGameOver) mdUpdateTimer();
    mdDraw();
    requestAnimationFrame(mdLoop);
}

mdGenerateQuestion();
mdLoop();
