// Magic Blades: update loop, rendering, and stats
function updateBlades() {
  const lvl = game.spells && game.spells.blades ? game.spells.blades.level : 0;
  if (lvl <= 0) return;
  const p = game.player;
  const b = getBladesStats(lvl);
  for (let i = 0; i < game.enemies.length; i++) {
    const e = game.enemies[i];
    if (!e.alive) continue;
    // Check against each blade's position
    let hit = false;
    for (let k = 0; k < b.count; k++) {
      const angle = game.frame * b.rotationSpeed + (TWO_PI * k) / b.count;
      const bx = p.x + cos(angle) * b.radiusFromPlayer;
      const by = p.y + sin(angle) * b.radiusFromPlayer;
      const sumR = e.radius + b.bladeCircleRadius;
      if ((bx - e.x) ** 2 + (by - e.y) ** 2 <= sumR * sumR) {
        hit = true;
        break;
      }
    }
    // Use module-scoped cooldown tracking without requiring enemy initialization
    const lastHitFrame = e._lastMagicBladesHitFrame ?? -1e9;
    if (hit && game.frame - lastHitFrame > b.hitCooldownFrames) {
      damageEnemy(e, b.damage);
      e._lastMagicBladesHitFrame = game.frame;
    }
  }
}

function renderBlades() {
  const lvl = game.spells && game.spells.blades ? game.spells.blades.level : 0;
  if (lvl <= 0) return;
  const p = game.player;
  const b = getBladesStats(lvl);
  stroke(180, 220, 255);
  strokeWeight(3);
  noFill();
  for (let k = 0; k < b.count; k++) {
    const angle = game.frame * b.rotationSpeed + (TWO_PI * k) / b.count;
    const bx = p.x + cos(angle) * b.radiusFromPlayer;
    const by = p.y + sin(angle) * b.radiusFromPlayer;
    noStroke();
    fill(200, 240, 255);
    circle(bx, by, b.bladeCircleRadius * 2);
    stroke(180, 220, 255);
    noFill();
  }
}

// Magic Blades spell stats derived from level
function getBladesStats(level) {
  const lvl = max(0, floor(level || 0));
  const count = min(6, lvl);
  const radiusFromPlayer = 90;
  const bladeCircleRadius = 8 + floor(max(0, lvl - 1) / 3) * 2;
  const rotationSpeed = 0.045 + lvl * 0.01;
  const damage = 20 + lvl * 5;
  const hitCooldownFrames = max(6, 18 - floor(lvl / 2));
  return {
    count,
    radiusFromPlayer,
    bladeCircleRadius,
    rotationSpeed,
    damage,
    hitCooldownFrames,
  };
}
