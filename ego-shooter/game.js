// ============================================================
// BLUTSTEIN 3D - Raycasting Ego Shooter
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const deathScreen = document.getElementById('death-screen');
const winScreen = document.getElementById('win-screen');
const startBtn = document.getElementById('startBtn');

// ---- Constants ----
const TILE = 64;
const FOV = Math.PI / 3; // 60 degrees
const HALF_FOV = FOV / 2;
const MAX_DEPTH = 20;
const PLAYER_SPEED = 3;
const PLAYER_RUN_SPEED = 5;
const ROTATION_SPEED = 0.003;
const WALL_COLORS = {
    1: { r: 140, g: 140, b: 140 }, // gray stone
    2: { r: 120, g: 60, b: 30 },   // brown wood
    3: { r: 80, g: 0, b: 0 },      // dark red
    4: { r: 60, g: 80, b: 60 },    // green mossy
    5: { r: 100, g: 100, b: 120 }, // blue-gray metal
};

// ---- Map (1=wall, 0=floor, 2=wood, 3=red, 4=green, 5=metal, 9=door) ----
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,1,9,1,1,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,9,1,1,1,1],
    [1,1,9,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,1,1,1,9,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,1,9,1,1,1,0,0,0,0,0,9,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,1,1,1,1,9,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,9,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const MAP_ROWS = MAP.length;
const MAP_COLS = MAP[0].length;

// ---- Door state tracking ----
const doors = {};
function getDoorKey(r, c) { return `${r},${c}`; }

// Initialize doors from map
for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
        if (MAP[r][c] === 9) {
            doors[getDoorKey(r, c)] = { open: false, timer: 0, offset: 0 };
        }
    }
}

// ---- Canvas sizing ----
let W, H, NUM_RAYS;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    NUM_RAYS = Math.floor(W / 2); // one ray per 2 pixels for performance
}
resize();
window.addEventListener('resize', resize);

// ---- Game State ----
let gameState = 'menu'; // menu, playing, dead, won
let player = {
    x: 1.5 * TILE,
    y: 1.5 * TILE,
    angle: 0,
    health: 100,
    maxHealth: 100,
    ammo: 30,
    maxAmmo: 30,
    magazineSize: 8,
    magazine: 8,
    score: 0,
    bobPhase: 0,
    shooting: false,
    shootTimer: 0,
    reloading: false,
    reloadTimer: 0,
    damageFlash: 0,
    headBob: 0,
};

// ---- Enemies ----
let enemies = [];

function spawnEnemies() {
    enemies = [
        // Room 1 area
        { x: 9.5 * TILE, y: 2.5 * TILE, health: 40, maxHealth: 40, speed: 1.2, type: 'soldier', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 8 },
        { x: 8.5 * TILE, y: 8.5 * TILE, health: 40, maxHealth: 40, speed: 1.2, type: 'soldier', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 8 },
        // Middle area
        { x: 13.5 * TILE, y: 5.5 * TILE, health: 60, maxHealth: 60, speed: 1.0, type: 'heavy', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 12 },
        { x: 14.5 * TILE, y: 13.5 * TILE, health: 40, maxHealth: 40, speed: 1.5, type: 'soldier', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 8 },
        // Right side rooms
        { x: 20.5 * TILE, y: 2.5 * TILE, health: 60, maxHealth: 60, speed: 1.0, type: 'heavy', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 12 },
        { x: 20.5 * TILE, y: 7.5 * TILE, health: 40, maxHealth: 40, speed: 1.3, type: 'soldier', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 8 },
        { x: 21.5 * TILE, y: 10.5 * TILE, health: 40, maxHealth: 40, speed: 1.2, type: 'soldier', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 8 },
        // Bottom rooms
        { x: 3.5 * TILE, y: 12.5 * TILE, health: 40, maxHealth: 40, speed: 1.2, type: 'soldier', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 8 },
        { x: 5.5 * TILE, y: 16.5 * TILE, health: 80, maxHealth: 80, speed: 0.8, type: 'boss', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 18 },
        { x: 20.5 * TILE, y: 14.5 * TILE, health: 40, maxHealth: 40, speed: 1.3, type: 'soldier', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 8 },
        { x: 20.5 * TILE, y: 18.5 * TILE, health: 60, maxHealth: 60, speed: 1.0, type: 'heavy', alert: false, shootTimer: 0, dead: false, deathTimer: 0, damage: 12 },
    ];
}

