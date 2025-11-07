// Projectiles update and rendering
function updateProjectiles() {
  for (const pr of game.projectiles) {
    if (!pr.alive) continue;
    pr.x += pr.vx;
    pr.y += pr.vy;
    const dx = pr.x - game.player.x;
    const dy = pr.y - game.player.y;
    const maxDistance = max(width, height) * 1.5;
    if (dx * dx + dy * dy > maxDistance * maxDistance) {
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
          // small direct EXP on kill
          if (game && game.player) {
            game.player.exp += (e.killExp ?? 1);
          }
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

function renderProjectiles() {
  noStroke();
  for (const pr of game.projectiles) {
    if (!pr.alive) continue;
    fill(pr.color);
    circle(pr.x, pr.y, pr.radius * 2);
  }
}

// Magic Bolt spell stats derived from level
function getMagicBoltStats(level) {
  const lvl = max(1, floor(level || 1));
  const baseDamage = 22;
  const baseCooldown = 30; // frames
  const baseSpeed = 7;
  const radius = 6;
  const damage = round(baseDamage * pow(1.2, lvl - 1));
  const cooldown = max(6, round(baseCooldown * pow(0.92, lvl - 1)));
  const speed = baseSpeed + floor((lvl - 1) / 2);
  const pierce = floor((lvl - 1) / 3);
  return {
    damage,
    cooldownFrames: cooldown,
    speed,
    radius,
    pierce,
    color: color(255, 235, 140)
  };
}

