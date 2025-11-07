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
  updateCamera();
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
  applyCameraTransform();
  renderWorldFloor();
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

function applyCameraTransform() {
  translate(-game.camera.x, -game.camera.y);
}

function renderWorldFloor() {
  const tile = 120;
  const minX = game.player.x - width / 2 - tile;
  const maxX = game.player.x + width / 2 + tile;
  const minY = game.player.y - height / 2 - tile;
  const maxY = game.player.y + height / 2 + tile;
  const startX = floor(minX / tile) * tile;
  const startY = floor(minY / tile) * tile;

  stroke(40);
  strokeWeight(1);
  for (let x = startX; x <= maxX; x += tile) {
    line(x, minY, x, maxY);
  }
  for (let y = startY; y <= maxY; y += tile) {
    line(minX, y, maxX, y);
  }
  noStroke();
}
// Rendering delegations remain here for composition
