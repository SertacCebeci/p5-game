// Weapon selection at game start
function getStartingWeaponChoices() {
  return [
    {
      id: 'magicBolt',
      name: 'Magic Bolt',
      desc: 'Balanced auto-fire projectile\nModerate damage & cooldown',
      details: 'Start: 22 DMG, 30f CD',
      apply: () => { game.spells.magicBolt.level = 1; }
    },
    {
      id: 'magicBlades',
      name: 'Magic Blades',
      desc: 'Spinning blades around you\nClose-range damage',
      details: 'Start: 1 blade, 13 DMG',
      apply: () => { game.spells.blades.level = 1; }
    },
    {
      id: 'sniperRifle',
      name: 'Sniper Rifle',
      desc: 'High damage, slow fire\nLong range precision',
      details: 'Start: 80 DMG, 120f CD',
      apply: () => { game.spells.sniperRifle.level = 1; }
    },
    {
      id: 'boomerang',
      name: 'Boomerang',
      desc: 'Chains between enemies\nGreat for crowds',
      details: 'Start: 3 chains, 35 DMG',
      apply: () => { game.spells.boomerang.level = 1; }
    }
  ];
}

function selectStartingWeapon(index) {
  const choices = getStartingWeaponChoices();
  const choice = choices[index];
  if (!choice) return;
  choice.apply();
  game.state = 'playing';
}

function renderWeaponSelectModal() {
  background(20);
  fill(0, 200);
  rect(0, 0, width, height);
  
  const panelW = min(800, width - 60);
  const panelH = 380;
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;
  
  // Panel background
  fill(30);
  rect(px, py, panelW, panelH, 10);
  
  // Title
  fill(100, 200, 255);
  textAlign(CENTER, TOP);
  textSize(24);
  text('Choose Your Starting Weapon', width / 2, py + 20);
  
  fill(200);
  textSize(14);
  text('Select wisely - this will be your first weapon!', width / 2, py + 52);
  
  // Weapon cards
  const choices = getStartingWeaponChoices();
  const num = choices.length;
  const gap = 16;
  const cardW = (panelW - gap * (num + 1)) / num;
  const cardH = panelH - 120;
  
  for (let i = 0; i < num; i++) {
    const cx = px + gap + i * (cardW + gap);
    const cy = py + 90;
    const choice = choices[i];
    
    // Card background - highlight on hover
    const isHovered = mouseX >= cx && mouseX <= cx + cardW && 
                     mouseY >= cy && mouseY <= cy + cardH;
    
    if (isHovered) {
      fill(60);
      stroke(100, 200, 255);
      strokeWeight(3);
    } else {
      fill(45);
      stroke(70);
      strokeWeight(1);
    }
    rect(cx, cy, cardW, cardH, 8);
    noStroke();
    
    // Weapon name
    fill(255);
    textAlign(CENTER, TOP);
    textSize(16);
    text(choice.name, cx + cardW / 2, cy + 12);
    
    // Description
    textSize(12);
    fill(200);
    const lines = choice.desc.split('\n');
    let descY = cy + 40;
    for (const line of lines) {
      text(line, cx + cardW / 2, descY);
      descY += 16;
    }
    
    // Details box
    fill(40);
    rect(cx + 8, cy + cardH - 80, cardW - 16, 50, 4);
    fill(100, 200, 255);
    textSize(11);
    text(choice.details, cx + cardW / 2, cy + cardH - 65);
    
    // Key hint
    fill(160);
    textSize(13);
    text(`Press ${i + 1} or Click`, cx + cardW / 2, cy + cardH - 22);
  }
}

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
  const srLvl = game.spells.sniperRifle.level;
  const boomLvl = game.spells.boomerang.level;
  const pickupLvl = game.passives.pickupRadius.level;
  
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
  const sniperChoice = {
    id: 'sniperRifle',
    name: 'Sniper Rifle',
    desc: `${srLvl === 0 ? 'Unlock' : 'Increase to Lv ' + (srLvl + 1)} - High damage, slow fire`,
    apply: () => { game.spells.sniperRifle.level++; }
  };
  const boomerangChoice = {
    id: 'boomerang',
    name: 'Boomerang',
    desc: `${boomLvl === 0 ? 'Unlock' : 'Increase to Lv ' + (boomLvl + 1)} - Chains ${3 + boomLvl} times`,
    apply: () => { game.spells.boomerang.level++; }
  };
  const pickupRadiusChoice = {
    id: 'pickupRadius',
    name: 'Item Magnet',
    desc: `${pickupLvl === 0 ? 'Unlock' : 'Increase to Lv ' + (pickupLvl + 1)} - Pickup radius +30`,
    apply: () => { 
      game.passives.pickupRadius.level++;
      updatePickupRadiusPassive(); // Apply immediately
    }
  };
  
  // Randomly select 3 choices from the available options
  const allChoices = [boltChoice, bladesChoice, sniperChoice, boomerangChoice, pickupRadiusChoice];
  const selected = [];
  const indices = [0, 1, 2, 3, 4];
  
  // Shuffle and pick 3
  for (let i = indices.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  for (let i = 0; i < 3; i++) {
    selected.push(allChoices[indices[i]]);
  }
  
  return selected;
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
  // Handle weapon selection at start
  if (game.state === 'weaponSelect') {
    const choices = getStartingWeaponChoices();
    const panelW = min(800, width - 60);
    const panelH = 380;
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;
    const num = choices.length;
    const gap = 16;
    const cardW = (panelW - gap * (num + 1)) / num;
    const cardH = panelH - 120;
    
    for (let i = 0; i < num; i++) {
      const cx = px + gap + i * (cardW + gap);
      const cy = py + 90;
      if (mouseX >= cx && mouseX <= cx + cardW && mouseY >= cy && mouseY <= cy + cardH) {
        selectStartingWeapon(i);
        break;
      }
    }
    return;
  }
  
  // Handle level up choices
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


