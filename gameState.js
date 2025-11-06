// Game state initialization and reset
function resetGame() {
  rngSeed = floor(random(1e9));
  randomSeed(rngSeed);
  noiseSeed(rngSeed);

  game = {
    state: 'playing', // 'playing' | 'levelup' | 'gameover'
    frame: 0,
    timeSeconds: 0,
    enemies: [],
    projectiles: [],
    orbs: [],
    spawn: {
      baseInterval: 70,
      minInterval: 18,
      interval: 70,
      lastSpawnFrame: 0,
      difficulty: 0 // increases slowly over time
    },
    player: {
      x: width / 2,
      y: height / 2,
      radius: 14,
      speed: 3,
      color: color(30, 144, 255),
      hp: 100,
      maxHp: 100,
      iframes: 0,
      fireCooldown: 0,
      fireCooldownMax: 30,
      damage: 14,
      bulletSpeed: 7,
      pierce: 0,
      level: 1,
      exp: 0,
      expToLevel: 30
    },
    spells: {
      magicBolt: { level: 1 },
      blades: { level: 0 }
    },
    pendingChoices: []
  };

  input = {
    up: false, down: false, left: false, right: false
  };
}


