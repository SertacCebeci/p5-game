// Spell selection at game start
function getStartingSpellChoices() {
  return [
    {
      id: "magicBolt",
      name: "Magic Bolt",
      desc: "Balanced auto-fire projectile\nModerate damage & cooldown",
      details: "Start: 22 DMG, 30f CD",
      apply: () => {
        game.spells.magicBolt.level = 1;
      },
    },
    {
      id: "magicBlades",
      name: "Magic Blades",
      desc: "Spinning blades around you\nClose-range damage",
      details: "Start: 1 blade, 13 DMG",
      apply: () => {
        game.spells.blades.level = 1;
      },
    },
    {
      id: "snipingBolt",
      name: "Sniping Bolt",
      desc: "High damage, slow fire\nLong range precision",
      details: "Start: 80 DMG, 120f CD",
      apply: () => {
        game.spells.snipingBolt.level = 1;
      },
    },
    {
      id: "chainingBolt",
      name: "Chaining Bolt",
      desc: "Chains between enemies\nGreat for crowds",
      details: "Start: 3 chains, 35 DMG",
      apply: () => {
        game.spells.chainingBolt.level = 1;
      },
    },
  ];
}

function selectStartingSpell(index) {
  const choices = getStartingSpellChoices();
  const choice = choices[index];
  if (!choice) return;
  choice.apply();
  game.state = "playing";
}

function renderSpellSelectModal() {
  background(20);
  fill(0, 220);
  rect(0, 0, width, height);

  const panelW = min(500, width - 60);
  const panelH = min(height - 60, 850);
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;

  // Panel background with gradient effect
  fill(25);
  stroke(60, 80, 120);
  strokeWeight(2);
  rect(px, py, panelW, panelH, 12);
  noStroke();

  // Title with glow effect
  fill(120, 220, 255);
  textAlign(CENTER, TOP);
  textSize(28);
  text("Choose Your Starting Spell", width / 2, py + 24);

  fill(180, 200, 220);
  textSize(13);
  text("Select wisely - this will be your first spell!", width / 2, py + 60);

  // Spell cards - TOP DOWN layout
  const choices = getStartingSpellChoices();
  const num = choices.length;
  const gap = 18;
  const cardW = panelW - 60;
  const cardH = 110;
  const startY = py + 100;

  for (let i = 0; i < num; i++) {
    const cx = px + 30;
    const cy = startY + i * (cardH + gap);
    const choice = choices[i];

    // Check hover
    const isHovered =
      mouseX >= cx &&
      mouseX <= cx + cardW &&
      mouseY >= cy &&
      mouseY <= cy + cardH;

    // Card shadow
    if (isHovered) {
      fill(0, 150);
      rect(cx + 4, cy + 4, cardW, cardH, 10);
    }

    // Card background with gradient
    if (isHovered) {
      // Animated glow effect
      fill(55, 65, 85);
      stroke(120, 220, 255);
      strokeWeight(3);
      // Outer glow
      for (let g = 0; g < 3; g++) {
        stroke(120, 220, 255, 80 - g * 25);
        strokeWeight(3 + g * 2);
        rect(cx, cy, cardW, cardH, 10);
      }
      noStroke();
      fill(55, 65, 85);
    } else {
      fill(38, 42, 52);
      stroke(60, 70, 90);
      strokeWeight(1);
    }
    rect(cx, cy, cardW, cardH, 10);
    noStroke();

    // Left accent bar
    const accentColor = isHovered ? color(120, 220, 255) : color(80, 140, 200);
    fill(accentColor);
    rect(cx + 8, cy + 8, 4, cardH - 16, 2);

    // Spell name
    fill(255);
    textAlign(LEFT, TOP);
    textSize(isHovered ? 19 : 18);
    text(choice.name, cx + 24, cy + 14);

    // Description
    textSize(12);
    fill(isHovered ? 220 : 190);
    const lines = choice.desc.split("\n");
    let descY = cy + 42;
    for (const line of lines) {
      text(line, cx + 24, descY);
      descY += 17;
    }

    // Details box
    const detailBoxX = cx + cardW - 160;
    const detailBoxY = cy + cardH - 32;
    fill(isHovered ? 70 : 50);
    rect(detailBoxX, detailBoxY, 148, 24, 4);
    if (isHovered) {
      fill(140, 220, 255);
    } else {
      fill(100, 180, 230);
    }
    textAlign(CENTER, CENTER);
    textSize(11);
    text(choice.details, detailBoxX + 74, detailBoxY + 12);

    // Key hint with icon
    fill(isHovered ? 200 : 140);
    textSize(11);
    textAlign(RIGHT, CENTER);
    text(`[${i + 1}]`, cx + cardW - 14, cy + 18);
  }
}

