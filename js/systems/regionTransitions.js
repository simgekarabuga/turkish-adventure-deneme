import { REGIONS_BY_ID, REGION_CONNECTIONS } from "../../data/worldData.js";

/** Return a destination when the player overlaps a data-defined region exit. */
export function findRegionTransition(regionId, player) {
  const region = REGIONS_BY_ID[regionId];
  const exit = region.exits.find((candidate) => intersects(player, candidate));
  if (!exit) return null;

  const endpoints = REGION_CONNECTIONS[exit.connectionId];
  if (!endpoints) return null;
  const source = endpoints.find((endpoint) => endpoint.regionId === regionId && endpoint.exitId === exit.id);
  const destination = endpoints.find((endpoint) => endpoint !== source);
  if (!source || !destination) return null;
  return {
    regionId: destination.regionId,
    spawn: REGIONS_BY_ID[destination.regionId].spawnPoints[destination.spawnId],
  };
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