// ---- Pickups ----
let pickups = [];

function spawnPickups() {
    pickups = [
        { x: 5.5 * TILE, y: 3.5 * TILE, type: 'health', value: 25, collected: false },
        { x: 9.5 * TILE, y: 9.5 * TILE, type: 'ammo', value: 15, collected: false },
        { x: 14.5 * TILE, y: 2.5 * TILE, type: 'health', value: 25, collected: false },
        { x: 2.5 * TILE, y: 8.5 * TILE, type: 'ammo', value: 15, collected: false },
        { x: 13.5 * TILE, y: 15.5 * TILE, type: 'health', value: 50, collected: false },
        { x: 20.5 * TILE, y: 5.5 * TILE, type: 'ammo', value: 15, collected: false },
        { x: 7.5 * TILE, y: 16.5 * TILE, type: 'health', value: 25, collected: false },
        { x: 18.5 * TILE, y: 18.5 * TILE, type: 'ammo', value: 15, collected: false },
    ];
}

// ---- Particles (bullet impacts, blood) ----
let particles = [];

function spawnParticle(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 30 + Math.random() * 30,
            color,
            size: 2 + Math.random() * 3,
        });
    }
}

// ---- Input handling ----
const keys = {};
let mouseX = 0;
let mouseLocked = false;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && (gameState === 'dead' || gameState === 'won')) {
        restartGame();
    }
});
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

document.addEventListener('mousemove', (e) => {
    if (mouseLocked && gameState === 'playing') {
        player.angle += e.movementX * ROTATION_SPEED;
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && gameState === 'playing') {
        shoot();
    }
});

document.addEventListener('pointerlockchange', () => {
    mouseLocked = document.pointerLockElement === canvas;
});

// ---- Start game ----
startBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    canvas.requestPointerLock();
    startGame();
});

function startGame() {
    player.x = 1.5 * TILE;
    player.y = 1.5 * TILE;
    player.angle = 0;
    player.health = 100;
    player.ammo = 30;
    player.magazine = 8;
    player.score = 0;
    player.shooting = false;
    player.shootTimer = 0;
    player.reloading = false;
    player.reloadTimer = 0;
    player.damageFlash = 0;

    // Reset doors
    for (const key in doors) {
        doors[key].open = false;
        doors[key].offset = 0;
        doors[key].timer = 0;
    }

    spawnEnemies();
    spawnPickups();
    particles = [];
    gameState = 'playing';
}

function restartGame() {
    deathScreen.style.display = 'none';
    winScreen.style.display = 'none';
    canvas.requestPointerLock();
    startGame();
}

// ---- Collision ----
function isWall(x, y) {
    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);
    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return true;
    const cell = MAP[row][col];
    if (cell === 9) {
        const door = doors[getDoorKey(row, col)];
        return door && !door.open;
    }
    return cell > 0;
}

function canSee(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(dist / 8);
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        const col = Math.floor(cx / TILE);
        const row = Math.floor(cy / TILE);
        if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
        const cell = MAP[row][col];
        if (cell > 0 && cell !== 9) return false;
        if (cell === 9) {
            const door = doors[getDoorKey(row, col)];
            if (door && !door.open) return false;
        }
    }
    return true;
}

// ---- Shooting ----
function shoot() {
    if (player.shooting || player.reloading) return;
    if (player.magazine <= 0) {
        reload();
        return;
    }
    player.shooting = true;
    player.shootTimer = 8;
    player.magazine--;

    // Raycast for hit detection
    const rayAngle = player.angle;
    const sin = Math.sin(rayAngle);
    const cos = Math.cos(rayAngle);

    let closestEnemy = null;
    let closestDist = Infinity;

    for (const enemy of enemies) {
        if (enemy.dead) continue;
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const enemyAngle = Math.atan2(dy, dx);
        let angleDiff = enemyAngle - player.angle;
        // Normalize
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        const enemyScreenWidth = (TILE / dist) * (W / (2 * Math.tan(HALF_FOV)));
        const halfAngle = Math.atan2(enemyScreenWidth / 2, W / 2);

        if (Math.abs(angleDiff) < halfAngle * 1.5 && dist < closestDist) {
            if (canSee(player.x, player.y, enemy.x, enemy.y)) {
                closestDist = dist;
                closestEnemy = enemy;
            }
        }
    }

    if (closestEnemy) {
        const damage = 15 + Math.random() * 10;
        closestEnemy.health -= damage;
        closestEnemy.alert = true;
        spawnParticle(closestEnemy.x, closestEnemy.y, '#ff0000', 5);

        if (closestEnemy.health <= 0) {
            closestEnemy.dead = true;
            closestEnemy.deathTimer = 60;
            player.score += closestEnemy.type === 'boss' ? 500 : closestEnemy.type === 'heavy' ? 200 : 100;
            // Alert nearby enemies
            for (const e of enemies) {
                if (!e.dead) {
                    const d = Math.sqrt((e.x - closestEnemy.x) ** 2 + (e.y - closestEnemy.y) ** 2);
                    if (d < 6 * TILE) e.alert = true;
                }
            }
        }
    }

    // Alert nearby enemies from gunshot
    for (const e of enemies) {
        if (!e.dead) {
            const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
            if (d < 10 * TILE) e.alert = true;
        }
    }
}

