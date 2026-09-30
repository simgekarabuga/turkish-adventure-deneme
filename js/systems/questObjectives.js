const OBJECTIVE_MATCHERS = new Map([
  ["talk_to_npc", (objective, event) => event.type === "talk_to_npc"],
  ["reach_location", (objective, event) => event.type === "reach_location"],
  ["collect_item", (objective, event) => event.type === "collect_item"],
  ["discover_location", (objective, event) => event.type === "discover_location"],
  ["discover_location", (objective, event) => event.type === "discover_location"],
  ["complete_quest", (objective, event) => event.type === "complete_quest"],
]);

/** Register new objective families without changing QuestManager. */
export function registerObjectiveType(type, matcher) {
  if (typeof matcher !== "function") throw new TypeError("Objective matcher must be a function.");
  OBJECTIVE_MATCHERS.set(type, matcher);
}

export function createObjectiveProgress(definition) {
  if (!OBJECTIVE_MATCHERS.has(definition.type)) {
    throw new Error(`Unsupported quest objective type: ${definition.type}`);
  }
  const requiredAmount = Math.max(1, definition.requiredAmount ?? 1);
  return {
    ...definition,
    requiredAmount,
    currentProgress: 0,
    pendingProgress: 0,
    completed: false,
  };
}

export function matchesObjectiveEvent(objective, event) {
  const matcher = OBJECTIVE_MATCHERS.get(objective.type);
  if (!matcher?.(objective, event)) return false;
  if (objective.targetId !== undefined && objective.targetId !== event.targetId) return false;
  // Optional source constraints keep generic collect_item objectives precise.
  if (objective.sourceId !== undefined && objective.sourceId !== event.sourceId) return false;
  if (objective.regionId !== undefined && objective.regionId !== event.regionId) return false;
  return true;
}

export function applyObjectiveEvent(objective, event) {
  if (objective.completed || !matchesObjectiveEvent(objective, event)) return false;

  const amount = Math.max(1, event.amount ?? 1);
  objective.currentProgress = Math.min(objective.requiredAmount, objective.currentProgress + amount);
  objective.completed = objective.currentProgress >= objective.requiredAmount;
  return true;
}

/** Store a matching event until data-defined objective prerequisites are complete. */
export function deferObjectiveEvent(objective, event) {
  if (objective.completed || !matchesObjectiveEvent(objective, event)) return false;
  const amount = Math.max(1, event.amount ?? 1);
  const pending = objective.pendingProgress ?? 0;
  objective.pendingProgress = Math.min(objective.requiredAmount - objective.currentProgress, pending + amount);
  return objective.pendingProgress !== pending;
}

export function applyDeferredObjectiveProgress(objective) {
  const pending = objective.pendingProgress ?? 0;
  if (objective.completed || pending <= 0) return false;
  objective.pendingProgress = 0;
  objective.currentProgress = Math.min(objective.requiredAmount, objective.currentProgress + pending);
  objective.completed = objective.currentProgress >= objective.requiredAmount;
  return true;
}

export function isObjectiveSetComplete(objectives) {
  return objectives.length > 0 && objectives.every((objective) => objective.completed);
}
