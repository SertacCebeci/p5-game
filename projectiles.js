// Projectiles update and rendering
function updateProjectiles() {
  for (const pr of game.projectiles) {
    if (!pr.alive) continue;
    pr.x += pr.vx;
    pr.y += pr.vy;
    if (pr.x < -20 || pr.x > width + 20 || pr.y < -20 || pr.y > height + 20) {
      pr.alive = false;
      continue;
    }
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const distSq = (e.x - pr.x) ** 2 + (e.y - pr.y) ** 2;
      if (distSq <= (e.radius + pr.radius) ** 2) {
        e.hp -= pr.damage;
        if (e.hp <= 0) {
          e.alive = false;
          dropOrb(e.x, e.y, e.value);
        }
        if (pr.pierce > 0) {
          pr.pierce--;
        } else {
          pr.alive = false;
          break;
        }
      }
    }
  }
  game.projectiles = game.projectiles.filter(p => p.alive);
}

function renderProjectiles() {
  noStroke();
  for (const pr of game.projectiles) {
    if (!pr.alive) continue;
    fill(pr.color);
    circle(pr.x, pr.y, pr.radius * 2);
  }
}


