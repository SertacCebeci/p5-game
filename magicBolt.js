// Magic Bolt spell logic
function createMagicBoltState(initialLevel = 1) {
  return {
    level: initialLevel,
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
  const spell = game?.spells?.magicBolt;
  if (!spell || spell.level <= 0) return;

  if (spell.cooldown > 0) {
    spell.cooldown--;
  }
  if (spell.cooldown > 0) return;
  if (!game.enemies || game.enemies.length === 0) return;

  const player = game.player;
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

function createMagicBoltProjectile(origin, target, stats) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const dist = sqrt(dx * dx + dy * dy) || 1;
  const vx = (dx / dist) * stats.speed;
  const vy = (dy / dist) * stats.speed;
  return {
    x: origin.x,
    y: origin.y,
    vx,
    vy,
    radius: stats.radius,
    damage: stats.damage,
    pierce: stats.pierce,
    alive: true,
    color: stats.color,
  };
}
