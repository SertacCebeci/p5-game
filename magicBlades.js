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
      // Ellipse-based collision: treat blade as an ellipse expanded by enemy radius
      const dx = e.x - bx;
      const dy = e.y - by;
      const rx = b.bladeRadiusX + e.radius;
      const ry = b.bladeRadiusY + e.radius;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
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

    // Draw blade as an ellipse oriented tangentially around the player:
    // the long axis is perpendicular (90°) to the line from player center to blade center.
    push();
    translate(bx, by);
    rotate(angle + HALF_PI);
    noStroke();
    fill(200, 240, 255);
    ellipse(0, 0, b.bladeRadiusX * 2, b.bladeRadiusY * 2);
    pop();
  }
}

// Magic Blades spell stats derived from level
function getBladesStats(level) {
  const lvl = max(0, floor(level || 0));
  const count = min(6, lvl);
  const radiusFromPlayer = 90;
  const bladeCircleRadius = 8 + floor(max(0, lvl - 1) / 3) * 2;
  // Ellipse radii derived from the base circle radius (slightly wider + thinner)
  const bladeRadiusX = bladeCircleRadius * 1.9;
  const bladeRadiusY = bladeCircleRadius * 0.7;
  const rotationSpeed = 0.045 + lvl * 0.01;
  const damage = 20 + lvl * 5;
  const hitCooldownFrames = max(6, 18 - floor(lvl / 2));
  return {
    count,
    radiusFromPlayer,
    bladeCircleRadius,
    bladeRadiusX,
    bladeRadiusY,
    rotationSpeed,
    damage,
    hitCooldownFrames,
  };
}
