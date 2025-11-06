// Experience orbs logic and rendering
function dropOrb(x, y, value) {
  game.orbs.push({
    x, y,
    radius: 6,
    value,
    color: color(100, 200, 255),
    alive: true
  });
}

function updateOrbs() {
  const p = game.player;
  for (const o of game.orbs) {
    if (!o.alive) continue;
    const dx = p.x - o.x;
    const dy = p.y - o.y;
    const d = sqrt(dx * dx + dy * dy) || 1;
    const attractRange = 90;
    if (d < attractRange) {
      const s = map(d, 0, attractRange, 4, 1);
      o.x += (dx / d) * s;
      o.y += (dy / d) * s;
    }
    const sumR = o.radius + p.radius;
    if ((p.x - o.x) ** 2 + (p.y - o.y) ** 2 <= sumR * sumR) {
      o.alive = false;
      p.exp += o.value;
    }
  }
  game.orbs = game.orbs.filter(o => o.alive);
}

function renderOrbs() {
  noStroke();
  for (const o of game.orbs) {
    if (!o.alive) continue;
    fill(o.color);
    circle(o.x, o.y, o.radius * 2);
  }
}


