// Buff orbs logic - spawn periodically and give temporary power-ups

function spawnBuffOrb() {
  const p = game.player;
  // Spawn near but not too close to player
  const angle = random(TWO_PI);
  const distance = random(200, 400);
  const x = p.x + cos(angle) * distance;
  const y = p.y + sin(angle) * distance;

  game.buffOrbs.push({
    x,
    y,
    radius: 12,
    alive: true,
    color: color(220, 60, 60), // Reddish color for damage buff
    type: "damage", // buff type
    duration: 600, // 10 seconds at 60fps
    multiplier: 4, // 4x damage
  });
}

function maybeSpawnBuffOrb() {
  const spawnInterval = 30 * 60; // 30 seconds in frames (at 60fps)
  if (game.frame > 0 && game.frame % spawnInterval === 0) {
    spawnBuffOrb();
  }
}

function updateBuffOrbs() {
  const p = game.player;

  // Update buff orb positions and check for pickup
  for (const orb of game.buffOrbs) {
    if (!orb.alive) continue;

    // Attract to player when close - use player's pickup radius with a 1.3x multiplier for buff orbs
    const dx = p.x - orb.x;
    const dy = p.y - orb.y;
    const d = sqrt(dx * dx + dy * dy) || 1;
    const attractRange = p.pickupRadius * 1.3; // Buff orbs have slightly larger pickup range

    if (d < attractRange) {
      const s = map(d, 0, attractRange, 5, 1);
      orb.x += (dx / d) * s;
      orb.y += (dy / d) * s;
    }

    // Check collision with player
    const sumR = orb.radius + p.radius;
    if ((p.x - orb.x) ** 2 + (p.y - orb.y) ** 2 <= sumR * sumR) {
      orb.alive = false;
      applyBuff(orb);
    }
  }

  // Update active buffs
  for (let i = p.activeBuffs.length - 1; i >= 0; i--) {
    const buff = p.activeBuffs[i];
    buff.remainingFrames--;
    if (buff.remainingFrames <= 0) {
      p.activeBuffs.splice(i, 1);
    }
  }

  // Clean up dead orbs
  game.buffOrbs = game.buffOrbs.filter((o) => o.alive);
}

function applyBuff(orbData) {
  const p = game.player;

  // Add buff to active buffs (stacks with existing buffs)
  p.activeBuffs.push({
    type: orbData.type,
    multiplier: orbData.multiplier,
    remainingFrames: orbData.duration,
  });
}

function getDamageMultiplier() {
  const p = game.player;
  let multiplier = 1.0;

  // Stack all active damage buffs
  for (const buff of p.activeBuffs) {
    if (buff.type === "damage") {
      multiplier *= buff.multiplier;
    }
  }

  return multiplier;
}

function renderBuffOrbs() {
  noStroke();

  // Render buff orbs with pulsing effect
  for (const orb of game.buffOrbs) {
    if (!orb.alive) continue;

    // Pulsing effect
    const pulse = 1 + sin(game.frame * 0.1) * 0.2;

    // Outer glow
    fill(orb.color.levels[0], orb.color.levels[1], orb.color.levels[2], 50);
    circle(orb.x, orb.y, orb.radius * 2 * pulse * 1.8);

    // Main orb
    fill(orb.color);
    circle(orb.x, orb.y, orb.radius * 2 * pulse);

    // Inner highlight
    fill(255, 255, 255, 150);
    circle(orb.x - 2, orb.y - 2, orb.radius * 0.6);
  }
}
