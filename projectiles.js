// Projectiles update and rendering
function updateProjectiles() {
  const cullBounds = getWorldViewBounds(400);
  for (const pr of game.projectiles) {
    if (!pr.alive) continue;
    pr.x += pr.vx;
    pr.y += pr.vy;
    if (pr.x < cullBounds.left || pr.x > cullBounds.right || pr.y < cullBounds.top || pr.y > cullBounds.bottom) {
      pr.alive = false;
      continue;
    }
    for (const e of game.enemies) {
      if (!e.alive) continue;
      const distSq = (e.x - pr.x) ** 2 + (e.y - pr.y) ** 2;
      if (distSq <= (e.radius + pr.radius) ** 2) {
        damageEnemy(e, pr.damage);
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
