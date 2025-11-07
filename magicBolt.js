// Magic Bolt spell update loop, stats, and projectile helpers
function updateMagicBolt() {
  const spell = (game && game.spells) ? game.spells.magicBolt : null;
  if (!spell || spell.level <= 0) return;

  if (spell.cooldown > 0) {
    spell.cooldown--;
    return;
  }

  const player = game.player;
  if (!player) return;

  const target = findNearestEnemy(player.x, player.y);
  if (!target) return;

  const stats = getMagicBoltStats(spell.level);
  const projectile = createMagicBoltProjectile(player, target, stats);
  game.projectiles.push(projectile);

  spell.cooldown = stats.cooldownFrames;
}

function findNearestEnemy(x, y) {
  let nearest = null;
  let bestDist = Infinity;
  if (!game || !game.enemies) return null;
  for (const enemy of game.enemies) {
    if (!enemy.alive) continue;
    const distSq = (enemy.x - x) ** 2 + (enemy.y - y) ** 2;
    if (distSq < bestDist) {
      bestDist = distSq;
      nearest = enemy;
    }
  }
  return nearest;
}

function createMagicBoltProjectile(player, target, stats) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const distance = sqrt(dx * dx + dy * dy) || 1;
  return {
    x: player.x,
    y: player.y,
    vx: (dx / distance) * stats.speed,
    vy: (dy / distance) * stats.speed,
    radius: stats.radius,
    damage: stats.damage,
    pierce: stats.pierce,
    alive: true,
    color: stats.color
  };
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
