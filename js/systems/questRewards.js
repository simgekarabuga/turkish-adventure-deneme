const REWARD_HANDLERS = new Map();

export function registerRewardType(type, handler) {
  if (typeof handler !== "function") throw new TypeError("Reward handler must be a function.");
  REWARD_HANDLERS.set(type, handler);
}

registerRewardType("xp", (reward, state, systems) => {
  if (!systems.progression) throw new Error("XP rewards require a ProgressionManager.");
  systems.progression.addXp(reward.amount ?? 0);
});
registerRewardType("coins", (reward, state, systems) => {
  if (!systems.progression) throw new Error("Coin rewards require a ProgressionManager.");
  systems.progression.addCoins(reward.amount ?? 0);
});
registerRewardType("items", (reward, state, systems) => {
  const amount = Math.max(1, reward.amount ?? 1);
  if (systems.inventory) {
    if (!systems.inventory.addItem(reward.itemId, amount)) throw new Error(`Unable to award item: ${reward.itemId}`);
    return;
  }
  const existing = state.player.inventory.find((item) => (item.itemId ?? item.id) === reward.itemId);
  if (existing) {
    if (existing.quantity !== undefined) existing.quantity += amount;
    else existing.amount += amount;
  } else state.player.inventory.push({ itemId: reward.itemId, quantity: amount });
});
registerRewardType("achievement", (reward, state, systems) => systems.eventBus?.emit("achievement_granted", { achievementId: reward.id }));

export function applyQuestRewards(rewards, gameState, systems = {}) {
  for (const reward of rewards) {
    const handler = REWARD_HANDLERS.get(reward.type);
    if (!handler) throw new Error(`Unsupported quest reward type: ${reward.type}`);
    handler(reward, gameState, systems);
  }
}
