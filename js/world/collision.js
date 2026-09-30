import { GAME_CONFIG } from "../config.js";

/** Generic AABB collision against tile walkability, suitable for future entities. */
export function canOccupy(world, x, y, width, height, blockers = []) {
  const size = GAME_CONFIG.tileSize;
  const epsilon = 0.001;
  const left = Math.floor(x / size);
  const right = Math.floor((x + width - epsilon) / size);
  const top = Math.floor(y / size);
  const bottom = Math.floor((y + height - epsilon) / size);
  for (let tileY = top; tileY <= bottom; tileY += 1) {
    for (let tileX = left; tileX <= right; tileX += 1) {
      if (!world.getTile(tileX, tileY)?.walkable) return false;
    }
  }
  const bounds = { x, y, width, height };
  if (blockers.some((blocker) => overlaps(bounds, blocker))) return false;
  return true;
}

/** Resolve axes independently to allow sliding along blocked tile edges. */
export function moveWithCollision(world, entity, deltaX, deltaY, blockers = []) {
  const nextX = entity.x + deltaX;
  if (canOccupy(world, nextX, entity.y, entity.width, entity.height, blockers)) entity.x = nextX;
  const nextY = entity.y + deltaY;
  if (canOccupy(world, entity.x, nextY, entity.width, entity.height, blockers)) entity.y = nextY;
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
