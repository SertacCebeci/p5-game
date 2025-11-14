// Projectiles update and rendering
function updateProjectiles() {
  const cullBounds = getWorldViewBounds(400);
  const projectiles = game.projectiles;
  const enemies = game.enemies;

  for (let i = 0; i < projectiles.length; i++) {
    const pr = projectiles[i];
    if (!pr.alive) continue;

    pr.x += pr.vx;
    pr.y += pr.vy;

    if (
      pr.x < cullBounds.left ||
      pr.x > cullBounds.right ||
      pr.y < cullBounds.top ||
      pr.y > cullBounds.bottom
    ) {
      pr.alive = false;
      continue;
    }

    const hitEnemies = pr.hitEnemies;
    const sumRadiusBase = pr.radius;
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (!e.alive) continue;
      if (hitEnemies && hitEnemies.has(e)) continue;

      const dx = e.x - pr.x;
      const dy = e.y - pr.y;
      const sumR = e.radius + sumRadiusBase;
      if (dx * dx + dy * dy <= sumR * sumR) {
        damageEnemy(e, pr.damage);
        if (hitEnemies) hitEnemies.add(e);
        if (pr.pierce > 0) {
          pr.pierce--;
        } else {
          pr.alive = false;
          break;
        }
      }
    }
  }

  compactAlive(projectiles);
}

function renderProjectiles() {
  if (!game.projectiles.length) return;
  const view = getWorldViewBounds(40);
  noStroke();
  for (const pr of game.projectiles) {
    if (
      !pr.alive ||
      pr.x < view.left ||
      pr.x > view.right ||
      pr.y < view.top ||
      pr.y > view.bottom
    ) {
      continue;
    }
    fill(pr.color);
    circle(pr.x, pr.y, pr.radius * 2);
  }
}
