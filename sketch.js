// Simplified "Magic Survival" style game with basic shapes
// Controls: WASD/Arrows to move, Mouse click or keys [1-3] to pick upgrades, R to restart on game over

let game;
let input;
let rngSeed;

function setup() {
  createCanvas(960, 540);
  resetGame();
}

function resetGame() {
  rngSeed = floor(random(1e9));
  randomSeed(rngSeed);
  noiseSeed(rngSeed);

  game = {
    state: 'playing', // 'playing' | 'levelup' | 'gameover'
    frame: 0,
    timeSeconds: 0,
    enemies: [],
    projectiles: [],
    orbs: [],
    blades: {
      count: 0,
      radius: 40,
      damage: 6,
      hitCooldownFrames: 18
    },
    spawn: {
      baseInterval: 70,
      minInterval: 18,
      interval: 70,
      lastSpawnFrame: 0,
      difficulty: 0 // increases slowly over time
    },
    player: {
      x: width / 2,
      y: height / 2,
      radius: 14,
      speed: 3,
      color: color(30, 144, 255),
      hp: 100,
      maxHp: 100,
      iframes: 0,
      fireCooldown: 0,
      fireCooldownMax: 30,
      damage: 14,
      bulletSpeed: 7,
      pierce: 0,
      level: 1,
      exp: 0,
      expToLevel: 30
    },
    upgrades: { // current modifiers
      rapidFireStacks: 0,
      pierce: 0,
      damageMult: 1.0
    },
    pendingChoices: []
  };

  input = {
    up: false, down: false, left: false, right: false
  };
}

function draw() {
  background(20);
  if (game.state === 'playing') {
    updateGame();
  }
  renderGame();
  game.frame++;
  game.timeSeconds = game.frame / 60;
}

function updateGame() {
  handleInput();
  autoShoot();
  updateProjectiles();
  maybeSpawnEnemies();
  updateEnemies();
  updateOrbs();
  updateBlades();
  checkLevelUp();
  if (game.player.hp <= 0 && game.state !== 'gameover') {
    game.state = 'gameover';
  }
}

function handleInput() {
  const p = game.player;
  let vx = 0, vy = 0;
  if (input.left) vx -= 1;
  if (input.right) vx += 1;
  if (input.up) vy -= 1;
  if (input.down) vy += 1;
  if (vx !== 0 || vy !== 0) {
    const mag = sqrt(vx * vx + vy * vy);
    vx /= mag; vy /= mag;
    p.x += vx * p.speed;
    p.y += vy * p.speed;
  }
  p.x = constrain(p.x, p.radius, width - p.radius);
  p.y = constrain(p.y, p.radius, height - p.radius);
  if (game.player.iframes > 0) game.player.iframes--;
  if (game.player.fireCooldown > 0) game.player.fireCooldown--;
}

function autoShoot() {
  const p = game.player;
  if (game.enemies.length === 0) return;
  if (p.fireCooldown > 0) return;
  let nearest = null;
  let bestDist = Infinity;
  for (const e of game.enemies) {
    const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
    if (d2 < bestDist) {
      bestDist = d2;
      nearest = e;
    }
  }
  if (!nearest) return;
  const dx = nearest.x - p.x;
  const dy = nearest.y - p.y;
  const d = sqrt(dx * dx + dy * dy) || 1;
  const vx = (dx / d) * p.bulletSpeed;
  const vy = (dy / d) * p.bulletSpeed;

  const proj = {
    x: p.x,
    y: p.y,
    vx,
    vy,
    radius: 6,
    damage: round(p.damage * game.upgrades.damageMult),
    pierce: p.pierce + game.upgrades.pierce,
    alive: true,
    color: color(255, 235, 140)
  };
  game.projectiles.push(proj);

  const base = p.fireCooldownMax;
  const mult = 1 / (1 + 0.18 * game.upgrades.rapidFireStacks);
  p.fireCooldown = max(6, round(base * mult));
}

