// =========================
// Tower Tactics Game Engine
// =========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const profileNameEl = document.getElementById("profileName");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const tokenCountEl = document.getElementById("tokenCount");
const towerListEl = document.getElementById("towerList");
const enemyListEl = document.getElementById("enemyList");
const shopListEl = document.getElementById("shopList");
const achievementListEl = document.getElementById("achievementList");

// -------------------------
// Global state
// -------------------------

const gameState = {
  time: 0,
  levelIndex: 0,
  levels: [],
  path: [],
  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],
  placingTowerType: null,
  tokens: 0,
  achievements: {},
  shopItems: [],
  profile: {
    name: "Guest",
    loggedIn: false,
    titles: [],
    banners: [],
    equippedTitle: null,
    equippedBanner: null
  }
};

// -------------------------
// Utility
// -------------------------

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// -------------------------
// Backend stubs (Express/Python/Railway)
// -------------------------
// Replace these with real API calls later.

async function apiLogin(username, password) {
  // TODO: call Express backend deployed on Railway
  console.log("Login stub:", username);
  return { success: true, name: username, tokens: 50, titles: ["Novice Defender"], banners: [] };
}

async function apiLogout() {
  console.log("Logout stub");
  return { success: true };
}

async function apiSaveProfile(profile) {
  console.log("Save profile stub:", profile);
}

async function apiFetchAchievements() {
  // Could be served by Python microservice
  return [
    { id: "first_blood", name: "First Blood", desc: "Defeat your first enemy.", tokensReward: 5 },
    { id: "level_5_clear", name: "Tactician", desc: "Clear level 5.", tokensReward: 20 },
    { id: "perfect_run", name: "Flawless", desc: "Clear any level without leaks.", tokensReward: 30 }
  ];
}

async function apiFetchShopItems() {
  return [
    { id: "title_warlord", type: "title", name: "Warlord", cost: 40 },
    { id: "title_arcitect", type: "title", name: "Arcane Architect", cost: 60 },
    { id: "banner_neon", type: "banner", name: "Neon Grid Banner", cost: 50 }
  ];
}

// -------------------------
// Profile & UI wiring
// -------------------------

loginBtn.addEventListener("click", async () => {
  const username = prompt("Enter username:");
  const password = prompt("Enter password:");
  if (!username || !password) return;

  const res = await apiLogin(username, password);
  if (res.success) {
    gameState.profile.loggedIn = true;
    gameState.profile.name = res.name;
    gameState.tokens = res.tokens ?? 0;
    gameState.profile.titles = res.titles ?? [];
    gameState.profile.banners = res.banners ?? [];
    profileNameEl.textContent = res.name;
    tokenCountEl.textContent = gameState.tokens;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    await apiSaveProfile(gameState.profile);
  }
});

