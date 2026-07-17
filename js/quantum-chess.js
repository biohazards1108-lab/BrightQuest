// quantum-chess.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const statusDisplay = document.getElementById("statusDisplay");

const TILE = 80;
const BOARD_SIZE = 8;

let board = [];
let selected = null;
let turn = "white";
let portals = [];

// Pieces
const PIECES = {
    white: ["R", "N", "B", "Q", "K", "B", "N", "R"],
    black: ["R", "N", "B", "Q", "K", "B", "N", "R"]
};

// Initialize board
function initBoard() {
    board = [];

    // Black pieces
    board.push(PIECES.black.map(p => ({ p, c: "black" })));
    board.push(Array(8).fill(null).map(() => ({ p: "P", c: "black" })));

    // Empty rows
    for (let i = 0; i < 4; i++) {
        board.push(Array(8).fill(null));
    }

    // White pieces
    board.push(Array(8).fill(null).map(() => ({ p: "P", c: "white" })));
    board.push(PIECES.white.map(p => ({ p, c: "white" })));

    // Generate random portals
    portals = [];
    for (let i = 0; i < 4; i++) {
        portals.push({
            x: Math.floor(Math.random() * 8),
            y: Math.floor(Math.random() * 8)
        });
    }
}

initBoard();

// Draw board
function drawBoard() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#222" : "#333";
            ctx.fillRect(x * TILE, y * TILE, TILE, TILE);

            // Portal tile
            if (portals.some(p => p.x === x && p.y === y)) {
                ctx.fillStyle = "rgba(0,255,255,0.3)";
                ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
            }

            // Selected tile
            if (selected && selected.x === x && selected.y === y) {
                ctx.fillStyle = "rgba(255,255,0,0.3)";
                ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
            }

            // Piece
            const piece = board[y][x];
            if (piece) {
                ctx.fillStyle = piece.c === "white" ? "#fff" : "#ff0077";
                ctx.font = "40px Nunito";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(piece.p, x * TILE + TILE / 2, y * TILE + TILE / 2);
            }
        }
    }
}

// Movement rules (simplified)
function getMoves(x, y) {
    const piece = board[y][x];
    if (!piece) return [];

    const moves = [];
    const dirs = {
        R: [[1,0],[-1,0],[0,1],[0,-1]],
        B: [[1,1],[-1,1],[1,-1],[-1,-1]],
        Q: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]],
        K: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]],
        N: [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]
    };

    if (piece.p === "P") {
        const dir = piece.c === "white" ? -1 : 1;
        const ny = y + dir;

        if (ny >= 0 && ny < 8 && !board[ny][x]) moves.push({ x, y: ny });

        // Capture
        if (x > 0 && board[ny][x - 1] && board[ny][x - 1].c !== piece.c)
            moves.push({ x: x - 1, y: ny });

        if (x < 7 && board[ny][x + 1] && board[ny][x + 1].c !== piece.c)
            moves.push({ x: x + 1, y: ny });

        return moves;
    }

    const vectors = dirs[piece.p];
    for (const [dx, dy] of vectors) {
        let nx = x + dx;
        let ny = y + dy;

        while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
            if (!board[ny][nx]) {
                moves.push({ x: nx, y: ny });
            } else {
                if (board[ny][nx].c !== piece.c)
                    moves.push({ x: nx, y: ny });
                break;
            }

            if (["K", "N"].includes(piece.p)) break;

            nx += dx;
            ny += dy;
        }
    }

    return moves;
}

// Portal teleport
function applyPortal(x, y) {
    const portal = portals.find(p => p.x === x && p.y === y);
    if (!portal) return { x, y };

    const other = portals[Math.floor(Math.random() * portals.length)];
    return { x: other.x, y: other.y };
}

// Handle click
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE);
    const y = Math.floor((e.clientY - rect.top) / TILE);

    const piece = board[y][x];

    if (selected) {
        const moves = getMoves(selected.x, selected.y);
        const valid = moves.some(m => m.x === x && m.y === y);

        if (valid) {
            const teleport = applyPortal(x, y);

            board[teleport.y][teleport.x] = board[selected.y][selected.x];
            board[selected.y][selected.x] = null;

            // Win condition
            if (board[teleport.y][teleport.x].p === "K" &&
                board[teleport.y][teleport.x].c === "black") {
                statusDisplay.textContent = "You Win!";
            }

            turn = turn === "white" ? "black" : "white";
        }

        selected = null;
    } else {
        if (piece && piece.c === turn) {
            selected = { x, y };
        }
    }

    drawBoard();
});

// Initial draw
drawBoard();
