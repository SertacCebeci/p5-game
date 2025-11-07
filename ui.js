// UI overlays and HUD
function renderUI() {
  const p = game.player;
  noStroke();
  // HP bar
  const hpW = 240,
    hpH = 14,
    hpX = 20,
    hpY = 20;
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
  const xpW = width - 40,
    xpH = 10,
    xpX = 20,
    xpY = height - 24;
  fill(60);
  rect(xpX, xpY, xpW, xpH, 4);
  fill(100, 200, 255);
  const xpPct = constrain(p.exp / p.expToLevel, 0, 1);
  rect(xpX, xpY, xpW * xpPct, xpH, 4);
  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text(`Level ${p.level}`, width / 2, xpY - 4);

  // Active buffs indicator
  if (p.activeBuffs.length > 0) {
    let buffY = hpY + hpH + 10;
    for (const buff of p.activeBuffs) {
      if (buff.type === "damage") {
        const timeLeft = (buff.remainingFrames / 60).toFixed(1);
        fill(220, 60, 60, 180);
        rect(hpX, buffY, 160, 20, 4);
        fill(255);
        textAlign(LEFT, CENTER);
        textSize(12);
        text(
          `🔥 ${buff.multiplier}x DAMAGE (${timeLeft}s)`,
          hpX + 6,
          buffY + 10
        );
        buffY += 24;
      }
    }
  }

  // Info text
  textAlign(LEFT, TOP);
  textSize(12);
  fill(200);
  const mb = getMagicBoltStats(game.spells.magicBolt.level);
  const blLvl = game.spells.blades.level;
  const bl = getBladesStats(blLvl);
  const sbLvl = game.spells.snipingBolt.level;
  const boomLvl = game.spells.chainingBolt.level;

  let infoY = 42;
  text(
    `Magic Bolt Lv ${game.spells.magicBolt.level} (DMG ${mb.damage}, CD ${mb.cooldownFrames}f, Pierce ${mb.pierce})   Magic Blades Lv ${blLvl} (Count ${bl.count})`,
    20,
    infoY
  );
  infoY += 16;

  if (sbLvl > 0) {
    const sb = getSnipingBoltStats(sbLvl);
    text(
      `Sniping Bolt Lv ${sbLvl} (DMG ${sb.damage}, CD ${sb.cooldownFrames}f, Pierce ${sb.pierce})`,
      20,
      infoY
    );
    infoY += 16;
  }

  if (boomLvl > 0) {
    const boom = getChainingBoltStats(boomLvl);
    text(
      `Chaining Bolt Lv ${boomLvl} (DMG ${boom.damage}, CD ${boom.cooldownFrames}f, Chains ${boom.chains}x)`,
      20,
      infoY
    );
    infoY += 16;
  }

  const pickupLvl = game.passives.pickupRadius.level;
  if (pickupLvl > 0) {
    const pickup = getPickupRadiusStats(pickupLvl);
    fill(100, 255, 200); // Green color for passives
    text(
      `🧲 Item Magnet Lv ${pickupLvl} (Radius: ${pickup.radius} units)`,
      20,
      infoY
    );
    infoY += 16;
    fill(200); // Reset color
  }
}

function renderGameOver() {
  fill(0, 180);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("Game Over", width / 2, height / 2 - 20);
  textSize(14);
  text("Press R to restart", width / 2, height / 2 + 16);
}
