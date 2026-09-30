// Temporary NPC records. Add content here without changing the NPC systems.
import { GAME_CONFIG } from "../js/config.js";
const TILE_SIZE = GAME_CONFIG.tileSize;

export const NPC_DEFINITIONS = Object.freeze([
  { id: "istanbul-tea-seller", name: "Tea Seller", regionId: "istanbul", x: 21 * TILE_SIZE, y: 31 * TILE_SIZE, spriteId: "tea-seller", interactionRadius: 52, dialogueId: "istanbul-tea-seller", description: "A tea seller tending a small garden-side stall.", tags: ["istanbul", "tea-garden"] },
  { id: "istanbul-street-musician", name: "Street Musician", regionId: "istanbul", x: 17 * TILE_SIZE, y: 17 * TILE_SIZE, spriteId: "street-musician", interactionRadius: 52, dialogueId: "istanbul-street-musician", description: "A musician playing beside the tram street.", tags: ["istanbul", "istiklal"] },
  { id: "istanbul-ferry-worker", name: "Ferry Worker", regionId: "istanbul", x: 43 * TILE_SIZE, y: 25 * TILE_SIZE, spriteId: "ferry-worker", interactionRadius: 52, dialogueId: "istanbul-ferry-worker", description: "A ferry worker waiting near the waterfront pier.", tags: ["istanbul", "eminonu"] },
  { id: "istanbul-cat-lover", name: "Cat Lover", regionId: "istanbul", x: 11 * TILE_SIZE, y: 33 * TILE_SIZE, spriteId: "cat-lover", interactionRadius: 52, dialogueId: "istanbul-cat-lover", description: "A local watching over the Kadikoy market cats.", tags: ["istanbul", "kadikoy"] },
  { id: "istanbul-mysterious-old-man", name: "Mysterious Old Man", regionId: "istanbul", x: 28 * TILE_SIZE, y: 32 * TILE_SIZE, spriteId: "mysterious-old-man", interactionRadius: 52, dialogueId: "istanbul-mysterious-old-man", description: "A quiet stranger in the hidden alley.", tags: ["istanbul", "hidden-alley"] },
  {
    id: "cappadocia-traveler",
    name: "Traveler",
    regionId: "cappadocia",
    x: 11 * TILE_SIZE,
    y: 20 * TILE_SIZE,
    spriteId: "traveler",
    interactionRadius: 52,
    dialogueId: "traveler-greeting",
    description: "A traveler resting beside the valley road.",
    tags: ["temporary", "traveler"],
  },
  {
    id: "black-sea-fisherman",
    name: "Fisherman",
    regionId: "blackSea",
    x: 10 * TILE_SIZE,
    y: 20 * TILE_SIZE,
    spriteId: "fisherman",
    interactionRadius: 52,
    dialogueId: "fisherman-greeting",
    description: "A fisherman taking a break by the coastal path.",
    tags: ["temporary", "fisherman"],
  },
]);