function updateProjectiles() {
  for (const pr of game.projectiles) {
    if (!pr.alive) continue;
    pr.x += pr.vx;
    pr.y += pr.vy;
    if (pr.x < -20 || pr.x > width + 20 || pr.y < -20 || pr.y > height + 20) {
      pr.alive = false;
      continue;
    }
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const distSq = (e.x - pr.x) ** 2 + (e.y - pr.y) ** 2;
      if (distSq <= (e.radius + pr.radius) ** 2) {
        e.hp -= pr.damage;
        if (e.hp <= 0) {
          e.alive = false;
          dropOrb(e.x, e.y, e.value);
        }
        if (pr.pierce > 0) {
          pr.pierce--;
        } else {
          pr.alive = false;
          break;
        }
      }
    }
  }
  game.projectiles = game.projectiles.filter(p => p.alive);
}

function maybeSpawnEnemies() {
  const s = game.spawn;
  // Scale difficulty over time
  s.difficulty = min(1.0, game.timeSeconds / 180); // reaches max at 3 minutes
  const targetInterval = lerp(s.baseInterval, s.minInterval, s.difficulty);
  s.interval = max(s.minInterval, targetInterval);
  if (game.frame - s.lastSpawnFrame >= s.interval) {
    s.lastSpawnFrame = game.frame;
    const pack = 1 + floor(random(1 + s.difficulty * 4));
    for (let i = 0; i < pack; i++) spawnEnemy();
  }
}

function spawnEnemy() {
  const margin = 30;
  const edge = floor(random(4));
  let x = 0, y = 0;
  if (edge === 0) { x = random(-margin, 0); y = random(height); }
  else if (edge === 1) { x = random(width); y = random(-margin, 0); }
  else if (edge === 2) { x = random(width, width + margin); y = random(height); }
  else { x = random(width); y = random(height, height + margin); }
  const baseHp = 20 + game.timeSeconds * 2.5;
  const baseSpeed = 1.1 + min(1.4, game.timeSeconds / 90);
  const enemy = {
    x, y,
    radius: 12,
    speed: baseSpeed,
    hp: round(baseHp),
    value: 4 + floor(random(3)), // exp value
    alive: true,
    color: color(180, 70, 70),
    lastHitPlayerFrame: -999,
    lastBladeHitFrame: -999
  };
  game.enemies.push(enemy);
}

function updateEnemies() {
  const p = game.player;
  for (const e of game.enemies) {
    if (!e.alive) continue;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const d = sqrt(dx * dx + dy * dy) || 1;
    e.x += (dx / d) * e.speed;
    e.y += (dy / d) * e.speed;
    // Player collision
    const sumR = e.radius + p.radius;
    if ((p.x - e.x) ** 2 + (p.y - e.y) ** 2 <= sumR * sumR) {
      if (game.frame - e.lastHitPlayerFrame > 28 && p.iframes === 0) {
        p.hp -= 10;
        p.iframes = 24;
        e.lastHitPlayerFrame = game.frame;
        const nx = (p.x - e.x) / (sqrt((p.x - e.x) ** 2 + (p.y - e.y) ** 2) || 1);
        const ny = (p.y - e.y) / (sqrt((p.x - e.x) ** 2 + (p.y - e.y) ** 2) || 1);
        p.x += nx * 10;
        p.y += ny * 10;
      }
    }
  }
  game.enemies = game.enemies.filter(e => e.alive || inBounds(e.x, e.y, -40, -40, width + 40, height + 40));
}

function dropOrb(x, y, value) {
  game.orbs.push({
    x, y,
    radius: 6,
    value,
    color: color(100, 200, 255),
    alive: true
  });
}

function updateOrbs() {
  const p = game.player;
  for (const o of game.orbs) {
    if (!o.alive) continue;
    const dx = p.x - o.x;
    const dy = p.y - o.y;
    const d = sqrt(dx * dx + dy * dy) || 1;
    const attractRange = 90;
    if (d < attractRange) {
      const s = map(d, 0, attractRange, 4, 1);
      o.x += (dx / d) * s;
      o.y += (dy / d) * s;
    }
    const sumR = o.radius + p.radius;
    if ((p.x - o.x) ** 2 + (p.y - o.y) ** 2 <= sumR * sumR) {
      o.alive = false;
      p.exp += o.value;
    }
  }
  game.orbs = game.orbs.filter(o => o.alive);
}

