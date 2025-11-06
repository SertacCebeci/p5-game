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
  renderOrbs();
  renderEnemies();
  renderProjectiles();
  renderPlayer();
  renderBlades();
  renderUI();
  if (game.state === 'levelup') {
    renderLevelUpModal();
  } else if (game.state === 'gameover') {
    renderGameOver();
  }
}
// Rendering delegations remain here for composition
