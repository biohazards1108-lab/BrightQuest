// memory-quest.js

const mqCanvas = document.getElementById("gameCanvas");
const mqCtx = mqCanvas.getContext("2d");
const mqStatus = document.getElementById("statusDisplay");

const MQ_ROWS = 4;
const MQ_COLS = 4;
const MQ_TILES = MQ_ROWS * MQ_COLS;
const MQ_SYMBOLS = ["★","◆","▲","●","■","♥","♣","♠"];

let mqCards = [];
let mqRevealed = [];
let mqMatched = 0;
let mqFirst = null;
let mqSecond = null;
let mqLock = false;
let mqMoves = 0;

function mqInit() {
    const pairs = [];
    while (pairs.length < MQ_TILES / 2) {
        const s = MQ_SYMBOLS[Math.floor(Math.random() * MQ_SYMBOLS.length)];
        if (!pairs.includes(s)) pairs.push(s);
    }

    mqCards = [];
    pairs.forEach(s => {
        mqCards.push({ symbol: s, matched: false });
        mqCards.push({ symbol: s, matched: false });
    });

    mqCards.sort(() => Math.random() - 0.5);
    mqMatched = 0;
    mqMoves = 0;
    mqFirst = null;
    mqSecond = null;
    mqLock = false;
    mqStatus.textContent = "Memory Quest — Match all pairs.";
    mqDraw();
}

mqCanvas.addEventListener("click", e => {
    if (mqLock) return;
    const rect = mqCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tileW = mqCanvas.width / MQ_COLS;
    const tileH = mqCanvas.height / MQ_ROWS;

    const col = Math.floor(x / tileW);
    const row = Math.floor(y / tileH);
    const index = row * MQ_COLS + col;

    const card = mqCards[index];
    if (!card || card.matched) return;
    if (mqFirst === index) return;

    if (mqFirst === null) {
        mqFirst = index;
    } else if (mqSecond === null) {
        mqSecond = index;
        mqMoves++;
        mqLock = true;

        if (mqCards[mqFirst].symbol === mqCards[mqSecond].symbol) {
            mqCards[mqFirst].matched = true;
            mqCards[mqSecond].matched = true;
            mqMatched += 2;
            mqFirst = null;
            mqSecond = null;
            mqLock = false;

            if (mqMatched === MQ_TILES) {
                mqStatus.textContent = `All matched! Moves: ${mqMoves}. New game starting...`;
                setTimeout(mqInit, 1000);
            }
        } else {
            setTimeout(() => {
                mqFirst = null;
                mqSecond = null;
                mqLock = false;
                mqDraw();
            }, 700);
        }
    }

    mqDraw();
});

function mqDraw() {
    mqCtx.fillStyle = "#020617";
    mqCtx.fillRect(0, 0, mqCanvas.width, mqCanvas.height);

    const tileW = mqCanvas.width / MQ_COLS;
    const tileH = mqCanvas.height / MQ_ROWS;

    for (let i = 0; i < MQ_TILES; i++) {
        const col = i % MQ_COLS;
        const row = Math.floor(i / MQ_COLS);
        const x = col * tileW;
        const y = row * tileH;
        const card = mqCards[i];

        mqCtx.strokeStyle = "#1f2937";
        mqCtx.strokeRect(x + 4, y + 4, tileW - 8, tileH - 8);

        const isRevealed = (i === mqFirst || i === mqSecond || card.matched);

        if (isRevealed) {
            mqCtx.fillStyle = card.matched ? "#22c55e" : "#0f172a";
            mqCtx.fillRect(x + 4, y + 4, tileW - 8, tileH - 8);

            mqCtx.fillStyle = "#e5e7eb";
            mqCtx.font = "32px Nunito";
            mqCtx.textAlign = "center";
            mqCtx.textBaseline = "middle";
            mqCtx.fillText(card.symbol, x + tileW / 2, y + tileH / 2);
        } else {
            mqCtx.fillStyle = "#1f2937";
            mqCtx.fillRect(x + 4, y + 4, tileW - 8, tileH - 8);
        }
    }

    mqCtx.fillStyle = "#e5e7eb";
    mqCtx.font = "20px Nunito";
    mqCtx.textAlign = "left";
    mqCtx.fillText(`Moves: ${mqMoves}`, 20, 30);
}

mqInit();
