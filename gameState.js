// Game state initialization and reset
function resetGame() {
  rngSeed = floor(random(1e9));
  randomSeed(rngSeed);
  noiseSeed(rngSeed);

  game = {
    state: "spellSelect", // 'spellSelect' | 'playing' | 'levelup' | 'gameover'
    frame: 0,
    timeSeconds: 0,
    enemies: [],
    projectiles: [],
    chainingBoltProjectiles: [],
    orbs: [],
    buffOrbs: [],
    spawn: {
      baseInterval: 70,
      minInterval: 18,
      interval: 70,
      lastSpawnFrame: 0,
      difficulty: 0, // increases slowly over time
    },
    camera: {
      x: 0,
      y: 0,
    },
    player: {
      x: 0,
      y: 0,
      radius: 14,
      speed: 3,
      color: color(30, 144, 255),
      hp: 100,
      maxHp: 100,
      iframes: 0,
      level: 1,
      exp: 0,
      expToLevel: 30,
      activeBuffs: [],
      pickupRadius: 90, // Base pickup radius for orbs
    },
    spells: {
      magicBolt: { level: 0, cooldown: 0 },
      blades: { level: 0 },
      snipingBolt: { level: 0, cooldown: 0 },
      chainingBolt: { level: 0, cooldown: 0 },
    },
    passives: {
      pickupRadius: { level: 0 },
    },
    pendingChoices: [],
  };

  input = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
}
