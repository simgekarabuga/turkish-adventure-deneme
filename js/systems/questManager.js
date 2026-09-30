import { QUEST_DEFINITIONS } from "../../data/quests.js";
import { applyDeferredObjectiveProgress, applyObjectiveEvent, createObjectiveProgress, deferObjectiveEvent, isObjectiveSetComplete } from "./questObjectives.js";
import { applyQuestRewards } from "./questRewards.js";

/** Quest definitions are immutable content; all session progress lives in gameState. */
export class QuestManager {
  constructor(gameState, definitions = QUEST_DEFINITIONS, inventoryManager = null, progressionManager = null, eventBus = null) {
    this.gameState = gameState;
    this.definitions = definitions;
    this.inventoryManager = inventoryManager;
    this.progressionManager = progressionManager;
    this.eventBus = eventBus;
    gameState.quests ??= {};
    for (const definition of definitions) {
      gameState.quests[definition.id] ??= {
        status: "locked",
        objectives: definition.objectives.map(createObjectiveProgress),
        timesCompleted: 0,
        everCompleted: false,
      };
      gameState.quests[definition.id].timesCompleted ??= 0;
      gameState.quests[definition.id].everCompleted ??= gameState.quests[definition.id].status === "completed";
    }
    gameState.revealedQuests ??= [];
    this.refreshAvailability();
  }

  refreshAvailability() {
    for (const definition of this.definitions) {
      const progress = this.gameState.quests[definition.id];
      if (progress.status !== "locked") continue;
      const isRevealed = !definition.hidden || this.gameState.revealedQuests.includes(definition.id);
      const unlocked = isRevealed && (definition.prerequisites ?? []).every(
        (questId) => this.gameState.quests[questId]?.status === "completed",
      );
      if (unlocked) progress.status = "available";
    }
  }

  getStatus(questId) { return this.gameState.quests[questId]?.status ?? "locked"; }

  getAvailableQuests(npcId = null) {
    return this.definitions.filter((definition) =>
      this.isVisible(definition) && (this.getStatus(definition.id) === "available" || (definition.repeatable && this.getStatus(definition.id) === "completed")) && (!npcId || definition.giverNpcId === npcId),
    );
  }

  getActiveQuests() {
    return this.definitions
      .filter((definition) => this.getStatus(definition.id) === "active")
      .map((definition) => ({ ...definition, status: "active", objectives: this.gameState.quests[definition.id].objectives }));
  }

  startQuest(questId) {
    this.refreshAvailability();
    const definition = this.getDefinition(questId);
    const status = this.getStatus(questId);
    const canRepeat = definition?.repeatable && status === "completed";
    if (!definition || !this.isVisible(definition) || (status !== "available" && !canRepeat)) return false;
    const prerequisitesMet = (definition.prerequisites ?? []).every(
      (id) => this.getStatus(id) === "completed",
    );
    if (!prerequisitesMet) return false;
    if (canRepeat) this.gameState.quests[questId].objectives = definition.objectives.map(createObjectiveProgress);
    this.gameState.quests[questId].status = "active";
    this.syncExistingQuestProgress(definition, this.gameState.quests[questId].objectives);
    return true;
  }

  syncExistingQuestProgress(definition, objectives) {
    const discovered = this.gameState.discoveries?.locations ?? [];
    const claimedSources = this.gameState.itemSources?.claimed ?? [];
    for (const objective of objectives) {
      if (objective.type === "discover_location" && discovered.includes(objective.targetId)) {
        this.processObjectiveEvent({ type: "discover_location", targetId: objective.targetId, regionId: objective.regionId });
      }
      if (objective.type === "collect_item" && objective.sourceId && claimedSources.includes(objective.sourceId)
        && this.inventoryManager?.hasItem(objective.targetId, objective.requiredAmount, { sourceId: objective.sourceId })) {
        this.processObjectiveEvent({ type: "collect_item", targetId: objective.targetId, sourceId: objective.sourceId, regionId: objective.regionId, amount: objective.requiredAmount });
      }
    }
  }

