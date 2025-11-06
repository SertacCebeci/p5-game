// UI overlays and HUD
function renderUI() {
  const p = game.player;
  noStroke();
  // HP bar
  const hpW = 240, hpH = 14, hpX = 20, hpY = 20;
  fill(60);
  rect(hpX, hpY, hpW, hpH, 4);
  fill(220, 70, 70);
  const hpPct = constrain(p.hp / p.maxHp, 0, 1);
  rect(hpX, hpY, hpW * hpPct, hpH, 4);
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(`HP: ${max(0, p.hp)} / ${p.maxHp}`, hpX + 6, hpY + hpH / 2);

  // EXP bar
  const xpW = width - 40, xpH = 10, xpX = 20, xpY = height - 24;
  fill(60);
  rect(xpX, xpY, xpW, xpH, 4);
  fill(100, 200, 255);
  const xpPct = constrain(p.exp / p.expToLevel, 0, 1);
  rect(xpX, xpY, xpW * xpPct, xpH, 4);
  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text(`Level ${p.level}`, width / 2, xpY - 4);

  // Info text
  textAlign(LEFT, TOP);
  textSize(12);
  fill(200);
  const mb = getMagicBoltStats(game.spells.magicBolt.level);
  const blLvl = game.spells.blades.level;
  const bl = getBladesStats(blLvl);
  text(`Magic Bolt Lv ${game.spells.magicBolt.level} (DMG ${mb.damage}, CD ${mb.cooldownFrames}f, Pierce ${mb.pierce})   Magic Blades Lv ${blLvl} (Count ${bl.count})`, 20, 42);
}

function renderGameOver() {
  fill(0, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text('Game Over', width / 2, height / 2 - 20);
  textSize(14);
  text('Press R to restart', width / 2, height / 2 + 16);
}


