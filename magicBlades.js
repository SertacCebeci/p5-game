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
      const angle = (game.frame * 0.06) + (TWO_PI * k / b.count);
      const bx = p.x + cos(angle) * b.radius;
      const by = p.y + sin(angle) * b.radius;
      const sumR = e.radius + 6;
      if ((bx - e.x) ** 2 + (by - e.y) ** 2 <= sumR * sumR) {
        hit = true; break;
      }
    }
    // Use module-scoped cooldown tracking without requiring enemy initialization
    const lastHitFrame = e._lastMagicBladesHitFrame ?? -1e9;
    if (hit && (game.frame - lastHitFrame > b.hitCooldownFrames)) {
      e.hp -= b.damage;
      e._lastMagicBladesHitFrame = game.frame;
      if (e.hp <= 0) {
        e.alive = false;
        // small direct EXP on kill
        if (game && game.player) {
          game.player.exp += (e.killExp ?? 1);
        }
        dropOrb(e.x, e.y, e.value);
      }
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
    const angle = (game.frame * 0.06) + (TWO_PI * k / b.count);
    const bx = p.x + cos(angle) * b.radius;
    const by = p.y + sin(angle) * b.radius;
    line(p.x, p.y, bx, by);
    noStroke();
    fill(200, 240, 255);
    circle(bx, by, 12);
    stroke(180, 220, 255);
    noFill();
  }
}

// Magic Blades spell stats derived from level
function getBladesStats(level) {
  const lvl = max(0, floor(level || 0));
  const count = min(6, lvl);
  const radius = 40 + max(0, (lvl - 1)) * 2;
  const damage = 10 + lvl * 3;
  const hitCooldownFrames = max(6, 18 - floor(lvl / 2));
  return { count, radius, damage, hitCooldownFrames };
}


