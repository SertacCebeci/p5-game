// Magic Bolt spell logic and behaviors
let magicBoltColor;
function getMagicBoltColor() {
  if (!magicBoltColor) {
    magicBoltColor = color(255, 235, 140);
  }
  return magicBoltColor;
}

function updateMagicBoltSpell() {
  const spell = game.spells && game.spells.magicBolt;
  if (!spell || spell.level <= 0) return;

  if (spell.cooldown > 0) {
    spell.cooldown--;
  }

  const p = game.player;
  if (!p) return;

  let nearest = null;
  let bestDist = Infinity;
  for (const enemy of game.enemies) {
    if (!enemy.alive) continue;
    const d2 = (enemy.x - p.x) ** 2 + (enemy.y - p.y) ** 2;
    if (d2 < bestDist) {
      bestDist = d2;
      nearest = enemy;
    }
  }

  if (!nearest || spell.cooldown > 0) return;

  const stats = getMagicBoltStats(spell.level);
  const dx = nearest.x - p.x;
  const dy = nearest.y - p.y;
  const d = sqrt(dx * dx + dy * dy) || 1;

  const projectile = createMagicBoltProjectile({
    x: p.x,
    y: p.y,
    vx: (dx / d) * stats.speed,
    vy: (dy / d) * stats.speed,
    stats,
  });

  game.projectiles.push(projectile);
  spell.cooldown = stats.cooldownFrames;
}

function createMagicBoltProjectile({ x, y, vx, vy, stats }) {
  return {
    x,
    y,
    vx,
    vy,
    radius: stats.radius,
    damage: stats.damage,
    pierce: stats.pierce,
    alive: true,
    color: stats.color,
    hitEnemies: stats.pierce > 0 ? new Set() : null, // Track which enemies have been hit
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
  const pierce = floor((lvl - 1) / 1);
  return {
    damage,
    cooldownFrames: cooldown,
    speed,
    radius,
    pierce,
    color: getMagicBoltColor(),
  };
}
