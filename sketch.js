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
  push();
  const p = game.player;
  translate(width / 2 - p.x, height / 2 - p.y);
  renderBackgroundGrid();
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

function renderBackgroundGrid() {
  const spacing = 120;
  const margin = spacing * 2;
  const halfW = width / 2 + margin;
  const halfH = height / 2 + margin;
  const left = game.player.x - halfW;
  const right = game.player.x + halfW;
  const top = game.player.y - halfH;
  const bottom = game.player.y + halfH;

  const startX = floor(left / spacing) * spacing;
  const startY = floor(top / spacing) * spacing;

  stroke(40);
  strokeWeight(1);
  for (let x = startX; x <= right; x += spacing) {
    line(x, top, x, bottom);
  }
  for (let y = startY; y <= bottom; y += spacing) {
    line(left, y, right, y);
  }

  // Highlight the world origin axes when visible
  stroke(70, 70, 110);
  strokeWeight(2);
  if (0 >= left && 0 <= right) {
    line(0, top, 0, bottom);
  }
  if (0 >= top && 0 <= bottom) {
    line(left, 0, right, 0);
  }
  noStroke();
}
// Rendering delegations remain here for composition
