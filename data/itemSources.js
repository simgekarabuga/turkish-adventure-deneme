import { GAME_CONFIG } from "../js/config.js";

const TILE = GAME_CONFIG.tileSize;

/** Acquisition records are data-driven across activation types for later expansion. */
export const ITEM_SOURCE_DEFINITIONS = Object.freeze([
  { id: "tea-seller-turkish-tea", kind: "npc_reward", regionId: "istanbul", activation: { type: "npc_interaction", targetId: "istanbul-tea-seller" }, itemId: "turkish_tea", quantity: 1, repeatable: false, metadata: {} },
  { id: "cat-lover-cat-food", kind: "npc_reward", regionId: "istanbul", activation: { type: "npc_interaction", targetId: "istanbul-cat-lover" }, itemId: "cat_food", quantity: 1, repeatable: false, metadata: {} },
  { id: "simit-pickup-taksim", kind: "pickup", regionId: "istanbul", activation: { type: "world_pickup" }, itemId: "simit", quantity: 1, x: 10 * TILE, y: 12 * TILE, radius: 23, icon: "ring", metadata: { area: "taksim" } },
  { id: "simit-pickup-eminonu", kind: "pickup", regionId: "istanbul", activation: { type: "world_pickup" }, itemId: "simit", quantity: 1, x: 47 * TILE, y: 27 * TILE, radius: 23, icon: "ring", metadata: { area: "eminonu" } },
  { id: "seagull-stolen-lunch-eminonu", kind: "pickup", regionId: "istanbul", activation: { type: "world_pickup" }, itemId: "simit", quantity: 1, x: 43 * TILE, y: 26 * TILE, radius: 23, icon: "ring", metadata: { area: "eminonu-waterfront", questId: "istanbul-seagull-stolen-lunch" } },
  { id: "tea-pickup-garden", kind: "pickup", regionId: "istanbul", activation: { type: "world_pickup" }, itemId: "turkish_tea", quantity: 1, x: 23 * TILE, y: 30 * TILE, radius: 23, icon: "cup", metadata: { area: "tea-garden" } },
  { id: "cat-food-pickup-kadikoy", kind: "pickup", regionId: "istanbul", activation: { type: "world_pickup" }, itemId: "cat_food", quantity: 1, x: 8 * TILE, y: 36 * TILE, radius: 23, icon: "gem", metadata: { area: "kadikoy" } },
  { id: "nazar-hidden-alley-container", kind: "hidden_container", regionId: "istanbul", activation: { type: "world_pickup" }, itemId: "nazar_charm", quantity: 1, x: 29 * TILE, y: 32 * TILE, radius: 23, icon: "charm", metadata: { area: "hidden-alley", landmarkId: "istanbul-hidden-alley" } },
]);