// Upgrade system and level-up UI
function checkLevelUp() {
  const p = game.player;
  if (p.exp >= p.expToLevel && game.state === "playing") {
    p.exp -= p.expToLevel;
    p.level++;
    p.expToLevel = round(p.expToLevel * 1.25 + 10);
    game.pendingChoices = rollUpgradeChoices();
    game.state = "levelup";
  }
}

function rollUpgradeChoices() {
  const mbLvl = game.spells.magicBolt.level;
  const blLvl = game.spells.blades.level;
  const sbLvl = game.spells.snipingBolt.level;
  const boomLvl = game.spells.chainingBolt.level;
  const pickupLvl = game.passives.pickupRadius.level;

  const boltChoice = {
    id: "magicBolt",
    name: "Magic Bolt",
    desc: `Increase Magic Bolt to Lv ${mbLvl + 1}`,
    apply: () => {
      game.spells.magicBolt.level++;
    },
  };
  const bladesChoice = {
    id: "magicBlades",
    name: "Magic Blades",
    desc: `Increase Magic Blades to Lv ${blLvl + 1}`,
    apply: () => {
      game.spells.blades.level++;
    },
  };
  const snipingBoltChoice = {
    id: "snipingBolt",
    name: "Sniping Bolt",
    desc: `${
      sbLvl === 0 ? "Unlock" : "Increase to Lv " + (sbLvl + 1)
    } - High damage, slow fire`,
    apply: () => {
      game.spells.snipingBolt.level++;
    },
  };
  const chainingBoltChoice = {
    id: "chainingBolt",
    name: "Chaining Bolt",
    desc: `${
      boomLvl === 0 ? "Unlock" : "Increase to Lv " + (boomLvl + 1)
    } - Chains ${3 + boomLvl} times`,
    apply: () => {
      game.spells.chainingBolt.level++;
    },
  };
  const pickupRadiusChoice = {
    id: "pickupRadius",
    name: "Item Magnet",
    desc: `${
      pickupLvl === 0 ? "Unlock" : "Increase to Lv " + (pickupLvl + 1)
    } - Pickup radius +30`,
    apply: () => {
      game.passives.pickupRadius.level++;
      updatePickupRadiusPassive(); // Apply immediately
    },
  };

  // Randomly select 3 choices from the available options
  const allChoices = [
    boltChoice,
    bladesChoice,
    snipingBoltChoice,
    chainingBoltChoice,
    pickupRadiusChoice,
  ];
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
  game.state = "playing";
}

