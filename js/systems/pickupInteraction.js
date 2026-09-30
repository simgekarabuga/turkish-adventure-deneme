/** Keyboard interaction for nearby world pickups; rendering is handled separately. */
export class PickupInteraction {
  constructor(sourceManager, input) {
    this.sourceManager = sourceManager;
    this.input = input;
    this.nearbyPickup = null;
  }

  update(player, regionId) {
    this.nearbyPickup = this.sourceManager.findNearbyPickup(player, regionId);
    if (this.nearbyPickup && this.input.consumePress("e")) {
      const collected = this.sourceManager.collectPickup(this.nearbyPickup.id);
      if (collected) this.nearbyPickup = null;
    }
    return this.nearbyPickup;
  }

  getNearbyPickup() { return this.nearbyPickup; }
}