function updateBlades() {
  if (game.blades.count <= 0) return;
  const p = game.player;
  const b = game.blades;
  for (let i = 0; i < game.enemies.length; i++) {
    const e = game.enemies[i];
    if (!e.alive) continue;
    // Check against each blade's position
    let hit = false;
    for (let k = 0; k < b.count; k++) {
      const angle = (game.frame * 0.06) + (TWO_PI * k / b.count);
      const bx = p.x + cos(angle) * b.radius;
      const by = p.y + sin(angle) * b.radius;
      const sumR = e.radius + 6;
      if ((bx - e.x) ** 2 + (by - e.y) ** 2 <= sumR * sumR) {
        hit = true; break;
      }
    }
    if (hit && (game.frame - e.lastBladeHitFrame > b.hitCooldownFrames)) {
      e.hp -= b.damage;
      e.lastBladeHitFrame = game.frame;
      if (e.hp <= 0) {
        e.alive = false;
        dropOrb(e.x, e.y, e.value);
      }
    }
  }
}

function checkLevelUp() {
  const p = game.player;
  if (p.exp >= p.expToLevel && game.state === 'playing') {
    p.exp -= p.expToLevel;
    p.level++;
    p.expToLevel = round(p.expToLevel * 1.25 + 10);
    game.pendingChoices = rollUpgradeChoices();
    game.state = 'levelup';
  }
}

function rollUpgradeChoices() {
  const pool = [
    { id: 'rapidFire', name: 'Rapid Fire', desc: 'Faster shooting (+18%)', apply: () => game.upgrades.rapidFireStacks++ },
    { id: 'pierce', name: 'Pierce', desc: '+1 bullet pierce', apply: () => game.upgrades.pierce++ },
    { id: 'damageUp', name: 'Damage Up', desc: '+20% bullet damage', apply: () => game.upgrades.damageMult *= 1.2 },
    { id: 'orbitBlade', name: 'Orbit Blade', desc: '+1 rotating blade', apply: () => game.blades.count = min(6, game.blades.count + 1) }
  ];
  const picks = [];
  for (let i = 0; i < 3; i++) {
    picks.push(random(pool));
  }
  return picks;
}

function chooseUpgrade(index) {
  const choice = game.pendingChoices[index];
  if (!choice) return;
  choice.apply();
  game.pendingChoices = [];
  game.state = 'playing';
}

function renderGame() {
  renderOrbs();
  renderEnemies();
  renderProjectiles();
  renderPlayer();
  renderBlades();
  renderUI();
  if (game.state === 'levelup') {
    renderLevelUpModal();
  } else if (game.state === 'gameover') {
    renderGameOver();
  }
}

function renderPlayer() {
  const p = game.player;
  noStroke();
  fill(p.color);
  circle(p.x, p.y, p.radius * 2);
  // brief blink on i-frames
  if (p.iframes % 6 < 3 && p.iframes > 0) {
    stroke(255);
    noFill();
    circle(p.x, p.y, p.radius * 2 + 6);
  }
}

function renderProjectiles() {
  noStroke();
  for (const pr of game.projectiles) {
    if (!pr.alive) continue;
    fill(pr.color);
    circle(pr.x, pr.y, pr.radius * 2);
  }
}

function renderEnemies() {
  noStroke();
  for (const e of game.enemies) {
    if (!e.alive) continue;
    fill(e.color);
    circle(e.x, e.y, e.radius * 2);
    // hp bar
    const w = 20;
    const h = 4;
    const pct = constrain(e.hp / max(1, 20 + game.timeSeconds * 2.5), 0, 1);
    fill(255, 50);
    rect(e.x - w / 2, e.y - e.radius - 10, w, h);
    fill(120, 220, 120);
    rect(e.x - w / 2, e.y - e.radius - 10, w * pct, h);
  }
}

function renderOrbs() {
  noStroke();
  for (const o of game.orbs) {
    if (!o.alive) continue;
    fill(o.color);
    circle(o.x, o.y, o.radius * 2);
  }
}

