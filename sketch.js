function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(240);
  noStroke();
  fill(30, 144, 255);
  const centerX = width / 2;
  const centerY = height / 2;
  const diameter = 40;
  circle(centerX, centerY, diameter);
}


