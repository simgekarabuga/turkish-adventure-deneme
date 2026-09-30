/** Translates successful acquisitions into quest-domain events; removals are ignored. */
export class InventoryQuestBridge {
  constructor(inventory, questManager, eventBus = null) {
    this.unsubscribe = inventory.subscribe((event) => {
      if (event.type === "item_added") {
        questManager.processObjectiveEvent({ type: "collect_item", targetId: event.itemId, amount: event.quantity, sourceId: event.sourceId, regionId: event.regionId });
        eventBus?.emit("item_collected", { itemId: event.itemId, targetId: event.itemId, amount: event.quantity, sourceId: event.sourceId, regionId: event.regionId });
      }
      if (event.type === "item_used") eventBus?.emit("item_used", { itemId: event.itemId, targetId: event.itemId, amount: event.quantity });
    });
  }
  destroy() { this.unsubscribe?.(); }
}
