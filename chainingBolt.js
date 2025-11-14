// Chaining Bolt spell logic - projectile that chains between enemies
let chainingBoltColor;
function getChainingBoltColor() {
  if (!chainingBoltColor) {
    chainingBoltColor = color(100, 255, 200);
  }
  return chainingBoltColor;
}

function updateChainingBoltSpell() {
  const spell = game.spells && game.spells.chainingBolt;
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

  const stats = getChainingBoltStats(spell.level);
  const dx = nearest.x - p.x;
  const dy = nearest.y - p.y;
  const d = sqrt(dx * dx + dy * dy) || 1;

  const projectile = createChainingBoltProjectile({
    x: p.x,
    y: p.y,
    targetEnemy: nearest,
    stats,
  });

  game.chainingBoltProjectiles.push(projectile);
  spell.cooldown = stats.cooldownFrames;
}

function createChainingBoltProjectile({ x, y, targetEnemy, stats }) {
  return {
    x,
    y,
    radius: stats.radius,
    damage: stats.damage,
    chainsRemaining: stats.chains,
    alive: true,
    color: stats.color,
    hitEnemies: new Set(),
    targetEnemy: targetEnemy,
    speed: stats.speed,
    type: "chainingBolt",
  };
}

function updateChainingBoltProjectiles() {
  const cullBounds = getWorldViewBounds(600);
  const bolts = game.chainingBoltProjectiles;
  for (let i = 0; i < bolts.length; i++) {
    const bolt = bolts[i];
    if (!bolt.alive) continue;

    // Check if current target is still valid
    if (
      !bolt.targetEnemy ||
      !bolt.targetEnemy.alive ||
      bolt.hitEnemies.has(bolt.targetEnemy)
    ) {
      // Find new target
      bolt.targetEnemy = findNextChainingBoltTarget(bolt);
    }

    // If no target and no chains left, projectile dies
    if (!bolt.targetEnemy) {
      bolt.alive = false;
      continue;
    }

    // Move toward target
    const dx = bolt.targetEnemy.x - bolt.x;
    const dy = bolt.targetEnemy.y - bolt.y;
    const d = sqrt(dx * dx + dy * dy) || 1;

    bolt.x += (dx / d) * bolt.speed;
    bolt.y += (dy / d) * bolt.speed;

    // Check collision with target
    const distSq =
      (bolt.targetEnemy.x - bolt.x) ** 2 + (bolt.targetEnemy.y - bolt.y) ** 2;
    if (distSq <= (bolt.targetEnemy.radius + bolt.radius) ** 2) {
      // Hit the target
      damageEnemy(bolt.targetEnemy, bolt.damage);
      bolt.hitEnemies.add(bolt.targetEnemy);
      bolt.chainsRemaining--;

      if (bolt.chainsRemaining <= 0) {
        bolt.alive = false;
      } else {
        // Find next target
        bolt.targetEnemy = findNextChainingBoltTarget(bolt);
        if (!bolt.targetEnemy) {
          bolt.alive = false;
        }
      }
    }

    // Cull if out of bounds
    if (
      bolt.x < cullBounds.left ||
      bolt.x > cullBounds.right ||
      bolt.y < cullBounds.top ||
      bolt.y > cullBounds.bottom
    ) {
      bolt.alive = false;
    }
  }

  compactAlive(game.chainingBoltProjectiles);
}

function findNextChainingBoltTarget(bolt) {
  let nearest = null;
  let bestDist = Infinity;
  const maxChainDistance = 250; // Maximum distance to chain to next enemy

  for (const enemy of game.enemies) {
    if (!enemy.alive) continue;
    if (bolt.hitEnemies.has(enemy)) continue;

    const d2 = (enemy.x - bolt.x) ** 2 + (enemy.y - bolt.y) ** 2;
    if (d2 < bestDist && d2 <= maxChainDistance * maxChainDistance) {
      bestDist = d2;
      nearest = enemy;
    }
  }

  return nearest;
}

function getChainingBoltStats(level) {
  const lvl = max(1, floor(level || 1));
  const baseDamage = 35;
  const baseCooldown = 70; // frames
  const baseSpeed = 9;
  const radius = 8;

  // Chains increase with each level: level 1 = 3 chains, level 2 = 4, etc.
  const chains = 2 + lvl;

  // Damage increases moderately per level
  const damage = round(baseDamage * pow(1.25, lvl - 1));

  // Cooldown decreases per level
  const cooldown = max(20, round(baseCooldown * pow(0.88, lvl - 1)));

  // Speed increases slightly
  const speed = baseSpeed + floor((lvl - 1) / 2);

  return {
    damage,
    cooldownFrames: cooldown,
    speed,
    radius,
    chains,
    color: getChainingBoltColor(), // Cyan-green color
  };
}

function renderChainingBoltProjectiles() {
  for (const bolt of game.chainingBoltProjectiles) {
    if (!bolt.alive) continue;

    // Draw chain trail if there's a target
    if (bolt.targetEnemy && bolt.targetEnemy.alive) {
      stroke(
        bolt.color.levels[0],
        bolt.color.levels[1],
        bolt.color.levels[2],
        100
      );
      strokeWeight(2);
      line(bolt.x, bolt.y, bolt.targetEnemy.x, bolt.targetEnemy.y);
    }

    // Spinning effect
    const rotation = game.frame * 0.15;

    // Draw chaining bolt shape
    push();
    translate(bolt.x, bolt.y);
    rotate(rotation);

    // Outer glow
    noStroke();
    fill(bolt.color.levels[0], bolt.color.levels[1], bolt.color.levels[2], 80);
    ellipse(0, 0, bolt.radius * 3, bolt.radius * 3);

    // Main chaining bolt
    fill(bolt.color);
    stroke(255, 255, 255, 150);
    strokeWeight(2);

    // Draw curved chaining bolt shape
    beginShape();
    vertex(-bolt.radius, 0);
    bezierVertex(
      -bolt.radius * 0.7,
      -bolt.radius * 0.5,
      bolt.radius * 0.7,
      -bolt.radius * 0.5,
      bolt.radius,
      0
    );
    bezierVertex(
      bolt.radius * 0.7,
      bolt.radius * 0.2,
      -bolt.radius * 0.7,
      bolt.radius * 0.2,
      -bolt.radius,
      0
    );
    endShape(CLOSE);

    pop();

    // Chains remaining indicator (small text)
    noStroke();
    fill(255, 255, 255, 180);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(bolt.chainsRemaining, bolt.x, bolt.y - bolt.radius - 8);
  }
}
