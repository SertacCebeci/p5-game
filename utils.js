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

function compactAlive(list) {
  if (!list || list.length === 0) return list;
  let writeIndex = 0;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item && item.alive) {
      list[writeIndex++] = item;
    }
  }
  list.length = writeIndex;
  return list;
}
