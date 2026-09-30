const FRAME_WIDTH = 24;
const FRAME_HEIGHT = 32;
const ROW_BY_DIRECTION = Object.freeze({ down: 0, up: 1, left: 2, right: 3 });

/** Rendering adapter for the replaceable original player sprite sheet. */
export class PlayerSprite {
  constructor() {
    this.image = null;
    if (typeof Image === "undefined") return;
    this.image = new Image();
    this.image.src = new URL("../../assets/player/adventurer-sprites.svg", import.meta.url).href;
  }

  draw(context, player, camera) {
    const state = player.getSpriteState?.() ?? { direction: "down", frame: 0 };
    const column = Math.max(0, Math.min(2, state.frame ?? 0));
    const row = ROW_BY_DIRECTION[state.direction] ?? 0;
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const drawX = Math.round(centerX - FRAME_WIDTH / 2 - camera.x);
    const drawY = Math.round(centerY - FRAME_HEIGHT / 2 - camera.y);

    if (this.image?.complete && this.image.naturalWidth > 0) {
      context.drawImage(
        this.image,
        column * FRAME_WIDTH, row * FRAME_HEIGHT, FRAME_WIDTH, FRAME_HEIGHT,
        drawX, drawY, FRAME_WIDTH, FRAME_HEIGHT,
      );
      return;
    }
    // Keep a character-shaped pixel fallback visible while the SVG asset loads.
    drawFallback(context, drawX, drawY, state.direction, column);
  }
}

function drawFallback(context, x, y, direction, frame) {
  context.fillStyle = "#17251e";
  context.fillRect(x + 6, y + 25, 12, 4);
  context.fillStyle = "#397b78";
  context.fillRect(x + 6, y + 14, 12, 11);
  context.fillStyle = "#d5a77d";
  context.fillRect(x + 8, y + 6, 9, 9);
  context.fillStyle = "#342b2b";
  context.fillRect(x + 7, y + 4, 11, 5);
  if (direction === "up") {
    context.fillStyle = "#d99b4c";
    context.fillRect(x + 7, y + 15, 3, 8);
    context.fillRect(x + 14, y + 15, 3, 8);
  } else if (direction === "left" || direction === "right") {
    context.fillStyle = "#302927";
    context.fillRect(x + (direction === "left" ? 8 : 15), y + 10, 1, 1);
  } else {
    context.fillStyle = "#302927";
    context.fillRect(x + 10, y + 10, 1, 1);
    context.fillRect(x + 15, y + 10, 1, 1);
  }
  context.fillStyle = "#55423a";
  if (frame === 1) {
    context.fillRect(x + 7, y + 25, 5, 5);
    context.fillRect(x + 14, y + 24, 5, 5);
  } else if (frame === 2) {
    context.fillRect(x + 8, y + 24, 5, 5);
    context.fillRect(x + 13, y + 25, 5, 5);
  } else {
    context.fillRect(x + 8, y + 25, 4, 4);
    context.fillRect(x + 14, y + 25, 4, 4);
  }
}
