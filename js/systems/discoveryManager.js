import { LOCATION_DEFINITIONS } from "../../data/locations.js";

/** Owns first-time spatial discovery and the session's canonical discovered-id list. */
export class DiscoveryManager {
  constructor(gameState, eventBus, locations = LOCATION_DEFINITIONS) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.locations = locations;
    gameState.discoveries ??= { locations: [], secrets: [], landmarks: [], regions: [] };
    gameState.discoveries.locations ??= gameState.player?.discoveredLocations ?? [];
    gameState.discoveries.secrets ??= [];
    gameState.discoveries.landmarks ??= [];
    gameState.discoveries.regions ??= [];
    if (gameState.player) delete gameState.player.discoveredLocations;
    this.currentRegionId = null;
    this.currentLocationId = null;
    this.insideIds = new Set();
  }

  update(player, regionId) {
    if (regionId !== this.currentRegionId) {
      this.currentRegionId = regionId;
      this.currentLocationId = null;
      this.insideIds.clear();
    }

    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const active = this.locations.filter((location) => location.regionId === regionId);
    const currentlyInside = new Set();
    let closest = null;
    let closestDistance = Infinity;
    for (const location of active) {
      const distance = this.distanceTo(centerX, centerY, location);
      if (distance > location.radius) continue;
      currentlyInside.add(location.id);
      if (distance < closestDistance) { closest = location; closestDistance = distance; }
      if (!this.insideIds.has(location.id)) this.discover(location);
    }
    this.insideIds = currentlyInside;
    this.currentLocationId = closest?.id ?? null;
  }

  distanceTo(x, y, location) { return Math.hypot(x - location.x, y - location.y); }

  discover(location) {
    const ids = this.gameState.discoveries.locations;
    if (ids.includes(location.id)) return false;
    ids.push(location.id);
    this.eventBus?.emit("location_discovered", {
      locationId: location.id,
      targetId: location.id,
      regionId: location.regionId,
      name: location.name,
      message: location.discoveryMessage,
    });
    return true;
  }

  isDiscovered(locationId) { return this.gameState.discoveries.locations.includes(locationId); }
  getDiscovered() { return this.gameState.discoveries.locations.map((id) => this.locations.find((location) => location.id === id)).filter(Boolean); }
  getUndiscovered() { return this.locations.filter((location) => !this.isDiscovered(location.id)); }
  getCurrentLocation() { return this.locations.find((location) => location.id === this.currentLocationId) ?? null; }
  getProgress() { return { discovered: this.getDiscovered().length, total: this.locations.length }; }
}
