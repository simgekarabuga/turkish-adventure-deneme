import { GAME_CONFIG } from "../config.js";
import { createWorld } from "../world/world.js";
import { Player } from "../entities/player.js";
import { createInput } from "../systems/input.js";
import { Camera } from "../systems/camera.js";
import { createRenderer } from "../systems/renderer.js";
import { createGameState } from "./gameState.js";
import { findRegionTransition } from "../systems/regionTransitions.js";
import { NPCManager } from "../systems/npcManager.js";
import { InteractionSystem } from "../systems/interaction.js";
import { QuestManager } from "../systems/questManager.js";
import { QuestIntegrationSystem } from "../systems/questIntegration.js";
import { LocationSystem } from "../systems/locationSystem.js";
import { InventoryManager } from "../systems/inventoryManager.js";
import { InventoryController } from "../systems/inventoryController.js";
import { InventoryQuestBridge } from "../systems/inventoryQuestBridge.js";
import { GameEventBus } from "../systems/gameEventBus.js";
import { ProgressionManager } from "../systems/progressionManager.js";
import { AchievementManager } from "../systems/achievementManager.js";
import { ProgressionController } from "../systems/progressionController.js";
import { ProgressionUI } from "../systems/progressionUI.js";
import { DiscoveryManager } from "../systems/discoveryManager.js";
import { DiscoveryQuestBridge } from "../systems/discoveryQuestBridge.js";
import { ItemSourceManager } from "../systems/itemSourceManager.js";
import { PickupInteraction } from "../systems/pickupInteraction.js";
import { TelephoneBoothSystem } from "../systems/telephoneBooth.js";

