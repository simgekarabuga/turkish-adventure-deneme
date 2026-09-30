import { REGIONS_BY_ID, WORLD_START } from "../../data/worldData.js";

/** Runtime state is the future save boundary; persistence is intentionally not added. */
export function createGameState(start = WORLD_START) {
  const region = REGIONS_BY_ID[start.regionId];
  if (!region) throw new Error(`Unknown starting region: ${start.regionId}`);
  const spawn = region.spawnPoints[start.spawnId];
  if (!spawn) throw new Error(`Unknown spawn point: ${start.regionId}/${start.spawnId}`);
  return {
    currentRegionId: start.regionId,
    player: {
      x: spawn.x,
      y: spawn.y,
      inventory: [],
      completedQuests: [],
    },
    progression: { level: 1, xp: 0, coins: 0, achievements: {} },
    discoveries: { locations: [], secrets: [], landmarks: [], regions: [] },
    itemSources: { claimed: [] },
    easterEggs: { istanbulTelephoneBooth: false },
    quests: {},
    revealedQuests: [],
  };
}
