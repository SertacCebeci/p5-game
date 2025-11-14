// Buff orbs logic - spawn periodically and give temporary power-ups
const BUFF_ORB_COLORS = {};

function getBuffColor(type) {
  if (!BUFF_ORB_COLORS[type]) {
    if (type === "damage") {
      BUFF_ORB_COLORS[type] = color(220, 60, 60);
    } else {
      BUFF_ORB_COLORS[type] = color(255, 255, 255);
    }
  }
  return BUFF_ORB_COLORS[type];
}

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
    color: getBuffColor("damage"), // Reddish color for damage buff
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
  const pickupRadius = p.pickupRadius * 1.3;
  const pickupRadiusSq = pickupRadius * pickupRadius;

  // Update buff orb positions and check for pickup
  for (const orb of game.buffOrbs) {
    if (!orb.alive) continue;

    // Attract to player when close - use player's pickup radius with a 1.3x multiplier for buff orbs
    const dx = p.x - orb.x;
    const dy = p.y - orb.y;
    if (abs(dx) > pickupRadius || abs(dy) > pickupRadius) continue;

    const distSq = dx * dx + dy * dy;
    if (distSq < pickupRadiusSq) {
      const dist = sqrt(distSq) || 1;
      const strength = 1 + (1 - dist / pickupRadius) * 4;
      const invDist = 1 / dist;
      orb.x += dx * invDist * strength;
      orb.y += dy * invDist * strength;
    } else {
      continue;
    }

    // Check collision with player
    const sumR = orb.radius + p.radius;
    const ndx = p.x - orb.x;
    const ndy = p.y - orb.y;
    if (ndx * ndx + ndy * ndy <= sumR * sumR) {
      orb.alive = false;
      applyBuff(orb);
    }
  }

  // Update active buffs
  const buffs = p.activeBuffs;
  let writeIndex = 0;
  for (let i = 0; i < buffs.length; i++) {
    const buff = buffs[i];
    buff.remainingFrames--;
    if (buff.remainingFrames > 0) {
      buffs[writeIndex++] = buff;
    }
  }
  buffs.length = writeIndex;

  // Clean up dead orbs
  compactAlive(game.buffOrbs);
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
  const view = getWorldViewBounds(80);

  // Render buff orbs with pulsing effect
  for (const orb of game.buffOrbs) {
    if (
      !orb.alive ||
      orb.x < view.left ||
      orb.x > view.right ||
      orb.y < view.top ||
      orb.y > view.bottom
    ) {
      continue;
    }

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