function renderBlades() {
  if (game.blades.count <= 0) return;
  const p = game.player;
  stroke(180, 220, 255);
  strokeWeight(3);
  noFill();
  for (let k = 0; k < game.blades.count; k++) {
    const angle = (game.frame * 0.06) + (TWO_PI * k / game.blades.count);
    const bx = p.x + cos(angle) * game.blades.radius;
    const by = p.y + sin(angle) * game.blades.radius;
    line(p.x, p.y, bx, by);
    noStroke();
    fill(200, 240, 255);
    circle(bx, by, 12);
    stroke(180, 220, 255);
    noFill();
  }
}

function renderUI() {
  const p = game.player;
  noStroke();
  // HP bar
  const hpW = 240, hpH = 14, hpX = 20, hpY = 20;
  fill(60);
  rect(hpX, hpY, hpW, hpH, 4);
  fill(220, 70, 70);
  const hpPct = constrain(p.hp / p.maxHp, 0, 1);
  rect(hpX, hpY, hpW * hpPct, hpH, 4);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`HP: ${max(0, p.hp)} / ${p.maxHp}`, hpX + 6, hpY + hpH / 2);

  // EXP bar
  const xpW = width - 40, xpH = 10, xpX = 20, xpY = height - 24;
  fill(60);
  rect(xpX, xpY, xpW, xpH, 4);
  fill(100, 200, 255);
  const xpPct = constrain(p.exp / p.expToLevel, 0, 1);
  rect(xpX, xpY, xpW * xpPct, xpH, 4);
  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text(`Level ${p.level}`, width / 2, xpY - 4);

  // Info text
  textAlign(LEFT, TOP);
  textSize(12);
  fill(200);
  text(`Pierce: ${p.pierce + game.upgrades.pierce}  DMG x${nf(game.upgrades.damageMult, 1, 2)}  FireRate +${round(game.upgrades.rapidFireStacks * 18)}%  Blades: ${game.blades.count}`, 20, 42);
}

function renderLevelUpModal() {
  fill(0, 180);
  rect(0, 0, width, height);
  const panelW = min(680, width - 80);
  const panelH = 240;
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;
  fill(30);
  rect(px, py, panelW, panelH, 10);
  fill(255);
  textAlign(CENTER, TOP);
  textSize(18);
  text('Choose an upgrade', width / 2, py + 16);

  const num = game.pendingChoices.length;
  const gap = 20;
  const cardW = (panelW - gap * (num + 1)) / num;
  const cardH = panelH - 70;
  for (let i = 0; i < num; i++) {
    const cx = px + gap + i * (cardW + gap);
    const cy = py + 50;
    fill(45);
    rect(cx, cy, cardW, cardH, 8);
    const choice = game.pendingChoices[i];
    fill(255);
    textAlign(CENTER, TOP);
    textSize(16);
    text(choice.name, cx + cardW / 2, cy + 10);
    textSize(12);
    fill(200);
    text(choice.desc, cx + cardW / 2, cy + 40);
    // hint
    fill(160);
    textSize(11);
    text(`Click or press ${i + 1}`, cx + cardW / 2, cy + cardH - 22);
  }
}

function renderGameOver() {
  fill(0, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text('Game Over', width / 2, height / 2 - 20);
  textSize(14);
  text('Press R to restart', width / 2, height / 2 + 16);
}

function inBounds(x, y, minX, minY, maxX, maxY) {
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

function keyPressed() {
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) input.up = true;
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) input.down = true;
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) input.left = true;
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) input.right = true;

  if (game.state === 'levelup') {
    if (key === '1') chooseUpgrade(0);
    if (key === '2') chooseUpgrade(1);
    if (key === '3') chooseUpgrade(2);
  }
  if (game.state === 'gameover' && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

function keyReleased() {
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) input.up = false;
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) input.down = false;
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) input.left = false;
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) input.right = false;
}

function mousePressed() {
  if (game.state !== 'levelup') return;
  const panelW = min(680, width - 80);
  const panelH = 240;
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;
  const num = game.pendingChoices.length;
  const gap = 20;
  const cardW = (panelW - gap * (num + 1)) / num;
  const cardH = panelH - 70;
  for (let i = 0; i < num; i++) {
    const cx = px + gap + i * (cardW + gap);
    const cy = py + 50;
    if (mouseX >= cx && mouseX <= cx + cardW && mouseY >= cy && mouseY <= cy + cardH) {
      chooseUpgrade(i);
      break;
    }
  }
}
