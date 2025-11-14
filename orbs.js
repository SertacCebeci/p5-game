// Experience orbs logic and rendering
let sharedOrbColor;
function getOrbColor() {
  if (!sharedOrbColor) {
    sharedOrbColor = color(100, 200, 255);
  }
  return sharedOrbColor;
}

function dropOrb(x, y, value) {
  game.orbs.push({
    x,
    y,
    radius: 6,
    value,
    color: getOrbColor(),
    alive: true,
  });
}

function updateOrbs() {
  const p = game.player;
  const orbs = game.orbs;
  if (!orbs.length) return;

  const pickupRadius = p.pickupRadius;
  const pickupRadiusSq = pickupRadius * pickupRadius;
  const playerRadius = p.radius;

  for (let i = 0; i < orbs.length; i++) {
    const o = orbs[i];
    if (!o.alive) continue;

    const dx = p.x - o.x;
    if (abs(dx) > pickupRadius) continue;
    const dy = p.y - o.y;
    if (abs(dy) > pickupRadius) continue;

    const distSq = dx * dx + dy * dy;
    if (distSq > pickupRadiusSq) continue;

    const dist = sqrt(distSq) || 1;
    const pullStrength = 1 + (1 - dist / pickupRadius) * 3;
    const invDist = 1 / dist;
    o.x += dx * invDist * pullStrength;
    o.y += dy * invDist * pullStrength;

    const collisionRadius = playerRadius + o.radius;
    const ndx = p.x - o.x;
    const ndy = p.y - o.y;
    if (ndx * ndx + ndy * ndy <= collisionRadius * collisionRadius) {
      o.alive = false;
      p.exp += o.value;
    }
  }

  compactAlive(orbs);
}

function renderOrbs() {
  if (!game.orbs.length) return;
  const view = getWorldViewBounds(60);
  noStroke();
  for (const o of game.orbs) {
    if (
      !o.alive ||
      o.x < view.left ||
      o.x > view.right ||
      o.y < view.top ||
      o.y > view.bottom
    ) {
      continue;
    }
    fill(o.color);
    circle(o.x, o.y, o.radius * 2);
  }
}