export function createGame(canvas) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser does not support the 2D canvas context.");
  canvas.width = GAME_CONFIG.canvasWidth;
  canvas.height = GAME_CONFIG.canvasHeight;

  const state = createGameState();
  let world = createWorld(state.currentRegionId);
  const player = new Player(state.player.x, state.player.y);
  const input = createInput();
  const camera = new Camera(canvas.width, canvas.height);
  const renderer = createRenderer(context, canvas.width, canvas.height);
  const npcManager = new NPCManager();
  npcManager.setRegion(state.currentRegionId);
  const eventBus = new GameEventBus();
  let debug = GAME_CONFIG.debugMode;
  const telephoneBooth = new TelephoneBoothSystem(state, eventBus, () => debug);
  const inventory = new InventoryManager(state);
  const itemSources = new ItemSourceManager(state, inventory, eventBus);
  const progression = new ProgressionManager(state, eventBus);
  const achievements = new AchievementManager(state, eventBus, undefined, (reward) => {
    if (reward.type === "xp") progression.addXp(reward.amount ?? 0);
    else if (reward.type === "coins") progression.addCoins(reward.amount ?? 0);
    else if (reward.type === "items") inventory.addItem(reward.itemId, reward.amount ?? 1);
  });
  const questManager = new QuestManager(state, undefined, inventory, progression, eventBus);
  const inventoryQuestBridge = new InventoryQuestBridge(inventory, questManager, eventBus);
  const discovery = new DiscoveryManager(state, eventBus);
  const discoveryQuestBridge = new DiscoveryQuestBridge(eventBus, questManager);
  const inventoryController = new InventoryController(input, inventory);
  const pickupInteraction = new PickupInteraction(itemSources, input);
  const progressionController = new ProgressionController(input, progression);
  const progressionUI = new ProgressionUI(input, progression, achievements, eventBus, discovery);
  const questIntegration = new QuestIntegrationSystem(questManager);
  const locationSystem = new LocationSystem();
  const interaction = new InteractionSystem(
    npcManager, undefined,
    (npc) => {
      questIntegration.onNpcTalk(npc);
      itemSources.claimForNPC(npc.id);
    },
    () => eventBus.emit("dialogue_completed"),
    (npc) => {
      const action = questManager.getNpcQuestAction(npc.id);
      const activeDefinition = action ? questManager.getDefinition(action.questId) : null;
      if (activeDefinition) {
        const dialogueIds = activeDefinition.dialogueIds ?? {};
        if (action.action === "accept" && dialogueIds.offer) return dialogueIds.offer;
        if (action.action === "turn-in" && dialogueIds.turnIn) return dialogueIds.turnIn;
        if (action.action === "active") {
          const objectiveProgress = state.quests[activeDefinition.id]?.objectives ?? [];
          const activeVariant = (dialogueIds.activeVariants ?? []).find((variant) =>
            (variant.requiresObjectives ?? []).every((requiredId) => objectiveProgress.some((objective) => objective.id === requiredId && objective.completed)),
          );
          return activeVariant?.dialogueId ?? dialogueIds.active ?? npc.dialogueId;
        }
      }
      const completedDefinition = questManager.definitions.find((definition) =>
        definition.giverNpcId === npc.id && questManager.getStatus(definition.id) === "completed"
        && definition.dialogueIds?.afterCompletion,
      );
      return completedDefinition?.dialogueIds.afterCompletion ?? npc.dialogueId;
    },
    (target) => telephoneBooth.start(target.id),
  );
  eventBus.emit("region_entered", { regionId: state.currentRegionId });
  let animationFrameId = null;
  let isRunning = false;
  let previousTime = 0;
  let fps = 0;

  function frame(timestamp) {
    if (!isRunning) return;
    const rawDelta = previousTime === 0 ? 0 : (timestamp - previousTime) / 1000;
    previousTime = timestamp;
    const deltaTime = Math.min(rawDelta, 0.05); // Avoid large steps after the tab resumes.
    const frameTime = rawDelta * 1000;
    if (rawDelta > 0) fps = fps === 0 ? 1 / rawDelta : fps * 0.9 + (1 / rawDelta) * 0.1;

    const telephoneHandledInput = telephoneBooth.update(deltaTime, input);
    const telephoneBusy = telephoneBooth.isBlockingPlayer();

    // Keep the frame stages explicit as systems are added in later steps.
    if (input.consumeDebugToggle()) debug = !debug;
    progressionController.update(debug);
    progressionUI.update(deltaTime, telephoneBusy || telephoneHandledInput || inventoryController.isOpen() || Boolean(interaction.getDialogueState()));
    inventoryController.update(deltaTime, debug, telephoneBusy || telephoneHandledInput || Boolean(interaction.getDialogueState()), progressionUI.isOpen());
    const inventoryOpen = inventoryController.isOpen();
    let nearbyPickup = null;
    if (!interaction.getDialogueState() && !inventoryOpen && !telephoneBusy) {
      player.update(deltaTime, input, world, npcManager.getCollisionBounds());
    }
    const transition = interaction.getDialogueState() || inventoryOpen || telephoneBusy ? null : findRegionTransition(state.currentRegionId, player);
    if (transition) {
      const previousRegionId = state.currentRegionId;
      state.currentRegionId = transition.regionId;
      player.x = transition.spawn.x;
      player.y = transition.spawn.y;
      world = createWorld(state.currentRegionId);
      npcManager.setRegion(state.currentRegionId);
      eventBus.emit("region_entered", { regionId: state.currentRegionId, previousRegionId });
    }
    npcManager.update(deltaTime);
    if (!inventoryOpen && !telephoneHandledInput && !telephoneBusy) {
      if (!interaction.getDialogueState()) nearbyPickup = pickupInteraction.update(player, state.currentRegionId);
      interaction.update(player, input, telephoneBooth.getInteractionTargets(state.currentRegionId));
      locationSystem.update(player, state.currentRegionId, (location) => {
        questIntegration.onLocationReached(location);
      });
      discovery.update(player, state.currentRegionId);
      questIntegration.update(input, interaction.getNearbyNpc());
    }
    state.player.x = player.x;
    state.player.y = player.y;
    camera.follow(player, world);
    const activeNpcs = npcManager.getAll();
    const questIndicators = new Map(activeNpcs.map((npc) => [npc.id, questIntegration.getNpcIndicator(npc.id)]));
    const nearbyNpc = interaction.getNearbyNpc();
    renderer.render(
      world, player, camera, activeNpcs, interaction.getNearbyTarget(), interaction.getDialogueState(),
      questIndicators, nearbyNpc ? questManager.getNpcQuestAction(nearbyNpc.id) : null,
      questIntegration.getJournalEntries(), debug, { fps, frameTime }, inventoryController.getUIState(),
      progressionUI.getView(), itemSources.getPickups(state.currentRegionId), nearbyPickup, telephoneBooth.getUIState(),
    );
    animationFrameId = window.requestAnimationFrame(frame);
  }

  return {
    getState() { return state; },
    getNPCs() { return npcManager.getAll(); },
    getQuestManager() { return questManager; },
    getInventoryManager() { return inventory; },
    getInventoryController() { return inventoryController; },
    getProgressionManager() { return progression; },
    getAchievementManager() { return achievements; },
    getDiscoveryManager() { return discovery; },
    getInteractionState() {
      return { nearbyNpc: interaction.getNearbyNpc(), dialogue: interaction.getDialogueState() };
    },
    start() {
      if (isRunning) return;
      isRunning = true;
      animationFrameId = window.requestAnimationFrame(frame);
    },
    stop() {
      isRunning = false;
      if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    },
    destroy() {
      this.stop();
      inventoryQuestBridge.destroy();
      discoveryQuestBridge.destroy();
      progressionUI.destroy();
      achievements.destroy();
      telephoneBooth.destroy();
      eventBus.destroy();
      input.destroy();
    },
  };
}
