import { GAME_CONFIG } from "../js/config.js";

const TILE = GAME_CONFIG.tileSize;

/** A world interactable, not an NPC, discovery, pickup, or quest location. */
export const ISTANBUL_TELEPHONE_BOOTH = Object.freeze({
  id: "istanbul-telephone-booth",
  regionId: "istanbul",
  x: 24 * TILE,
  y: 24 * TILE,
  width: TILE,
  height: TILE,
  interactionRadius: 42,
  promptLabel: "E — Telefonu Kullan",
  visualId: "istanbul-public-phone-booth",
});
