// Utility functions shared across systems
function inBounds(x, y, minX, minY, maxX, maxY) {
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

function getWorldViewBounds(expand = 0) {
  const cam = game.camera;
  const halfW = width / 2 + expand;
  const halfH = height / 2 + expand;
  return {
    left: cam.x - halfW,
    right: cam.x + halfW,
    top: cam.y - halfH,
    bottom: cam.y + halfH,
    width: halfW * 2,
    height: halfH * 2,
  };
}
