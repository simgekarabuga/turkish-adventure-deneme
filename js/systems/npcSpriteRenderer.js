const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 40;
const CAT_SOURCE = Object.freeze([0, 160, 16, 16]);
const ROW_BY_DIRECTION = Object.freeze({ down: 0, up: 1, left: 2, right: 3 });

// Sprite columns are presentation mappings for existing authored Istanbul IDs.
const COLUMN_BY_NPC_ID = Object.freeze({
  "istanbul-tea-seller": 0,
  "istanbul-street-musician": 1,
  "istanbul-ferry-worker": 2,
  "istanbul-cat-lover": 3,
  "istanbul-mysterious-old-man": 4,
});

/** Draws replaceable idle art only; NPC position and collision stay in the entity/world systems. */
export class NPCSpriteRenderer {
  constructor() {
    this.image = null;
    if (typeof Image === "undefined") return;
    this.image = new Image();
    this.image.src = new URL("../../assets/characters/npcs/istanbul-npcs.svg", import.meta.url).href;
  }

  draw(context, npc, camera) {
    const column = COLUMN_BY_NPC_ID[npc.id];
    if (column === undefined || !this.image?.complete || this.image.naturalWidth === 0) return false;

    const direction = npc.facing ?? "down";
    const row = ROW_BY_DIRECTION[direction] ?? ROW_BY_DIRECTION.down;
    const sourceX = column * FRAME_WIDTH;
    const sourceY = row * FRAME_HEIGHT;
    const centerX = npc.x + npc.width / 2;
    const centerY = npc.y + npc.height / 2;
    const drawX = Math.round(centerX - FRAME_WIDTH / 2 - camera.x);
    const drawY = Math.round(centerY - FRAME_HEIGHT / 2 - camera.y);
    context.drawImage(this.image, sourceX, sourceY, FRAME_WIDTH, FRAME_HEIGHT,
      drawX, drawY, FRAME_WIDTH, FRAME_HEIGHT);
    return true;
  }

  /** Cat Lover's companion is art-only and intentionally has no entity or collision shape. */
  drawCompanion(context, npc, camera) {
    if (npc.id !== "istanbul-cat-lover" || !this.image?.complete || this.image.naturalWidth === 0) return false;
    const centerX = npc.x + npc.width / 2;
    const centerY = npc.y + npc.height / 2;
    const characterX = Math.round(centerX - FRAME_WIDTH / 2 - camera.x);
    const characterY = Math.round(centerY - FRAME_HEIGHT / 2 - camera.y);
    const [sourceX, sourceY, sourceWidth, sourceHeight] = CAT_SOURCE;
    context.drawImage(this.image, sourceX, sourceY, sourceWidth, sourceHeight,
      characterX + FRAME_WIDTH, characterY + FRAME_HEIGHT - sourceHeight,
      sourceWidth, sourceHeight);
    return true;
  }
}
