// Boomerang spell logic - projectile that chains between enemies

function updateBoomerangSpell() {
  const spell = game.spells && game.spells.boomerang;
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

  const stats = getBoomerangStats(spell.level);
  const dx = nearest.x - p.x;
  const dy = nearest.y - p.y;
  const d = sqrt(dx * dx + dy * dy) || 1;

  const projectile = createBoomerangProjectile({
    x: p.x,
    y: p.y,
    targetEnemy: nearest,
    stats,
  });

  game.boomerangProjectiles.push(projectile);
  spell.cooldown = stats.cooldownFrames;
}

function createBoomerangProjectile({ x, y, targetEnemy, stats }) {
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
    type: 'boomerang',
  };
}

function updateBoomerangProjectiles() {
  const cullBounds = getWorldViewBounds(600);
  
  for (const boom of game.boomerangProjectiles) {
    if (!boom.alive) continue;

    // Check if current target is still valid
    if (!boom.targetEnemy || !boom.targetEnemy.alive || boom.hitEnemies.has(boom.targetEnemy)) {
      // Find new target
      boom.targetEnemy = findNextBoomerangTarget(boom);
    }

    // If no target and no chains left, projectile dies
    if (!boom.targetEnemy) {
      boom.alive = false;
      continue;
    }

    // Move toward target
    const dx = boom.targetEnemy.x - boom.x;
    const dy = boom.targetEnemy.y - boom.y;
    const d = sqrt(dx * dx + dy * dy) || 1;
    
    boom.x += (dx / d) * boom.speed;
    boom.y += (dy / d) * boom.speed;

    // Check collision with target
    const distSq = (boom.targetEnemy.x - boom.x) ** 2 + (boom.targetEnemy.y - boom.y) ** 2;
    if (distSq <= (boom.targetEnemy.radius + boom.radius) ** 2) {
      // Hit the target
      damageEnemy(boom.targetEnemy, boom.damage);
      boom.hitEnemies.add(boom.targetEnemy);
      boom.chainsRemaining--;

      if (boom.chainsRemaining <= 0) {
        boom.alive = false;
      } else {
        // Find next target
        boom.targetEnemy = findNextBoomerangTarget(boom);
        if (!boom.targetEnemy) {
          boom.alive = false;
        }
      }
    }

    // Cull if out of bounds
    if (
      boom.x < cullBounds.left ||
      boom.x > cullBounds.right ||
      boom.y < cullBounds.top ||
      boom.y > cullBounds.bottom
    ) {
      boom.alive = false;
    }
  }

  game.boomerangProjectiles = game.boomerangProjectiles.filter((b) => b.alive);
}

function findNextBoomerangTarget(boom) {
  let nearest = null;
  let bestDist = Infinity;
  const maxChainDistance = 250; // Maximum distance to chain to next enemy

  for (const enemy of game.enemies) {
    if (!enemy.alive) continue;
    if (boom.hitEnemies.has(enemy)) continue;

    const d2 = (enemy.x - boom.x) ** 2 + (enemy.y - boom.y) ** 2;
    if (d2 < bestDist && d2 <= maxChainDistance * maxChainDistance) {
      bestDist = d2;
      nearest = enemy;
    }
  }

  return nearest;
}

function getBoomerangStats(level) {
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
    color: color(100, 255, 200), // Cyan-green color
  };
}

function renderBoomerangProjectiles() {
  for (const boom of game.boomerangProjectiles) {
    if (!boom.alive) continue;

    // Draw chain trail if there's a target
    if (boom.targetEnemy && boom.targetEnemy.alive) {
      stroke(boom.color.levels[0], boom.color.levels[1], boom.color.levels[2], 100);
      strokeWeight(2);
      line(boom.x, boom.y, boom.targetEnemy.x, boom.targetEnemy.y);
    }

    // Spinning effect
    const rotation = game.frame * 0.15;
    
    // Draw boomerang shape
    push();
    translate(boom.x, boom.y);
    rotate(rotation);
    
    // Outer glow
    noStroke();
    fill(boom.color.levels[0], boom.color.levels[1], boom.color.levels[2], 80);
    ellipse(0, 0, boom.radius * 3, boom.radius * 3);
    
    // Main boomerang
    fill(boom.color);
    stroke(255, 255, 255, 150);
    strokeWeight(2);
    
    // Draw curved boomerang shape
    beginShape();
    vertex(-boom.radius, 0);
    bezierVertex(-boom.radius * 0.7, -boom.radius * 0.5, boom.radius * 0.7, -boom.radius * 0.5, boom.radius, 0);
    bezierVertex(boom.radius * 0.7, boom.radius * 0.2, -boom.radius * 0.7, boom.radius * 0.2, -boom.radius, 0);
    endShape(CLOSE);
    
    pop();
    
    // Chains remaining indicator (small text)
    noStroke();
    fill(255, 255, 255, 180);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(boom.chainsRemaining, boom.x, boom.y - boom.radius - 8);
  }
}

