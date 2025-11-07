// Passive abilities and their effects

// Update player pickup radius based on passive level
function updatePickupRadiusPassive() {
  const passive = game.passives && game.passives.pickupRadius;
  if (!passive) return;
  
  const p = game.player;
  const baseRadius = 90;
  const bonusPerLevel = 30; // +30 units per level
  
  p.pickupRadius = baseRadius + (passive.level * bonusPerLevel);
}

// Get pickup radius stats for display
function getPickupRadiusStats(level) {
  const lvl = max(0, floor(level || 0));
  const baseRadius = 90;
  const bonusPerLevel = 30;
  const totalRadius = baseRadius + (lvl * bonusPerLevel);
  
  return {
    radius: totalRadius,
    bonus: lvl * bonusPerLevel,
  };
}

// Update all passives
function updatePassives() {
  updatePickupRadiusPassive();
}

