import { QUEST_LOCATIONS } from "../../data/quests.js";

/** Emits once when the player enters a location radius; emits again after leaving/re-entering. */
export class LocationSystem {
  constructor(locations = QUEST_LOCATIONS) {
    this.locations = locations;
    this.inside = new Set();
  }

  update(player, regionId, onEnter) {
    const activeIds = new Set();
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    for (const location of this.locations) {
      if (location.regionId !== regionId) continue;
      activeIds.add(location.id);
      const distance = Math.hypot(centerX - location.x, centerY - location.y);
      if (distance <= location.radius && !this.inside.has(location.id)) onEnter(location);
      if (distance <= location.radius) this.inside.add(location.id);
      else this.inside.delete(location.id);
    }
    for (const id of this.inside) if (!activeIds.has(id)) this.inside.delete(id);
  }
}
