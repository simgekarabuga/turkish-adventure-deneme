/** Camera x/y is its world-space top-left viewport coordinate. */
export class Camera {
  constructor(viewWidth, viewHeight) {
    this.x = 0;
    this.y = 0;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }
  follow(target, world) {
    this.x = clamp(target.x + target.width / 2 - this.viewWidth / 2, 0, world.pixelWidth - this.viewWidth);
    this.y = clamp(target.y + target.height / 2 - this.viewHeight / 2, 0, world.pixelHeight - this.viewHeight);
  }
}
function clamp(value, min, max) { return Math.max(min, Math.min(value, max)); }