function renderLevelUpModal() {
  background(20);
  fill(0, 220);
  rect(0, 0, width, height);

  const panelW = min(500, width - 60);
  const panelH = min(height - 60, 650);
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;

  // Panel background with gradient effect
  fill(25);
  stroke(60, 80, 120);
  strokeWeight(2);
  rect(px, py, panelW, panelH, 12);
  noStroke();

  // Title with glow effect
  fill(255, 220, 100);
  textAlign(CENTER, TOP);
  textSize(28);
  text("⚡ LEVEL UP! ⚡", width / 2, py + 24);

  fill(180, 200, 220);
  textSize(13);
  text("Choose an upgrade to enhance your power", width / 2, py + 60);

  // Upgrade cards - TOP DOWN layout
  const choices = game.pendingChoices;
  const num = choices.length;
  const gap = 18;
  const cardW = panelW - 60;
  const cardH = 110;
  const startY = py + 100;

  for (let i = 0; i < num; i++) {
    const cx = px + 30;
    const cy = startY + i * (cardH + gap);
    const choice = choices[i];

    // Check hover
    const isHovered =
      mouseX >= cx &&
      mouseX <= cx + cardW &&
      mouseY >= cy &&
      mouseY <= cy + cardH;

    // Card shadow
    if (isHovered) {
      fill(0, 150);
      rect(cx + 4, cy + 4, cardW, cardH, 10);
    }

    // Card background with gradient
    if (isHovered) {
      // Animated glow effect
      fill(55, 65, 85);
      stroke(255, 220, 100);
      strokeWeight(3);
      // Outer glow
      for (let g = 0; g < 3; g++) {
        stroke(255, 220, 100, 80 - g * 25);
        strokeWeight(3 + g * 2);
        rect(cx, cy, cardW, cardH, 10);
      }
      noStroke();
      fill(55, 65, 85);
    } else {
      fill(38, 42, 52);
      stroke(60, 70, 90);
      strokeWeight(1);
    }
    rect(cx, cy, cardW, cardH, 10);
    noStroke();

    // Left accent bar
    const accentColor = isHovered ? color(255, 220, 100) : color(100, 150, 200);
    fill(accentColor);
    rect(cx + 8, cy + 8, 4, cardH - 16, 2);

    // Spell name
    fill(255);
    textAlign(LEFT, TOP);
    textSize(isHovered ? 19 : 18);
    text(choice.name, cx + 24, cy + 14);

    // Description
    textSize(12);
    fill(isHovered ? 220 : 190);
    const lines = choice.desc.split("\n");
    let descY = cy + 42;
    for (const line of lines) {
      text(line, cx + 24, descY);
      descY += 17;
    }

    // Key hint with icon
    fill(isHovered ? 200 : 140);
    textSize(11);
    textAlign(RIGHT, CENTER);
    text(`[${i + 1}]`, cx + cardW - 14, cy + 18);
  }
}

function mousePressed() {
  // Handle spell selection at start
  if (game.state === "spellSelect") {
    const choices = getStartingSpellChoices();
    const panelW = min(500, width - 60);
    const panelH = min(height - 60, 850);
    const px = (width - panelW) / 2;
    const py = (height - panelH) / 2;
    const num = choices.length;
    const gap = 18;
    const cardW = panelW - 60;
    const cardH = 110;
    const startY = py + 100;

    for (let i = 0; i < num; i++) {
      const cx = px + 30;
      const cy = startY + i * (cardH + gap);
      if (
        mouseX >= cx &&
        mouseX <= cx + cardW &&
        mouseY >= cy &&
        mouseY <= cy + cardH
      ) {
        selectStartingSpell(i);
        break;
      }
    }
    return;
  }

  // Handle level up choices
  if (game.state !== "levelup") return;
  const panelW = min(500, width - 60);
  const panelH = min(height - 60, 650);
  const px = (width - panelW) / 2;
  const py = (height - panelH) / 2;
  const num = game.pendingChoices.length;
  const gap = 18;
  const cardW = panelW - 60;
  const cardH = 110;
  const startY = py + 100;

  for (let i = 0; i < num; i++) {
    const cx = px + 30;
    const cy = startY + i * (cardH + gap);
    if (
      mouseX >= cx &&
      mouseX <= cx + cardW &&
      mouseY >= cy &&
      mouseY <= cy + cardH
    ) {
      chooseUpgrade(i);
      break;
    }
  }
}
