// Magic Bolt spell logic

function createMagicBoltState() {
  return {
    level: 1,
    cooldown: 0,
  };
}

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
    color: color(255, 235, 140),
  };
}

function updateMagicBoltSpell() {
  const spell = game.spells.magicBolt;
  if (!spell || spell.level <= 0) return;

  if (spell.cooldown > 0) {
    spell.cooldown--;
  }

  if (game.enemies.length === 0) return;
  if (spell.cooldown > 0) return;

  const p = game.player;
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

  if (!nearest) return;

  const stats = getMagicBoltStats(spell.level);
  const dx = nearest.x - p.x;
  const dy = nearest.y - p.y;
  const distance = sqrt(dx * dx + dy * dy) || 1;
  const vx = (dx / distance) * stats.speed;
  const vy = (dy / distance) * stats.speed;

  const projectile = {
    x: p.x,
    y: p.y,
    vx,
    vy,
    radius: stats.radius,
    damage: stats.damage,
    pierce: stats.pierce,
    alive: true,
    color: stats.color,
  };

  game.projectiles.push(projectile);
  spell.cooldown = stats.cooldownFrames;
}

