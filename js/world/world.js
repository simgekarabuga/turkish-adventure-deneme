import { GAME_CONFIG } from "../config.js";
import { REGIONS_BY_ID } from "../../data/worldData.js";

/** Region facade keeps raw data separate from systems that query or draw a map. */
export function createWorld(regionId = "overworld") {
  const region = typeof regionId === "string" ? REGIONS_BY_ID[regionId] : regionId;
  if (!region) throw new Error(`Unknown world region: ${regionId}`);
  return {
    ...region,
    pixelWidth: region.width * GAME_CONFIG.tileSize,
    pixelHeight: region.height * GAME_CONFIG.tileSize,
    getTile(x, y) {
      if (x < 0 || y < 0 || x >= region.width || y >= region.height) return null;
      return region.tiles[region.cells[y][x]];
    },
  };
}
