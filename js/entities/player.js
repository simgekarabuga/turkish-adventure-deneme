import { GAME_CONFIG } from "../config.js";
import { moveWithCollision } from "../world/collision.js";

export class Player {
  constructor(x = 4 * GAME_CONFIG.tileSize, y = 4 * GAME_CONFIG.tileSize) {
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 12;
    this.speed = GAME_CONFIG.playerSpeed;
    // Facing and animation are presentation state; collision dimensions stay fixed.
    this.facing = "down";
    this.isMoving = false;
    this.animationTime = 0;
    this.animationFrame = 0;
  }

  update(deltaTime, input, world, blockers = []) {
    let x = Number(input.isDown("ArrowRight", "d")) - Number(input.isDown("ArrowLeft", "a"));
    let y = Number(input.isDown("ArrowDown", "s")) - Number(input.isDown("ArrowUp", "w"));
    if (x !== 0 && y !== 0) {
      const normalized = 1 / Math.sqrt(2);
      x *= normalized;
      y *= normalized;
    }
    const previousX = this.x;
    const previousY = this.y;
    moveWithCollision(world, this, x * this.speed * deltaTime, y * this.speed * deltaTime, blockers);
    const movedX = this.x - previousX;
    const movedY = this.y - previousY;
    this.isMoving = Math.hypot(movedX, movedY) > 0.001;

    if (this.isMoving) {
      // On a diagonal tie, preserve the last facing direction for readable art.
      if (Math.abs(movedX) > Math.abs(movedY)) this.facing = movedX < 0 ? "left" : "right";
      else if (Math.abs(movedY) > Math.abs(movedX)) this.facing = movedY < 0 ? "up" : "down";
      this.animationTime += deltaTime;
      this.animationFrame = 1 + Math.floor(this.animationTime / 0.16) % 2;
    } else {
      this.animationTime = 0;
      this.animationFrame = 0;
    }
  }

  getSpriteState() {
    return { direction: this.facing, frame: this.animationFrame, moving: this.isMoving };
  }
}
