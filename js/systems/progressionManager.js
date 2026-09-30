import { xpThresholdForLevel } from "../../data/progression.js";

/** Owns all XP, level, and spendable coin values in the session. */
export class ProgressionManager {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    if (!gameState.progression) {
      gameState.progression = {
        level: Math.max(1, gameState.player?.level ?? 1),
        xp: Math.max(0, gameState.player?.xp ?? 0),
        coins: Math.max(0, gameState.player?.coins ?? 0),
        achievements: {},
      };
    }
    const progression = gameState.progression;
    progression.xp ??= gameState.player?.xp ?? 0;
    progression.level ??= gameState.player?.level ?? 1;
    progression.coins ??= gameState.player?.coins ?? 0;
    progression.achievements ??= gameState.player?.achievements ?? {};
    if (Array.isArray(progression.achievements)) {
      progression.achievements = Object.fromEntries(progression.achievements.map((id) => [id, { unlocked: true, progress: 1, uniqueIds: [] }]));
    }
    progression.xp = Math.max(0, Number(progression.xp) || 0);
    progression.level = this.levelForXp(progression.xp);
    progression.coins = Math.max(0, Number(progression.coins) || 0);
    // Legacy fields are migrated at the boundary so values have one source of truth.
    if (gameState.player) {
      delete gameState.player.xp;
      delete gameState.player.coins;
      delete gameState.player.achievements;
    }
  }

  levelForXp(xp) {
    let level = 1;
    while (xp >= xpThresholdForLevel(level + 1)) level += 1;
    return level;
  }

  addXp(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    const progression = this.gameState.progression;
    const oldLevel = progression.level;
    progression.xp += amount;
    progression.level = this.levelForXp(progression.xp);
    this.eventBus?.emit("xp_earned", { amount, totalXp: progression.xp });
    if (progression.level > oldLevel) {
      for (let level = oldLevel + 1; level <= progression.level; level += 1) {
        this.eventBus?.emit("level_up", { level, previousLevel: level - 1 });
        this.eventBus?.emit("level_reached", { level });
      }
    }
    return progression.level - oldLevel;
  }

  addCoins(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return false;
    this.gameState.progression.coins += amount;
    this.eventBus?.emit("coins_earned", { amount, totalCoins: this.gameState.progression.coins });
    return true;
  }

  hasCoins(amount) { return Number.isFinite(amount) && amount >= 0 && this.gameState.progression.coins >= amount; }
  removeCoins(amount) {
    if (!Number.isFinite(amount) || amount <= 0 || !this.hasCoins(amount)) return false;
    this.gameState.progression.coins -= amount;
    this.eventBus?.emit("coins_spent", { amount, totalCoins: this.gameState.progression.coins });
    return true;
  }

  getSnapshot() {
    const { level, xp, coins } = this.gameState.progression;
    const levelStartXp = xpThresholdForLevel(level);
    const nextLevelXp = xpThresholdForLevel(level + 1);
    return { level, xp, totalXp: xp, xpIntoLevel: xp - levelStartXp, xpForNextLevel: nextLevelXp - levelStartXp, coins };
  }
}
