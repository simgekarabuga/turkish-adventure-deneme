const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 48;

/** Original, replaceable telephone-booth art; no sprite pixels define collision. */
export class TelephoneBoothRenderer {
  constructor() {
    this.image = null;
    if (typeof Image === "undefined") return;
    this.image = new Image();
    this.image.src = new URL("../../assets/environment/istanbul-phone-booth.svg", import.meta.url).href;
  }

  draw(context, booth, camera, tileSize) {
    const centerX = booth.x + booth.width / 2;
    const x = Math.round(centerX - SPRITE_WIDTH / 2 - camera.x);
    const y = Math.round(booth.y - SPRITE_HEIGHT + tileSize / 2 - camera.y);
    if (this.image?.complete && this.image.naturalWidth > 0) {
      context.drawImage(this.image, x, y, SPRITE_WIDTH, SPRITE_HEIGHT);
      return;
    }
    drawFallback(context, x, y);
  }
}

function drawFallback(context, x, y) {
  context.fillStyle = "#162630"; context.fillRect(x + 2, y + 2, 28, 45);
  context.fillStyle = "#537d80"; context.fillRect(x + 6, y + 8, 20, 32);
  context.fillStyle = "#92c4c2"; context.fillRect(x + 9, y + 11, 14, 22);
  context.fillStyle = "#d7bd7d"; context.fillRect(x + 8, y + 4, 16, 3);
  context.fillStyle = "#28373b"; context.fillRect(x + 12, y + 17, 8, 12);
  context.fillStyle = "#f0d88c"; context.fillRect(x + 24, y + 20, 2, 7);
  context.fillStyle = "#162630"; context.fillRect(x + 10, y + 40, 12, 7);
}
