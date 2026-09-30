import { ITEM_SOURCE_DEFINITIONS } from "../../data/itemSources.js";

/** Claims data-defined NPC rewards and world pickups through the shared inventory API. */
export class ItemSourceManager {
  constructor(gameState, inventory, eventBus, definitions = ITEM_SOURCE_DEFINITIONS) {
    this.gameState = gameState;
    this.inventory = inventory;
    this.eventBus = eventBus;
    this.definitions = definitions;
    gameState.itemSources ??= { claimed: [] };
    gameState.itemSources.claimed ??= [];
  }

  getPickups(regionId) {
    return this.definitions.filter((source) => source.activation.type === "world_pickup"
      && source.regionId === regionId
      && (source.repeatable || !this.isClaimed(source.id)));
  }

  findNearbyPickup(player, regionId) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    let closest = null;
    let closestDistance = Infinity;
    for (const source of this.getPickups(regionId)) {
      const distance = Math.hypot(centerX - source.x, centerY - source.y);
      if (distance <= source.radius && distance < closestDistance) {
        closest = source;
        closestDistance = distance;
      }
    }
    return closest;
  }

  claimForNPC(npcId) {
    const source = this.definitions.find((entry) => entry.activation.type === "npc_interaction" && entry.activation.targetId === npcId);
    return source ? this.claim(source) : null;
  }

  collectPickup(sourceId) {
    const source = this.definitions.find((entry) => entry.id === sourceId && entry.activation.type === "world_pickup");
    if (!source || (this.isClaimed(source.id) && !source.repeatable)) return false;
    return this.claim(source);
  }

  claim(source) {
    if (this.isClaimed(source.id) && !source.repeatable) return false;
    const item = this.inventory.getDefinition(source.itemId);
    if (!item || !this.inventory.addItem(source.itemId, source.quantity ?? 1, {
      sourceId: source.id,
      sourceType: source.kind,
      regionId: source.regionId,
    })) {
      this.eventBus?.emit("item_pickup_failed", { sourceId: source.id, itemId: source.itemId, message: "Inventory full" });
      return false;
    }
    if (!source.repeatable) this.gameState.itemSources.claimed.push(source.id);
    this.eventBus?.emit("item_source_collected", {
      sourceId: source.id,
      itemId: item.id,
      itemName: item.name,
      quantity: source.quantity ?? 1,
      regionId: source.regionId,
    });
    return true;
  }

  isClaimed(sourceId) { return this.gameState.itemSources.claimed.includes(sourceId); }
}