function reload() {
    if (player.reloading || player.ammo <= 0 || player.magazine >= player.magazineSize) return;
    player.reloading = true;
    player.reloadTimer = 45;
}

// ---- Open door ----
function tryOpenDoor() {
    const checkDist = 1.5 * TILE;
    const cx = player.x + Math.cos(player.angle) * checkDist;
    const cy = player.y + Math.sin(player.angle) * checkDist;
    const col = Math.floor(cx / TILE);
    const row = Math.floor(cy / TILE);
    if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS && MAP[row][col] === 9) {
        const key = getDoorKey(row, col);
        const door = doors[key];
        if (door && !door.open) {
            door.open = true;
            door.timer = 300; // auto-close timer
        }
    }
}

// ---- Update game logic ----
function update() {
    if (gameState !== 'playing') return;

    // Player movement
    let moveX = 0, moveY = 0;
    const speed = keys['shift'] ? PLAYER_RUN_SPEED : PLAYER_SPEED;

    if (keys['w']) {
        moveX += Math.cos(player.angle) * speed;
        moveY += Math.sin(player.angle) * speed;
    }
    if (keys['s']) {
        moveX -= Math.cos(player.angle) * speed;
        moveY -= Math.sin(player.angle) * speed;
    }
    if (keys['a']) {
        moveX += Math.cos(player.angle - Math.PI / 2) * speed;
        moveY += Math.sin(player.angle - Math.PI / 2) * speed;
    }
    if (keys['d']) {
        moveX += Math.cos(player.angle + Math.PI / 2) * speed;
        moveY += Math.sin(player.angle + Math.PI / 2) * speed;
    }

    // Collision detection with sliding
    const margin = 10;
    if (!isWall(player.x + moveX + margin * Math.sign(moveX), player.y)) {
        player.x += moveX;
    }
    if (!isWall(player.x, player.y + moveY + margin * Math.sign(moveY))) {
        player.y += moveY;
    }

    // Head bob
    if (moveX !== 0 || moveY !== 0) {
        player.bobPhase += 0.12;
        player.headBob = Math.sin(player.bobPhase) * 8;
    } else {
        player.headBob *= 0.9;
    }

    // Keyboard actions
    if (keys['r']) reload();
    if (keys['e']) { tryOpenDoor(); keys['e'] = false; }

    // Shooting timer
    if (player.shootTimer > 0) player.shootTimer--;
    if (player.shootTimer <= 0) player.shooting = false;

    // Reload timer
    if (player.reloading) {
        player.reloadTimer--;
        if (player.reloadTimer <= 0) {
            const needed = player.magazineSize - player.magazine;
            const loaded = Math.min(needed, player.ammo);
            player.magazine += loaded;
            player.ammo -= loaded;
            player.reloading = false;
        }
    }

    // Damage flash
    if (player.damageFlash > 0) player.damageFlash--;

    // Update doors
    for (const key in doors) {
        const door = doors[key];
        if (door.open) {
            door.offset = Math.min(door.offset + 2, TILE);
            door.timer--;
            if (door.timer <= 0) {
                // Check if player is in doorway
                const [r, c] = key.split(',').map(Number);
                const px = Math.floor(player.x / TILE);
                const py = Math.floor(player.y / TILE);
                if (px !== c || py !== r) {
                    door.open = false;
                }
            }
        } else {
            door.offset = Math.max(door.offset - 2, 0);
        }
    }

    // Update enemies
    for (const enemy of enemies) {
        if (enemy.dead) {
            if (enemy.deathTimer > 0) enemy.deathTimer--;
            continue;
        }

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Detection
        if (dist < 5 * TILE && canSee(enemy.x, enemy.y, player.x, player.y)) {
            enemy.alert = true;
        }

        if (enemy.alert) {
            // Move toward player
            if (dist > TILE * 1.2) {
                const angle = Math.atan2(dy, dx);
                const nx = enemy.x + Math.cos(angle) * enemy.speed;
                const ny = enemy.y + Math.sin(angle) * enemy.speed;
                if (!isWall(nx, enemy.y)) enemy.x = nx;
                if (!isWall(enemy.x, ny)) enemy.y = ny;
            }

            // Shoot at player
            if (dist < 12 * TILE && canSee(enemy.x, enemy.y, player.x, player.y)) {
                enemy.shootTimer--;
                if (enemy.shootTimer <= 0) {
                    // Hit chance based on distance
                    const accuracy = Math.max(0.2, 1 - dist / (12 * TILE));
                    if (Math.random() < accuracy) {
                        player.health -= enemy.damage;
                        player.damageFlash = 15;
                    }
                    enemy.shootTimer = 40 + Math.random() * 30;
                }
            }
        }
    }

    // Check pickups
    for (const pickup of pickups) {
        if (pickup.collected) continue;
        const dx = player.x - pickup.x;
        const dy = player.y - pickup.y;
        if (Math.sqrt(dx * dx + dy * dy) < TILE * 0.6) {
            if (pickup.type === 'health' && player.health < player.maxHealth) {
                player.health = Math.min(player.maxHealth, player.health + pickup.value);
                pickup.collected = true;
            } else if (pickup.type === 'ammo' && player.ammo < player.maxAmmo) {
                player.ammo = Math.min(player.maxAmmo, player.ammo + pickup.value);
                pickup.collected = true;
            }
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // Check death
    if (player.health <= 0) {
        gameState = 'dead';
        deathScreen.style.display = 'flex';
        document.exitPointerLock();
    }

    // Check win
    if (enemies.every(e => e.dead)) {
        gameState = 'won';
        winScreen.style.display = 'flex';
        document.exitPointerLock();
    }
}

// ---- Raycasting & Rendering ----
function castRay(angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    let dist = 0;
    const step = 1;
    let hitX, hitY, wallType = 1, side = 0;

    for (let i = 0; i < MAX_DEPTH * TILE; i += step) {
        dist = i;
        hitX = player.x + cos * i;
        hitY = player.y + sin * i;

        const col = Math.floor(hitX / TILE);
        const row = Math.floor(hitY / TILE);

        if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) break;

        const cell = MAP[row][col];
        if (cell > 0 && cell !== 9) {
            wallType = cell;
            // Determine side for shading
            const dx = hitX - (col + 0.5) * TILE;
            const dy = hitY - (row + 0.5) * TILE;
            side = Math.abs(dx) > Math.abs(dy) ? 0 : 1;
            break;
        }
        if (cell === 9) {
            const door = doors[getDoorKey(row, col)];
            if (door && door.offset < TILE) {
                wallType = 5;
                side = 0;
                break;
            }
        }
    }

    return { dist, wallType, side, hitX, hitY };
}

function render() {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H / 2);
    skyGrad.addColorStop(0, '#1a0a2e');
    skyGrad.addColorStop(1, '#2d1b4e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H / 2);

    // Floor gradient
    const floorGrad = ctx.createLinearGradient(0, H / 2, 0, H);
    floorGrad.addColorStop(0, '#333333');
    floorGrad.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, H / 2, W, H / 2);

    // ---- Raycasting walls ----
    const stripWidth = W / NUM_RAYS;
    const zBuffer = new Float32Array(NUM_RAYS);

    for (let i = 0; i < NUM_RAYS; i++) {
        const rayAngle = player.angle - HALF_FOV + (i / NUM_RAYS) * FOV;
        const result = castRay(rayAngle);

        // Fix fisheye
        const correctedDist = result.dist * Math.cos(rayAngle - player.angle);
        zBuffer[i] = correctedDist;

        const wallHeight = (TILE * H) / (correctedDist || 1);
        const wallTop = (H - wallHeight) / 2 + player.headBob;

        // Wall color with distance fog
        const wc = WALL_COLORS[result.wallType] || WALL_COLORS[1];
        const shade = result.side === 1 ? 0.7 : 1.0;
        const fog = Math.max(0, 1 - correctedDist / (MAX_DEPTH * TILE));
        const r = Math.floor(wc.r * shade * fog);
        const g = Math.floor(wc.g * shade * fog);
        const b = Math.floor(wc.b * shade * fog);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(i * stripWidth, wallTop, stripWidth + 1, wallHeight);

        // Wall top/bottom edge highlights
        ctx.fillStyle = `rgba(255,255,255,${0.05 * fog})`;
        ctx.fillRect(i * stripWidth, wallTop, stripWidth + 1, 2);
        ctx.fillStyle = `rgba(0,0,0,${0.1 * fog})`;
        ctx.fillRect(i * stripWidth, wallTop + wallHeight - 2, stripWidth + 1, 2);
    }

    // ---- Render sprites (enemies & pickups) ----
    const sprites = [];

    // Add enemies
    for (const enemy of enemies) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        sprites.push({ ...enemy, dx, dy, dist, angle, isEnemy: true });
    }

    // Add pickups
    for (const pickup of pickups) {
        if (pickup.collected) continue;
        const dx = pickup.x - player.x;
        const dy = pickup.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        sprites.push({ ...pickup, dx, dy, dist, angle, isEnemy: false });
    }

    // Sort back to front
    sprites.sort((a, b) => b.dist - a.dist);

    for (const sprite of sprites) {
        let angleDiff = sprite.angle - player.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        if (Math.abs(angleDiff) > HALF_FOV + 0.2) continue;

        const screenX = W / 2 + (angleDiff / HALF_FOV) * (W / 2);
        const spriteHeight = (TILE * H * 0.8) / (sprite.dist || 1);
        const spriteWidth = spriteHeight * 0.6;

        // Check z-buffer for occlusion
        const rayIndex = Math.floor((screenX / W) * NUM_RAYS);
        if (rayIndex >= 0 && rayIndex < NUM_RAYS && sprite.dist > zBuffer[rayIndex] + 10) continue;

        const fog = Math.max(0, 1 - sprite.dist / (MAX_DEPTH * TILE));

        if (sprite.isEnemy) {
            drawEnemy(sprite, screenX, spriteHeight, spriteWidth, fog);
        } else {
            drawPickup(sprite, screenX, spriteHeight * 0.4, fog);
        }
    }

    // ---- HUD ----
    drawHUD();

    // ---- Weapon ----
    drawWeapon();

    // ---- Crosshair ----
    drawCrosshair();

    // ---- Damage flash ----
    if (player.damageFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${player.damageFlash / 30})`;
        ctx.fillRect(0, 0, W, H);
    }

    // ---- Minimap ----
    drawMinimap();
}

function drawEnemy(enemy, screenX, height, width, fog) {
    const topY = H / 2 - height / 2 + player.headBob;

    if (enemy.dead) {
        // Dead enemy on floor
        const alpha = Math.max(0, enemy.deathTimer / 60) * fog;
        ctx.fillStyle = `rgba(120, 20, 20, ${alpha})`;
        ctx.fillRect(screenX - width / 2, topY + height * 0.6, width, height * 0.2);
        return;
    }

    // Body
    let bodyColor;
    if (enemy.type === 'boss') {
        bodyColor = `rgba(${Math.floor(180 * fog)}, ${Math.floor(30 * fog)}, ${Math.floor(30 * fog)}, 1)`;
    } else if (enemy.type === 'heavy') {
        bodyColor = `rgba(${Math.floor(60 * fog)}, ${Math.floor(60 * fog)}, ${Math.floor(100 * fog)}, 1)`;
    } else {
        bodyColor = `rgba(${Math.floor(80 * fog)}, ${Math.floor(100 * fog)}, ${Math.floor(60 * fog)}, 1)`;
    }

    // Torso
    ctx.fillStyle = bodyColor;
    ctx.fillRect(screenX - width / 2, topY + height * 0.2, width, height * 0.5);

    // Head
    const headSize = width * 0.5;
    ctx.fillStyle = `rgba(${Math.floor(200 * fog)}, ${Math.floor(160 * fog)}, ${Math.floor(130 * fog)}, 1)`;
    ctx.beginPath();
    ctx.arc(screenX, topY + height * 0.15, headSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (red when alert)
    if (enemy.alert) {
        ctx.fillStyle = `rgba(255, 0, 0, ${fog})`;
        ctx.beginPath();
        ctx.arc(screenX - headSize * 0.2, topY + height * 0.13, headSize * 0.1, 0, Math.PI * 2);
        ctx.arc(screenX + headSize * 0.2, topY + height * 0.13, headSize * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Legs
    ctx.fillStyle = `rgba(${Math.floor(50 * fog)}, ${Math.floor(50 * fog)}, ${Math.floor(50 * fog)}, 1)`;
    ctx.fillRect(screenX - width * 0.35, topY + height * 0.7, width * 0.25, height * 0.3);
    ctx.fillRect(screenX + width * 0.1, topY + height * 0.7, width * 0.25, height * 0.3);

    // Health bar
    if (enemy.health < enemy.maxHealth) {
        const barWidth = width;
        const barHeight = 4;
        const barY = topY - 10;
        ctx.fillStyle = `rgba(60, 0, 0, ${fog})`;
        ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);
        ctx.fillStyle = `rgba(255, 0, 0, ${fog})`;
        ctx.fillRect(screenX - barWidth / 2, barY, barWidth * (enemy.health / enemy.maxHealth), barHeight);
    }
}

function drawPickup(pickup, screenX, size, fog) {
    const y = H / 2 + size / 2 + player.headBob;
    const bobOffset = Math.sin(Date.now() / 300) * 5;

    if (pickup.type === 'health') {
        // Green cross
        ctx.fillStyle = `rgba(0, ${Math.floor(200 * fog)}, 0, ${fog})`;
        ctx.fillRect(screenX - size / 6, y - size / 2 + bobOffset, size / 3, size);
        ctx.fillRect(screenX - size / 2, y - size / 6 + bobOffset, size, size / 3);
        // Glow
        ctx.fillStyle = `rgba(0, 255, 0, ${fog * 0.2})`;
        ctx.beginPath();
        ctx.arc(screenX, y + bobOffset, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Yellow ammo box
        ctx.fillStyle = `rgba(${Math.floor(200 * fog)}, ${Math.floor(180 * fog)}, 0, ${fog})`;
        ctx.fillRect(screenX - size / 2, y - size / 3 + bobOffset, size, size * 0.6);
        ctx.fillStyle = `rgba(${Math.floor(150 * fog)}, ${Math.floor(130 * fog)}, 0, ${fog})`;
        ctx.fillRect(screenX - size / 2, y - size / 3 + bobOffset, size, size * 0.15);
    }
}

function drawHUD() {
    // Health bar
    const barW = 250;
    const barH = 25;
    const barX = 20;
    const barY = H - 50;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    // Health
    const healthPct = player.health / player.maxHealth;
    const healthColor = healthPct > 0.5 ? '#44ff44' : healthPct > 0.25 ? '#ffaa00' : '#ff4444';
    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY, barW * healthPct, barH);

    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${Math.ceil(player.health)}`, barX + 8, barY + 18);

    // Ammo display
    const ammoX = W - 200;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(ammoX - 10, barY - 10, 190, barH + 20);

    ctx.fillStyle = player.magazine > 0 ? '#ffcc00' : '#ff4444';
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(`${player.magazine}`, ammoX + 60, barY + 20);

    ctx.fillStyle = '#888888';
    ctx.font = 'bold 16px Courier New';
    ctx.fillText(`/ ${player.ammo}`, ammoX + 120, barY + 18);

    if (player.reloading) {
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 18px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('NACHLADEN...', W / 2, H - 100);
    }

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`PUNKTE: ${player.score}`, 20, 35);

    // Enemy counter
    const alive = enemies.filter(e => !e.dead).length;
    ctx.fillStyle = '#ff6666';
    ctx.fillText(`GEGNER: ${alive}`, 20, 60);
}

