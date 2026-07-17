const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ninja = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    vx: 0,
    vy: 0,
    radius: 20
};

let rope = null;
let gravity = 0.4;
let letters = [];
let collected = "";

function spawnLetters() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 6; i++) {
        letters.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 300),
            char: alphabet[Math.floor(Math.random() * alphabet.length)]
        });
    }
}

spawnLetters();

canvas.addEventListener("click", (e) => {
    rope = {
        x: e.clientX,
        y: e.clientY
    };
});

function update() {
    if (rope) {
        let dx = rope.x - ninja.x;
        let dy = rope.y - ninja.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let ropeLength = 200;

        if (dist > ropeLength) {
            let pull = (dist - ropeLength) * 0.02;
            ninja.vx += (dx / dist) * pull;
            ninja.vy += (dy / dist) * pull;
        }
    }

    ninja.vy += gravity;
    ninja.x += ninja.vx;
    ninja.y += ninja.vy;

    if (ninja.y > canvas.height - ninja.radius) {
        ninja.y = canvas.height - ninja.radius;
        ninja.vy = 0;
    }

    letters.forEach((l, i) => {
        let dx = l.x - ninja.x;
        let dy = l.y - ninja.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
            collected += l.char;
            letters.splice(i, 1);
            document.getElementById("wordDisplay").innerText = collected;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (rope) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ninja.x, ninja.y);
        ctx.lineTo(rope.x, rope.y);
        ctx.stroke();
    }

    ctx.fillStyle = "yellow";
    letters.forEach(l => {
        ctx.beginPath();
        ctx.arc(l.x, l.y, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.font = "20px Nunito";
        ctx.fillText(l.char, l.x - 6, l.y + 6);
        ctx.fillStyle = "yellow";
    });

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ninja.x, ninja.y, ninja.radius, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
