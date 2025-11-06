// Upgrade system and level-up UI
function checkLevelUp() {
  const p = game.player;
  if (p.exp >= p.expToLevel && game.state === 'playing') {
    p.exp -= p.expToLevel;
    p.level++;
    p.expToLevel = round(p.expToLevel * 1.25 + 10);
    game.pendingChoices = rollUpgradeChoices();
    game.state = 'levelup';
  }
}

function rollUpgradeChoices() {
  const mbLvl = game.spells.magicBolt.level;
  const blLvl = game.spells.blades.level;
  const boltChoice = {
    id: 'magicBolt',
    name: 'Magic Bolt',
    desc: `Increase Magic Bolt to Lv ${mbLvl + 1}`,
    apply: () => { game.spells.magicBolt.level++; }
  };
  const bladesChoice = {
    id: 'magicBlades',
    name: 'Magic Blades',
    desc: `Increase Magic Blades to Lv ${blLvl + 1}`,
    apply: () => { game.spells.blades.level++; }
  };
  return [boltChoice, bladesChoice];
}

function chooseUpgrade(index) {
  const choice = game.pendingChoices[index];
  if (!choice) return;
  choice.apply();
  game.pendingChoices = [];
  game.state = 'playing';
}

function renderLevelUpModal() {
  fill(0, 180);
  rect(0, 0, width, height);
  const panelW = min(680, width - 80);
  const panelH = 240;
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;
  fill(30);
  rect(px, py, panelW, panelH, 10);
  fill(255);
  textAlign(CENTER, TOP);
  textSize(18);
  text('Choose a spell to level up', width / 2, py + 16);

  const num = game.pendingChoices.length;
  const gap = 20;
  const cardW = (panelW - gap * (num + 1)) / num;
  const cardH = panelH - 70;
  for (let i = 0; i < num; i++) {
    const cx = px + gap + i * (cardW + gap);
    const cy = py + 50;
    fill(45);
    rect(cx, cy, cardW, cardH, 8);
    const choice = game.pendingChoices[i];
    fill(255);
    textAlign(CENTER, TOP);
    textSize(16);
    text(choice.name, cx + cardW / 2, cy + 10);
    textSize(12);
    fill(200);
    text(choice.desc, cx + cardW / 2, cy + 40);
    // hint
    fill(160);
    textSize(11);
    text(`Click or press ${i + 1}`, cx + cardW / 2, cy + cardH - 22);
  }
}

function mousePressed() {
  if (game.state !== 'levelup') return;
  const panelW = min(680, width - 80);
  const panelH = 240;
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;
  const num = game.pendingChoices.length;
  const gap = 20;
  const cardW = (panelW - gap * (num + 1)) / num;
  const cardH = panelH - 70;
  for (let i = 0; i < num; i++) {
    const cx = px + gap + i * (cardW + gap);
    const cy = py + 50;
    if (mouseX >= cx && mouseX <= cx + cardW && mouseY >= cy && mouseY <= cy + cardH) {
      chooseUpgrade(i);
      break;
    }
  }
}