function drawWeapon() {
    const weaponW = 160;
    const weaponH = 200;
    let weaponX = W / 2 - weaponW / 2 + Math.sin(player.bobPhase) * 8;
    let weaponY = H - weaponH + Math.abs(Math.sin(player.bobPhase)) * 5;

    // Recoil
    if (player.shootTimer > 4) {
        weaponY -= (player.shootTimer - 4) * 5;
    }

    // Reload animation
    if (player.reloading) {
        weaponY += 60 * Math.sin((player.reloadTimer / 45) * Math.PI);
    }

    // Gun body
    ctx.fillStyle = '#444444';
    ctx.fillRect(weaponX + 60, weaponY + 40, 40, 120);

    // Barrel
    ctx.fillStyle = '#333333';
    ctx.fillRect(weaponX + 65, weaponY, 30, 60);

    // Barrel tip
    ctx.fillStyle = '#222222';
    ctx.fillRect(weaponX + 68, weaponY - 10, 24, 15);

    // Grip
    ctx.fillStyle = '#553322';
    ctx.beginPath();
    ctx.moveTo(weaponX + 60, weaponY + 130);
    ctx.lineTo(weaponX + 40, weaponY + 200);
    ctx.lineTo(weaponX + 70, weaponY + 200);
    ctx.lineTo(weaponX + 80, weaponY + 130);
    ctx.fill();

    // Muzzle flash
    if (player.shootTimer > 5) {
        const flashSize = 30 + Math.random() * 20;
        ctx.fillStyle = `rgba(255, 200, 50, ${(player.shootTimer - 5) / 3})`;
        ctx.beginPath();
        ctx.arc(weaponX + 80, weaponY - 15, flashSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 200, ${(player.shootTimer - 5) / 4})`;
        ctx.beginPath();
        ctx.arc(weaponX + 80, weaponY - 15, flashSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCrosshair() {
    const cx = W / 2;
    const cy = H / 2;
    const size = 12;
    const gap = 4;
    const thickness = 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = thickness;

    // Top
    ctx.beginPath();
    ctx.moveTo(cx, cy - gap);
    ctx.lineTo(cx, cy - size);
    ctx.stroke();

    // Bottom
    ctx.beginPath();
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + size);
    ctx.stroke();

    // Left
    ctx.beginPath();
    ctx.moveTo(cx - gap, cy);
    ctx.lineTo(cx - size, cy);
    ctx.stroke();

    // Right
    ctx.beginPath();
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + size, cy);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = 'rgba(255, 50, 50, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawMinimap() {
    const mapSize = 160;
    const mapX = W - mapSize - 15;
    const mapY = 15;
    const cellSize = mapSize / Math.max(MAP_COLS, MAP_ROWS);

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mapX - 2, mapY - 2, MAP_COLS * cellSize + 4, MAP_ROWS * cellSize + 4);

    // Walls
    for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
            const cell = MAP[r][c];
            if (cell > 0 && cell !== 9) {
                ctx.fillStyle = '#666666';
                ctx.fillRect(mapX + c * cellSize, mapY + r * cellSize, cellSize, cellSize);
            } else if (cell === 9) {
                const door = doors[getDoorKey(r, c)];
                ctx.fillStyle = door && door.open ? '#336633' : '#996633';
                ctx.fillRect(mapX + c * cellSize, mapY + r * cellSize, cellSize, cellSize);
            }
        }
    }

    // Pickups
    for (const pickup of pickups) {
        if (pickup.collected) continue;
        const px = mapX + (pickup.x / TILE) * cellSize;
        const py = mapY + (pickup.y / TILE) * cellSize;
        ctx.fillStyle = pickup.type === 'health' ? '#00ff00' : '#ffff00';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Enemies
    for (const enemy of enemies) {
        if (enemy.dead) continue;
        const ex = mapX + (enemy.x / TILE) * cellSize;
        const ey = mapY + (enemy.y / TILE) * cellSize;
        ctx.fillStyle = enemy.alert ? '#ff0000' : '#ff6600';
        ctx.beginPath();
        ctx.arc(ex, ey, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Player
    const px = mapX + (player.x / TILE) * cellSize;
    const py = mapY + (player.y / TILE) * cellSize;

    // View cone
    ctx.fillStyle = 'rgba(255, 255, 0, 0.15)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    const coneLen = 15;
    ctx.lineTo(
        px + Math.cos(player.angle - HALF_FOV) * coneLen,
        py + Math.sin(player.angle - HALF_FOV) * coneLen
    );
    ctx.lineTo(
        px + Math.cos(player.angle + HALF_FOV) * coneLen,
        py + Math.sin(player.angle + HALF_FOV) * coneLen
    );
    ctx.fill();

    // Player dot
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
}

// ---- Game loop ----
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