  processObjectiveEvent(event) {
    let changed = false;
    for (const definition of this.definitions) {
      const progress = this.gameState.quests[definition.id];
      if (progress.status !== "active") continue;
      for (const objective of progress.objectives) {
        const unmetPrerequisites = (objective.requiresObjectives ?? []).some((requiredId) =>
          !progress.objectives.find((candidate) => candidate.id === requiredId)?.completed,
        );
        changed = (unmetPrerequisites
          ? deferObjectiveEvent(objective, event)
          : applyObjectiveEvent(objective, event)) || changed;
      }
      // Events may arrive out of order; release buffered progress as each earlier
      // objective completes, preserving objective order without losing pickups.
      let flushed;
      do {
        flushed = false;
        for (const objective of progress.objectives) {
          const prerequisitesMet = (objective.requiresObjectives ?? []).every((requiredId) =>
            progress.objectives.find((candidate) => candidate.id === requiredId)?.completed,
          );
          if (prerequisitesMet && applyDeferredObjectiveProgress(objective)) {
            changed = true;
            flushed = true;
          }
        }
      }
      while (flushed);
    }
    return changed;
  }

  canComplete(questId) {
    const progress = this.gameState.quests[questId];
    if (progress?.status !== "active" || !isObjectiveSetComplete(progress.objectives)) return false;
    const requirements = this.getTurnInRequirements(questId);
    for (const [itemId, requirement] of requirements) {
      if (!this.inventoryManager?.hasItem(itemId, requirement.total)) return false;
      for (const [sourceId, quantity] of requirement.sources) {
        if (!this.inventoryManager.hasItem(itemId, quantity, { sourceId })) return false;
      }
    }
    return true;
  }

  completeQuest(questId) {
    if (!this.canComplete(questId)) return false;
    const definition = this.getDefinition(questId);
    const progress = this.gameState.quests[questId];
    // Validate the complete bill first, then consume it before rewards/status change.
    // This keeps requirements reusable and prevents partial consumption on failure.
    const requirements = this.getTurnInRequirements(questId);
    const removals = [];
    for (const [itemId, requirement] of requirements) {
      for (const [sourceId, quantity] of requirement.sources) removals.push({ itemId, quantity, options: { sourceId } });
      if (requirement.unrestricted > 0) removals.push({ itemId, quantity: requirement.unrestricted, options: {} });
    }
    if (removals.some(({ itemId, quantity, options }) => !this.inventoryManager?.hasItem(itemId, quantity, options))) return false;
    for (const { itemId, quantity, options } of removals) {
      if (!this.inventoryManager.removeItem(itemId, quantity, options)) return false;
    }
    progress.status = "completed";
    progress.everCompleted = true;
    progress.timesCompleted += 1;
    applyQuestRewards(definition.rewards ?? [], this.gameState, {
      inventory: this.inventoryManager,
      progression: this.progressionManager,
      eventBus: this.eventBus,
    });
    this.processObjectiveEvent({ type: "complete_quest", targetId: questId });
    this.eventBus?.emit("quest_completed", { questId, amount: 1 });
    this.refreshAvailability();
    return true;
  }

  getNpcQuestAction(npcId) {
    const offers = this.definitions.filter((definition) => definition.giverNpcId === npcId && this.isVisible(definition));
    for (const definition of offers) {
      if (this.canComplete(definition.id)) return { action: "turn-in", questId: definition.id, title: definition.title };
    }
    for (const definition of offers) {
      if (this.getStatus(definition.id) === "available" || (definition.repeatable && this.getStatus(definition.id) === "completed")) {
        return { action: "accept", questId: definition.id, title: definition.title };
      }
    }
    for (const definition of offers) {
      if (this.getStatus(definition.id) === "active") return { action: "active", questId: definition.id, title: definition.title };
    }
    return null;
  }

  getNpcQuestIndicator(npcId) {
    const action = this.getNpcQuestAction(npcId);
    if (!action) return null;
    return action.action === "accept" ? "available" : action.action === "turn-in" ? "ready" : "active";
  }

  getDefinition(questId) { return this.definitions.find((definition) => definition.id === questId) ?? null; }

  getTurnInRequirements(questId) {
    const requirements = new Map();
    for (const entry of this.getDefinition(questId)?.turnInItems ?? []) {
      const requirement = requirements.get(entry.itemId) ?? { total: 0, unrestricted: 0, sources: new Map() };
      const quantity = entry.quantity ?? 1;
      requirement.total += quantity;
      if (entry.sourceId === undefined) requirement.unrestricted += quantity;
      else requirement.sources.set(entry.sourceId, (requirement.sources.get(entry.sourceId) ?? 0) + quantity);
      requirements.set(entry.itemId, requirement);
    }
    return requirements;
  }

  revealQuest(questId) {
    const definition = this.getDefinition(questId);
    if (!definition) return false;
    if (!this.gameState.revealedQuests.includes(questId)) this.gameState.revealedQuests.push(questId);
    this.refreshAvailability();
    return true;
  }

  isVisible(definition) {
    return !definition.hidden || this.gameState.revealedQuests.includes(definition.id);
  }
}
