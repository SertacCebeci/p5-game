// Simplified "Magic Survival" style game with basic shapes
// Controls: WASD/Arrows to move, Mouse click or keys [1-3] to pick upgrades, R to restart on game over

function setup() {
  createCanvas(960, 540);
  resetGame();
}

function draw() {
  background(20);
  if (game.state === 'playing') {
    updateGame();
  }
  renderGame();
  game.frame++;
  game.timeSeconds = game.frame / 60;
}

function updateGame() {
  handleInput();
  game.camera.x = game.player.x;
  game.camera.y = game.player.y;
  autoShoot();
  updateProjectiles();
  maybeSpawnEnemies();
  updateEnemies();
  updateOrbs();
  updateBlades();
  checkLevelUp();
  if (game.player.hp <= 0 && game.state !== 'gameover') {
    game.state = 'gameover';
  }
}

function renderGame() {
  push();
  const cam = game.camera;
  translate(width / 2 - cam.x, height / 2 - cam.y);
  renderGround();
  renderOrbs();
  renderEnemies();
  renderProjectiles();
  renderPlayer();
  renderBlades();
  pop();
  renderUI();
  if (game.state === 'levelup') {
    renderLevelUpModal();
  } else if (game.state === 'gameover') {
    renderGameOver();
  }
}
// Rendering delegations remain here for composition

function renderGround() {
  const grid = 140;
  const cam = game.camera;
  const minX = cam.x - width / 2 - grid;
  const maxX = cam.x + width / 2 + grid;
  const minY = cam.y - height / 2 - grid;
  const maxY = cam.y + height / 2 + grid;
  const startX = floor(minX / grid) * grid;
  const startY = floor(minY / grid) * grid;
  stroke(45);
  strokeWeight(1);
  for (let x = startX; x <= maxX; x += grid) {
    line(x, minY - grid, x, maxY + grid);
  }
  for (let y = startY; y <= maxY; y += grid) {
    line(minX - grid, y, maxX + grid, y);
  }
}