logoutBtn.addEventListener("click", async () => {
  const res = await apiLogout();
  if (res.success) {
    gameState.profile.loggedIn = false;
    gameState.profile.name = "Guest";
    profileNameEl.textContent = "Guest";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

// -------------------------
// Game content: path, levels, towers, enemies
// -------------------------

function initPath() {
  // Simple zig-zag path; later you can make this per-level
  gameState.path = [
    { x: 40, y: 80 },
    { x: 200, y: 80 },
    { x: 200, y: 220 },
    { x: 420, y: 220 },
    { x: 420, y: 120 },
    { x: 720, y: 120 },
    { x: 720, y: 420 },
    { x: 900, y: 420 }
  ];
}

const towerTypes = [
  {
    id: "arrow_tower",
    name: "Arrow Tower",
    desc: "Fast single-target tower.",
    cost: 10,
    range: 120,
    fireRate: 0.6,
    damage: 12,
    color: "#f5f5f5"
  },
  {
    id: "arcane_pulse",
    name: "Arcane Pulse",
    desc: "Medium speed, splash damage.",
    cost: 18,
    range: 150,
    fireRate: 1.2,
    damage: 20,
    splashRadius: 40,
    color: "#7f5dff"
  },
  {
    id: "railgun",
    name: "Railgun",
    desc: "Slow but massive piercing damage.",
    cost: 25,
    range: 220,
    fireRate: 2.5,
    damage: 60,
    pierce: 3,
    color: "#4fd1ff"
  }
];

const enemyTypes = [
  {
    id: "grunt",
    name: "Grunt",
    desc: "Basic enemy.",
    maxHp: 40,
    speed: 40,
    color: "#ff6b6b",
    tokenReward: 1
  },
  {
    id: "runner",
    name: "Runner",
    desc: "Fast but fragile.",
    maxHp: 30,
    speed: 80,
    color: "#ffd93b",
    tokenReward: 2
  },
  {
    id: "brute",
    name: "Brute",
    desc: "Slow, heavily armored.",
    maxHp: 120,
    speed: 25,
    color: "#c56cf0",
    tokenReward: 4
  },
  {
    id: "phantom",
    name: "Phantom",
    desc: "Phase-shifting enemy with brief invulnerability.",
    maxHp: 70,
    speed: 55,
    color: "#4fd1ff",
    tokenReward: 3
  }
];

function createLevels() {
  // 10 levels with increasing difficulty
  for (let i = 0; i < 10; i++) {
    const waves = [];
    const baseCount = 8 + i * 2;
    waves.push({ delay: 0, enemies: Array(baseCount).fill("grunt") });
    waves.push({ delay: 8, enemies: Array(Math.floor(baseCount * 0.6)).fill("runner") });
    if (i >= 2) waves.push({ delay: 16, enemies: Array(Math.floor(baseCount * 0.5)).fill("brute") });
    if (i >= 5) waves.push({ delay: 24, enemies: Array(Math.floor(baseCount * 0.4)).fill("phantom") });

    gameState.levels.push({
      id: `level_${i + 1}`,
      name: `Level ${i + 1}`,
      difficulty: i + 1,
      waves
    });
  }
}

// -------------------------
// UI lists
// -------------------------

function renderTowerList() {
  towerListEl.innerHTML = "";
  towerTypes.forEach(t => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div>
        <strong>${t.name}</strong><br/>
        <span style="font-size:11px;color:#9fd8ff;">${t.desc}</span>
      </div>
      <div>
        <div style="font-size:11px;">Cost: ${t.cost}</div>
        <button>Select</button>
      </div>
    `;
    row.querySelector("button").addEventListener("click", () => {
      gameState.placingTowerType = t;
    });
    towerListEl.appendChild(row);
  });
}

function renderEnemyList() {
  enemyListEl.innerHTML = "";
  enemyTypes.forEach(e => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div>
        <strong>${e.name}</strong><br/>
        <span style="font-size:11px;color:#9fd8ff;">${e.desc}</span>
      </div>
      <div style="font-size:11px;">
        HP: ${e.maxHp}<br/>
        Speed: ${e.speed}
      </div>
    `;
    enemyListEl.appendChild(row);
  });
}

async function initAchievementsAndShop() {
  const achievements = await apiFetchAchievements();
  const shopItems = await apiFetchShopItems();
  gameState.shopItems = shopItems;
  achievements.forEach(a => {
    gameState.achievements[a.id] = { ...a, unlocked: false };
  });

  achievementListEl.innerHTML = "";
  Object.values(gameState.achievements).forEach(a => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div>
        <strong>${a.name}</strong><br/>
        <span style="font-size:11px;color:#9fd8ff;">${a.desc}</span>
      </div>
      <div style="font-size:11px;">
        Reward: ${a.tokensReward} tokens
      </div>
    `;
    achievementListEl.appendChild(row);
  });

  shopListEl.innerHTML = "";
  shopItems.forEach(item => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong><br/>
        <span style="font-size:11px;color:#9fd8ff;">${item.type}</span>
      </div>
      <div>
        <div style="font-size:11px;">Cost: ${item.cost}</div>
        <button>Buy</button>
      </div>
    `;
    row.querySelector("button").addEventListener("click", () => {
      if (gameState.tokens >= item.cost) {
        gameState.tokens -= item.cost;
        tokenCountEl.textContent = gameState.tokens;
        if (item.type === "title") gameState.profile.titles.push(item.name);
        if (item.type === "banner") gameState.profile.banners.push(item.name);
        apiSaveProfile(gameState.profile);
      } else {
        alert("Not enough tokens!");
      }
    });
    shopListEl.appendChild(row);
  });
}

// -------------------------
// Game entities
// -------------------------

class Enemy {
  constructor(typeId) {
    const def = enemyTypes.find(e => e.id === typeId);
    this.def = def;
    this.hp = def.maxHp;
    this.speed = def.speed;
    this.pathIndex = 0;
    this.progress = 0;
    this.x = gameState.path[0].x;
    this.y = gameState.path[0].y;
    this.phaseTimer = 0;
    this.alive = true;
  }

  update(dt) {
    if (!this.alive) return;

    // Phantom phase-shift
    if (this.def.id === "phantom") {
      this.phaseTimer += dt;
      if (this.phaseTimer > 3) this.phaseTimer = 0;
    }

    const current = gameState.path[this.pathIndex];
    const next = gameState.path[this.pathIndex + 1];
    if (!next) {
      // Reached end
      this.alive = false;
      // TODO: leak damage to player HP
      return;
    }

    const segmentLength = distance(current, next);
    const move = (this.speed * dt) / segmentLength;
    this.progress += move;
    if (this.progress >= 1) {
      this.pathIndex++;
      this.progress = 0;
      this.x = next.x;
      this.y = next.y;
    } else {
      this.x = lerp(current.x, next.x, this.progress);
      this.y = lerp(current.y, next.y, this.progress);
    }
  }

  takeDamage(amount) {
    // Phantom invulnerability window
    if (this.def.id === "phantom" && this.phaseTimer < 1.2) {
      return;
    }
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
      gameState.tokens += this.def.tokenReward;
      tokenCountEl.textContent = gameState.tokens;
      spawnParticles(this.x, this.y, this.def.color);
      unlockAchievement("first_blood");
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Glow
    const gradient = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
    gradient.addColorStop(0, this.def.color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = this.def.color;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "#111";
    ctx.fillRect(-12, -18, 24, 4);
    ctx.fillStyle = "#4fd1ff";
    const hpRatio = Math.max(this.hp / this.def.maxHp, 0);
    ctx.fillRect(-12, -18, 24 * hpRatio, 4);

    ctx.restore();
  }
}

class Tower {
  constructor(typeDef, x, y) {
    this.def = typeDef;
    this.x = x;
    this.y = y;
    this.cooldown = 0;
  }

  update(dt) {
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      const target = findTarget(this);
      if (target) {
        this.cooldown = this.def.fireRate;
        fireProjectile(this, target);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Base
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Tower body
    ctx.fillStyle = this.def.color;
    ctx.beginPath();
    ctx.rect(-8, -18, 16, 24);
    ctx.fill();

    // Range circle (subtle)
    ctx.strokeStyle = "rgba(79,209,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, this.def.range, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

class Projectile {
  constructor(tower, target) {
    this.tower = tower;
    this.target = target;
    this.x = tower.x;
    this.y = tower.y;
    this.speed = 260;
    this.alive = true;
  }

  update(dt) {
    if (!this.alive || !this.target.alive) {
      this.alive = false;
      return;
    }
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const move = this.speed * dt;
    if (move >= dist) {
      this.x = this.target.x;
      this.y = this.target.y;
      this.hit();
    } else {
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }
  }

  hit() {
    this.alive = false;
    const def = this.tower.def;
    if (def.splashRadius) {
      gameState.enemies.forEach(e => {
        if (e.alive && distance(e, this) <= def.splashRadius) {
          e.takeDamage(def.damage);
        }
      });
    } else {
      this.target.takeDamage(def.damage);
    }
    spawnParticles(this.x, this.y, def.color);
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.tower.def.color;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = randRange(-80, 80);
    this.vy = randRange(-80, 80);
    this.life = randRange(0.3, 0.7);
    this.color = color;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// -------------------------
// Combat helpers
// -------------------------

function findTarget(tower) {
  let best = null;
  let bestDist = Infinity;
  gameState.enemies.forEach(e => {
    if (!e.alive) return;
    const d = distance({ x: tower.x, y: tower.y }, e);
    if (d <= tower.def.range && d < bestDist) {
      bestDist = d;
      best = e;
    }
  });
  return best;
}

function fireProjectile(tower, target) {
  gameState.projectiles.push(new Projectile(tower, target));
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 12; i++) {
    gameState.particles.push(new Particle(x, y, color));
  }
}

// -------------------------
// Achievements
// -------------------------

function unlockAchievement(id) {
  const a = gameState.achievements[id];
  if (!a || a.unlocked) return;
  a.unlocked = true;
  gameState.tokens += a.tokensReward;
  tokenCountEl.textContent = gameState.tokens;
  apiSaveProfile(gameState.profile);
  // Simple toast
  alert(`Achievement unlocked: ${a.name} (+${a.tokensReward} tokens)`);
}

// -------------------------
// Level management
// -------------------------

function startLevel(index) {
  gameState.levelIndex = index;
  gameState.enemies = [];
  gameState.projectiles = [];
  gameState.particles = [];
  gameState.time = 0;
}

function spawnEnemiesForLevel(dt) {
  const level = gameState.levels[gameState.levelIndex];
  if (!level) return;
  gameState.time += dt;

  level.waves.forEach(wave => {
    if (!wave.spawned && gameState.time >= wave.delay) {
      wave.spawned = true;
      wave.enemies.forEach((typeId, i) => {
        setTimeout(() => {
          gameState.enemies.push(new Enemy(typeId));
        }, i * 400);
      });
    }
  });

  const allSpawned = level.waves.every(w => w.spawned);
  const allDead = gameState.enemies.every(e => !e.alive);
  if (allSpawned && allDead && gameState.enemies.length > 0) {
    // Level clear
    if (gameState.levelIndex === 4) unlockAchievement("level_5_clear");
    // Next level
    if (gameState.levelIndex < gameState.levels.length - 1) {
      startLevel(gameState.levelIndex + 1);
    }
  }
}

// -------------------------
// Input: placing towers
// -------------------------

canvas.addEventListener("click", e => {
  if (!gameState.placingTowerType) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

  if (gameState.tokens < gameState.placingTowerType.cost) {
    alert("Not enough tokens to place this tower.");
    return;
  }

  gameState.tokens -= gameState.placingTowerType.cost;
  tokenCountEl.textContent = gameState.tokens;
  gameState.towers.push(new Tower(gameState.placingTowerType, x, y));
});

// -------------------------
// Rendering
// -------------------------

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Subtle grid
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < canvas.width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Path glow
  ctx.save();
  ctx.strokeStyle = "rgba(79,209,255,0.4)";
  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.beginPath();
  gameState.path.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.restore();

  // Path core
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  gameState.path.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.restore();
}

function render() {
  drawBackground();

  gameState.towers.forEach(t => t.draw(ctx));
  gameState.enemies.forEach(e => e.draw(ctx));
  gameState.projectiles.forEach(p => p.draw(ctx));
  gameState.particles.forEach(p => p.draw(ctx));
}

// -------------------------
// Main loop
// -------------------------

let lastTime = performance.now();

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  spawnEnemiesForLevel(dt);

  gameState.towers.forEach(t => t.update(dt));
  gameState.enemies.forEach(e => e.update(dt));
  gameState.projectiles.forEach(p => p.update(dt));
  gameState.particles.forEach(p => p.update(dt));

  gameState.projectiles = gameState.projectiles.filter(p => p.alive);
  gameState.particles = gameState.particles.filter(p => p.life > 0);
  gameState.enemies = gameState.enemies.filter(e => e.alive || e.hp > 0);

  render();
  requestAnimationFrame(loop);
}

// -------------------------
// Init
// -------------------------

function init() {
  initPath();
  createLevels();
  renderTowerList();
  renderEnemyList();
  initAchievementsAndShop();
  startLevel(0);
  requestAnimationFrame(loop);
}

init();
