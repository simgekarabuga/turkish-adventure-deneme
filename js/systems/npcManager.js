import { NPC_DEFINITIONS } from "../../data/npcs.js";
import { NPC } from "../entities/npc.js";

/** Owns only live entities for the active region; definitions remain in data. */
export class NPCManager {
  constructor(definitions = NPC_DEFINITIONS) {
    this.definitions = definitions;
    this.regionId = null;
    this.npcs = [];
  }

  setRegion(regionId) {
    if (this.regionId === regionId) return;
    this.regionId = regionId;
    this.npcs = this.definitions
      .filter((definition) => definition.regionId === regionId)
      .map((definition) => new NPC(definition));
  }

  update(_deltaTime) {
    // NPCs are deliberately stationary in this foundation step.
  }

  getAll() { return this.npcs; }
  getCollisionBounds() { return this.npcs.filter((npc) => npc.blocksMovement).map((npc) => npc.getCollisionBounds()); }
}
