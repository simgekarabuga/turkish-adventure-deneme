/** Adapts first-time discovery domain events to the existing quest objective API. */
export class DiscoveryQuestBridge {
  constructor(eventBus, questManager) {
    this.unsubscribe = eventBus.on("location_discovered", (event) => {
      questManager.processObjectiveEvent({
        type: "discover_location",
        targetId: event.locationId,
        regionId: event.regionId,
      });
    });
  }
  destroy() { this.unsubscribe?.(); }
}
