const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Game state
let ninja = {
    x: canvas.width / 2,
    y: canvas.height - 180,
    vx: 0,
    vy: 0,
    radius: 22
};

let rope = null;          // {anchorX, anchorY, length}
let gravity = 0.6;
let airFriction = 0.99;
let anchors = [];
let letters = [];
let collected = "";
let target = "";
let level = 1;
let score = 0;

// Word list per level
const wordLevels = [
    ["CAT", "SUN", "MAP"],
    ["BRIGHT", "QUEST", "NINJA"],
    ["JUNGLE", "ROCKET", "PUZZLE"]
];

const targetWordEl = document.getElementById("targetWord");
const collectedWordEl = document.getElementById("collectedWord");
const levelDisplayEl = document.getElementById("levelDisplay");
const scoreDisplayEl = document.getElementById("scoreDisplay");

// Input (mouse + touch)
function getInputPos(e) {
    if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function shootRope(e) {
    const pos = getInputPos(e);

    // Find nearest anchor above ninja
    let best = null;
    let bestDist = Infinity;
    anchors.forEach(a => {
        if (a.y < ninja.y + 40) {
            const dx = a.x - pos.x;
            const dy = a.y - pos.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < bestDist && d < 200) {
                bestDist = d;
                best = a;
            }
        }
    });

    if (best) {
        const dx = best.x - ninja.x;
        const dy = best.y - ninja.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        rope = {
            anchorX: best.x,
            anchorY: best.y,
            length: length * 0.95
        };
    } else {
        // No anchor hit → release rope
        rope = null;
    }
}

canvas.addEventListener("click", shootRope);
canvas.addEventListener("touchstart", shootRope);

// Level setup
function setupLevel() {
    collected = "";
    target = pickWordForLevel(level);
    targetWordEl.textContent = target;
    collectedWordEl.textContent = collected;
    levelDisplayEl.textContent = `Level ${level}`;
    scoreDisplayEl.textContent = `Score ${score}`;

    anchors = [];
    letters = [];

    // Create anchors in a vertical zig-zag
    const cols = 4;
    const rows = 6;
    for (let r = 0; r < rows; r++) {
        const y = 80 + r * 90;
        for (let c = 0; c < cols; c++) {
            const x = (canvas.width / (cols + 1)) * (c + 1) + (r % 2 === 0 ? 40 : -40);
            anchors.push({ x, y });
        }
    }

    // Place letters roughly along the path upward
    const spacing = canvas.height / (target.length + 2);
    for (let i = 0; i < target.length; i++) {
        letters.push({
            x: canvas.width * (0.2 + 0.6 * Math.random()),
            y: canvas.height - (i + 2) * spacing,
            char: target[i],
            collected: false
        });
    }

    // Reset ninja near bottom
    ninja.x = canvas.width / 2;
    ninja.y = canvas.height - 180;
    ninja.vx = 0;
    ninja.vy = 0;
    rope = null;
}

function pickWordForLevel(lvl) {
    const list = wordLevels[Math.min(wordLevels.length - 1, lvl - 1)];
    return list[Math.floor(Math.random() * list.length)];
}

// Physics + game logic
function update() {
    // Rope constraint (simple pendulum-like)
    if (rope) {
        // Apply gravity
        ninja.vy += gravity;

        // Integrate velocity
        ninja.vx *= airFriction;
        ninja.vy *= airFriction;
        ninja.x += ninja.vx;
        ninja.y += ninja.vy;

        // Constrain to rope length
        const dx = ninja.x - rope.anchorX;
        const dy = ninja.y - rope.anchorY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const diff = dist - rope.length;
        const nx = dx / dist;
        const ny = dy / dist;

        // Pull ninja back to circle around anchor
        ninja.x -= nx * diff;
        ninja.y -= ny * diff;

        // Small tangential push for swing feel
        const tangentX = -ny;
        const tangentY = nx;
        ninja.vx += tangentX * 0.2;
        ninja.vy += tangentY * 0.2;

        // Auto-release if ninja goes too high or too low
        if (ninja.y < 40 || ninja.y > canvas.height - 40) {
            rope = null;
        }
    } else {
        // Free fall
        ninja.vy += gravity;
        ninja.vx *= airFriction;
        ninja.vy *= airFriction;
        ninja.x += ninja.vx;
        ninja.y += ninja.vy;

        // Ground
        if (ninja.y > canvas.height - ninja.radius - 40) {
            ninja.y = canvas.height - ninja.radius - 40;
            ninja.vy = 0;
        }
    }

    // Screen bounds
    if (ninja.x < ninja.radius) {
        ninja.x = ninja.radius;
        ninja.vx *= -0.4;
    }
    if (ninja.x > canvas.width - ninja.radius) {
        ninja.x = canvas.width - ninja.radius;
        ninja.vx *= -0.4;
    }

    // Letter collection
    letters.forEach(letter => {
        if (!letter.collected) {
            const dx = letter.x - ninja.x;
            const dy = letter.y - ninja.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 30) {
                letter.collected = true;
                collected += letter.char;
                collectedWordEl.textContent = collected;
                score += 10;
                scoreDisplayEl.textContent = `Score ${score}`;
            }
        }
    });

    // Check word completion
    if (collected.length === target.length && collected === target) {
        level++;
        score += 50;
        setupLevel();
    }
}

// Drawing
function drawBackground() {
    // Simple parallax stars
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
    for (let i = 0; i < 40; i++) {
        const x = (i * 97) % canvas.width;
        const y = (i * 53) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawAnchors() {
    anchors.forEach(a => {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 6, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawRope() {
    if (!rope) return;
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rope.anchorX, rope.anchorY);
    ctx.lineTo(ninja.x, ninja.y);
    ctx.stroke();
}

function drawLetters() {
    letters.forEach(letter => {
        if (!letter.collected) {
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(letter.x, letter.y, 18, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#111827";
            ctx.font = "20px Nunito";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(letter.char, letter.x, letter.y);
        }
    });
}

function drawNinja() {
    // Body
    ctx.fillStyle = "#f9fafb";
    ctx.beginPath();
    ctx.arc(ninja.x, ninja.y, ninja.radius, 0, Math.PI * 2);
    ctx.fill();

    // Headband
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(ninja.x, ninja.y - 4, ninja.radius - 6, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(ninja.x - 6, ninja.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(ninja.x + 6, ninja.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
}

function render() {
    drawBackground();
    drawAnchors();
    drawRope();
    drawLetters();
    drawNinja();
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

// Start
setupLevel();
loop();
