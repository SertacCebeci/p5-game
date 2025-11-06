// Enemy spawning, updating, and rendering
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


