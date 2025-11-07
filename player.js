// Player movement, shooting, and rendering
function handleInput() {
  const p = game.player;
  let vx = 0, vy = 0;
  if (input.left) vx -= 1;
  if (input.right) vx += 1;
  if (input.up) vy -= 1;
  if (input.down) vy += 1;
  if (vx !== 0 || vy !== 0) {
    const mag = sqrt(vx * vx + vy * vy);
    vx /= mag; vy /= mag;
    p.x += vx * p.speed;
    p.y += vy * p.speed;
  }
  if (game.player.iframes > 0) game.player.iframes--;
}

function renderPlayer() {
  const p = game.player;
  noStroke();
  fill(p.color);
  circle(p.x, p.y, p.radius * 2);
  // brief blink on i-frames
  if (p.iframes % 6 < 3 && p.iframes > 0) {
    stroke(255);
    noFill();
    circle(p.x, p.y, p.radius * 2 + 6);
  }
}


