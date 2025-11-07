// Sniping Bolt spell logic and behaviors
function updateSnipingBoltSpell() {
  const spell = game.spells && game.spells.snipingBolt;
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

  const stats = getSnipingBoltStats(spell.level);
  const dx = nearest.x - p.x;
  const dy = nearest.y - p.y;
  const d = sqrt(dx * dx + dy * dy) || 1;

  const projectile = createSnipingBoltProjectile({
    x: p.x,
    y: p.y,
    vx: (dx / d) * stats.speed,
    vy: (dy / d) * stats.speed,
    stats,
  });

  game.projectiles.push(projectile);
  spell.cooldown = stats.cooldownFrames;
}

function createSnipingBoltProjectile({ x, y, vx, vy, stats }) {
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
    hitEnemies: new Set(), // Track which enemies have been hit
    type: "snipingBolt", // Mark as sniping bolt for special rendering
  };
}

// Sniping Bolt spell stats derived from level
function getSnipingBoltStats(level) {
  const lvl = max(1, floor(level || 1));
  const baseDamage = 80; // Very high base damage
  const baseCooldown = 120; // High cooldown (2 seconds at 60fps)
  const baseSpeed = 15; // Very fast projectile
  const radius = 4; // Smaller, bullet-like radius

  // Damage increases significantly per level
  const damage = round(baseDamage * pow(1.35, lvl - 1));

  // Cooldown decreases noticeably per level
  const cooldown = max(30, round(baseCooldown * pow(0.85, lvl - 1)));

  // Speed increases slightly
  const speed = baseSpeed + floor((lvl - 1) / 2);

  // Pierce increases every 2 levels
  const pierce = floor((lvl - 1) / 2);

  return {
    damage,
    cooldownFrames: cooldown,
    speed,
    radius,
    pierce,
    color: color(255, 100, 50), // Orange-red for sniping bolt
  };
}

// Render sniping bolt projectiles with a special trail effect
function renderSnipingBoltProjectiles() {
  for (const pr of game.projectiles) {
    if (!pr.alive || pr.type !== "snipingBolt") continue;

    // Draw trail
    stroke(pr.color.levels[0], pr.color.levels[1], pr.color.levels[2], 80);
    strokeWeight(2);
    const trailLength = 20;
    const trailX = pr.x - pr.vx * (trailLength / pr.vx);
    const trailY = pr.y - pr.vy * (trailLength / pr.vy);
    line(trailX, trailY, pr.x, pr.y);

    // Draw bullet
    noStroke();
    fill(255, 200, 100);
    circle(pr.x, pr.y, pr.radius * 2);

    // Bright core
    fill(255, 255, 200);
    circle(pr.x, pr.y, pr.radius);
  }
}
