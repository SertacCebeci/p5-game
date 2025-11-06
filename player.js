// Player movement, shooting, and rendering
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


