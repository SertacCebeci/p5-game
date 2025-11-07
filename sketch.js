// Simplified "Magic Survival" style game with basic shapes
// Controls: WASD/Arrows to move, Mouse click or keys [1-3] to pick upgrades, R to restart on game over

function setup() {
  createCanvas(960, 540);
  resetGame();
}

function draw() {
  background(20);
  
  if (game.state === 'weaponSelect') {
    renderWeaponSelectModal();
    return;
  }
  
  if (game.state === 'playing') {
    updateGame();
    game.frame++;
    game.timeSeconds = game.frame / 60;
  }
  
  renderGame();
}

function updateGame() {
  handleInput();
  updateCamera();
  updatePassives();
  updateMagicBoltSpell();
  updateSniperRifleSpell();
  updateBoomerangSpell();
  updateProjectiles();
  updateBoomerangProjectiles();
  maybeSpawnEnemies();
  updateEnemies();
  updateOrbs();
  maybeSpawnBuffOrb();
  updateBuffOrbs();
  updateBlades();
  checkLevelUp();
  if (game.player.hp <= 0 && game.state !== 'gameover') {
    game.state = 'gameover';
  }
}

function renderGame() {
  push();
  applyCameraTransform();
  renderWorldBackground();
  renderOrbs();
  renderBuffOrbs();
  renderEnemies();
  renderProjectiles();
  renderSniperProjectiles();
  renderBoomerangProjectiles();
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

function updateCamera() {
  const cam = game.camera;
  const p = game.player;
  cam.x = p.x;
  cam.y = p.y;
}

function applyCameraTransform() {
  const cam = game.camera;
  translate(width / 2 - cam.x, height / 2 - cam.y);
}

function renderWorldBackground() {
  const gridSize = 120;
  const bounds = getWorldViewBounds(200);

  push();
  rectMode(CORNER);
  noStroke();
  fill(26);
  rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);

  stroke(45);
  strokeWeight(1);
  const startX = floor(bounds.left / gridSize) * gridSize;
  const endX = ceil(bounds.right / gridSize) * gridSize;
  for (let x = startX; x <= endX; x += gridSize) {
    line(x, bounds.top, x, bounds.bottom);
  }

  const startY = floor(bounds.top / gridSize) * gridSize;
  const endY = ceil(bounds.bottom / gridSize) * gridSize;
  for (let y = startY; y <= endY; y += gridSize) {
    line(bounds.left, y, bounds.right, y);
  }
  pop();
}
// Rendering delegations remain here for composition
