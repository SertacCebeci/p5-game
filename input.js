// Keyboard input handlers
function keyPressed() {
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) input.up = true;
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) input.down = true;
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) input.left = true;
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) input.right = true;

  if (game.state === 'levelup') {
    if (key === '1') chooseUpgrade(0);
    if (key === '2') chooseUpgrade(1);
    if (key === '3') chooseUpgrade(2);
  }
  if (game.state === 'gameover' && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

function keyReleased() {
  if (key === 'w' || key === 'W' || keyCode === UP_ARROW) input.up = false;
  if (key === 's' || key === 'S' || keyCode === DOWN_ARROW) input.down = false;
  if (key === 'a' || key === 'A' || keyCode === LEFT_ARROW) input.left = false;
  if (key === 'd' || key === 'D' || keyCode === RIGHT_ARROW) input.right = false;
}


