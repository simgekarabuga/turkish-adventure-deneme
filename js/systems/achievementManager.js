import { ACHIEVEMENT_DEFINITIONS } from "../../data/achievements.js";

/** Tracks generic event criteria and publishes each unlock once. */
export class AchievementManager {
  constructor(gameState, eventBus, definitions = ACHIEVEMENT_DEFINITIONS, onReward = () => {}) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.definitions = definitions;
    this.onReward = onReward;
    this.notifications = [];
    gameState.progression.achievements ??= {};
    for (const definition of definitions) {
      gameState.progression.achievements[definition.id] ??= { unlocked: false, progress: 0, uniqueIds: [] };
    }
    this.unsubscribe = new Set();
    for (const definition of definitions) {
      this.unsubscribe.add(eventBus.on(definition.criteria.eventType, (event) => this.processEvent(definition, event)));
    }
  }

  processEvent(definition, event) {
    const progress = this.gameState.progression.achievements[definition.id];
    const criteria = definition.criteria;
    if (progress.unlocked || (criteria.targetId !== undefined && criteria.targetId !== event.targetId)) return false;

    if (criteria.requiredRegionIds) {
      if (!criteria.requiredRegionIds.includes(event.regionId) || progress.uniqueIds.includes(event.regionId)) return false;
      progress.uniqueIds.push(event.regionId);
      progress.progress = progress.uniqueIds.length;
    } else if (criteria.requiredLevel !== undefined) {
      progress.progress = Math.max(progress.progress, event.level ?? 0);
    } else {
      progress.progress = Math.min(criteria.requiredAmount ?? 1, progress.progress + (event.amount ?? 1));
    }

    const complete = criteria.requiredRegionIds
      ? criteria.requiredRegionIds.every((regionId) => progress.uniqueIds.includes(regionId))
      : criteria.requiredLevel !== undefined
        ? progress.progress >= criteria.requiredLevel
        : progress.progress >= (criteria.requiredAmount ?? 1);
    if (complete) this.unlock(definition, progress);
    return true;
  }

  unlock(definition, progress) {
    if (progress.unlocked) return false;
    progress.unlocked = true;
    progress.unlockedAtSession = true;
    if (definition.reward) this.onReward(definition.reward);
    const notification = `Achievement unlocked: ${definition.title}`;
    this.notifications.push(notification);
    this.eventBus.emit("achievement_unlocked", { achievementId: definition.id, title: definition.title });
    return true;
  }

  getAll() {
    return this.definitions.filter((definition) => !definition.hidden || this.gameState.progression.achievements[definition.id]?.unlocked)
      .map((definition) => ({ ...definition, ...this.gameState.progression.achievements[definition.id] }));
  }
  getUnlocked() { return this.getAll().filter((entry) => entry.unlocked); }
  getLocked() { return this.getAll().filter((entry) => !entry.unlocked); }
  consumeNotification() { return this.notifications.shift() ?? null; }
  destroy() { for (const unsubscribe of this.unsubscribe) unsubscribe(); this.unsubscribe.clear(); }
}
