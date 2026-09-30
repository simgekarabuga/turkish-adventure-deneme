import { GAME_CONFIG } from "../js/config.js";

// Original, procedural placeholder maps. Coordinates and map cells use tiles; entity
// and camera coordinates remain pixels. Rendering never defines or edits this data.
const TILE_SIZE = GAME_CONFIG.tileSize;
const TILES = {
  grass: { id: "grass", color: "#477a48", walkable: true },
  meadow: { id: "meadow", color: "#679251", walkable: true },
  forest: { id: "forest", color: "#24533d", walkable: false },
  water: { id: "water", color: "#347b9b", walkable: false },
  sand: { id: "sand", color: "#c9ad70", walkable: true },
  rock: { id: "rock", color: "#88775e", walkable: false },
  cave: { id: "cave", color: "#51483f", walkable: false },
  mountain: { id: "mountain", color: "#777c72", walkable: false },
  city: { id: "city", color: "#a97758", walkable: false },
  road: { id: "road", color: "#c9a77a", walkable: true },
  bridge: { id: "bridge", color: "#ddc38a", walkable: true },
  olive: { id: "olive", color: "#526c3b", walkable: false },
  sea: { id: "sea", color: "#286c91", walkable: false },
  gate: { id: "gate", color: "#e6c66a", walkable: true },
  plaza: { id: "plaza", color: "#b79b78", walkable: true },
  street: { id: "street", color: "#b69c79", walkable: true },
  tramTrack: { id: "tramTrack", color: "#887b68", walkable: true },
  market: { id: "market", color: "#c99656", walkable: true },
  garden: { id: "garden", color: "#477850", walkable: true },
  alley: { id: "alley", color: "#655b52", walkable: true },
  pier: { id: "pier", color: "#a77a50", walkable: true },
};

const WORLD_WIDTH = 96;
const WORLD_HEIGHT = 72;
const REGION_WIDTH = 56;
const REGION_HEIGHT = 42;
const blank = (width, height, tile) => Array.from({ length: height }, () => Array(width).fill(tile));
const paint = (cells, x1, y1, x2, y2, tile) => {
  for (let y = y1; y <= y2; y += 1) for (let x = x1; x <= x2; x += 1) cells[y][x] = tile;
};
const line = (cells, from, to, tile, radius = 0) => {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
  for (let step = 0; step <= steps; step += 1) {
    const x = Math.round(from.x + (to.x - from.x) * step / Math.max(steps, 1));
    const y = Math.round(from.y + (to.y - from.y) * step / Math.max(steps, 1));
    paint(cells, Math.max(0, x - radius), Math.max(0, y - radius), Math.min(cells[0].length - 1, x + radius), Math.min(cells.length - 1, y + radius), tile);
  }
};
const seeded = (x, y, seed) => ((x * 31 + y * 17 + x * y * 3 + seed * 13) % 29 + 29) % 29;

function makeOverworld() {
  const cells = blank(WORLD_WIDTH, WORLD_HEIGHT, "sea");
  const landShape = [
    [10, 22], [14, 15], [24, 10], [36, 12], [44, 7], [58, 9], [72, 12], [84, 18],
    [91, 27], [87, 37], [80, 44], [72, 49], [64, 57], [52, 62], [40, 61], [31, 57],
    [23, 54], [18, 48], [12, 39], [8, 30],
  ];
  for (let y = 0; y < WORLD_HEIGHT; y += 1) {
    for (let x = 0; x < WORLD_WIDTH; x += 1) {
      if (pointInPolygon(x, y, landShape)) cells[y][x] = seeded(x, y, 1) < 5 ? "meadow" : "grass";
    }
  }

  const istanbul = { x: 24, y: 19 };
  const blackSea = { x: 66, y: 15 };
  const cappadocia = { x: 56, y: 39 };
  const aegean = { x: 25, y: 49 };
  line(cells, istanbul, blackSea, "road", 1);
  line(cells, blackSea, cappadocia, "road", 1);
  line(cells, cappadocia, aegean, "road", 1);
  line(cells, aegean, istanbul, "road", 0);

  // Walkable bridges cross the narrow strait in the northwest.
  paint(cells, 18, 16, 20, 24, "water");
  paint(cells, 17, 19, 21, 20, "bridge");
  paint(cells, 17, 22, 21, 23, "bridge");
  line(cells, { x: 24, y: 19 }, { x: 25, y: 49 }, "road", 0);

  for (let y = 2; y < WORLD_HEIGHT - 2; y += 1) {
    for (let x = 2; x < WORLD_WIDTH - 2; x += 1) {
      if (cells[y][x] === "grass" && seeded(x, y, 4) === 4) cells[y][x] = "forest";
    }
  }
  // Keep the route network clear after adding forest placeholders.
  line(cells, istanbul, blackSea, "road", 1);
  line(cells, blackSea, cappadocia, "road", 1);
  line(cells, cappadocia, aegean, "road", 1);
  line(cells, aegean, istanbul, "road", 0);
  paint(cells, 22, 17, 26, 21, "city");
  paint(cells, 23, 18, 25, 20, "road");
  // The 5x5 city stamp is only an approach landmark, not a building: clear its
  // blocked one-tile perimeter while keeping the central gate/road approach.
  paint(cells, 22, 17, 26, 17, "road");
  paint(cells, 22, 21, 26, 21, "road");
  paint(cells, 22, 18, 22, 20, "road");
  paint(cells, 26, 18, 26, 20, "road");
  paint(cells, 18, 19, 21, 20, "bridge");
  paint(cells, 17, 22, 21, 23, "bridge");

  const exits = [
    exit("gate-istanbul", "to-istanbul", 24, 19),
    exit("gate-black-sea", "to-blackSea", 66, 15),
    exit("gate-cappadocia", "to-cappadocia", 56, 39),
    exit("gate-aegean", "to-aegean", 25, 49),
  ];
  for (const item of exits) cells[item.tileY][item.tileX] = "gate";

  return {
    id: "overworld", name: "Anatolian Overworld", description: "A stylized fantasy land connecting four distant regions.",
    worldPosition: { x: 0, y: 0 }, width: WORLD_WIDTH, height: WORLD_HEIGHT,
    theme: { accent: "#e6c66a", panel: "#19334a" }, tiles: TILES, cells,
    spawnPoints: {
      start: { x: 53 * TILE_SIZE, y: 39 * TILE_SIZE },
      "return-istanbul": { x: 24 * TILE_SIZE, y: 18 * TILE_SIZE },
      "return-blackSea": { x: 66 * TILE_SIZE, y: 14 * TILE_SIZE },
      "return-cappadocia": { x: 56 * TILE_SIZE, y: 38 * TILE_SIZE },
      "return-aegean": { x: 25 * TILE_SIZE, y: 48 * TILE_SIZE },
    }, exits,
    landmarks: [
      { x: 24, y: 16, label: "Istanbul" }, { x: 66, y: 12, label: "Black Sea" },
      { x: 56, y: 36, label: "Cappadocia" }, { x: 25, y: 46, label: "Aegean Coast" },
    ],
  };
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i]; const [xj, yj] = polygon[j];
    const crosses = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (crosses) inside = !inside;
  }
  return inside;
}

function exit(id, connectionId, tileX, tileY) {
  return { id, connectionId, tileX, tileY, x: tileX * TILE_SIZE, y: tileY * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
}

function makeRegion(id, name, description, worldPosition, theme, baseTile, decorate, arrival, landmarks = [], dimensions = {}, areas = []) {
  const width = dimensions.width ?? REGION_WIDTH;
  const height = dimensions.height ?? REGION_HEIGHT;
  const cells = blank(width, height, baseTile);
  decorate(cells);
  const back = exit("return-to-overworld", `to-${id}`, 2, 20);
  cells[arrival.y][arrival.x] = "gate";
  const arrivalPoint = { x: arrival.x * TILE_SIZE, y: arrival.y * TILE_SIZE };
  return {
    id, name, description, worldPosition, width, height,
    theme, tiles: TILES, cells,
    spawnPoints: { arrival: arrivalPoint },
    exits: [back], landmarks, areas,
  };
}

const ISTANBUL_LANDMARKS = [
  { id: "istanbul-taksim-monument", x: 12, y: 10, label: "Taksim Monument", kind: "monument" },
  { id: "istanbul-istiklal-tram", x: 17, y: 18, label: "Istiklal Tram", kind: "tram" },
  { id: "istanbul-galata-tower", x: 36, y: 10, label: "Galata Tower", kind: "tower" },
  { id: "istanbul-eminonu-pier", x: 45, y: 26, label: "Eminonu Ferry Pier", kind: "pier" },
  { id: "istanbul-kadikoy-market", x: 11, y: 34, label: "Kadikoy Market", kind: "market" },
  { id: "istanbul-tea-garden", x: 21, y: 31, label: "Tea Garden", kind: "teaGarden" },
  { id: "istanbul-hidden-alley", x: 28, y: 33, label: "Hidden Alley", kind: "alley" },
];

// Map areas are stable, map-only IDs. They do not imply discoveries or gameplay
// content; those systems continue to use their own location definitions.
const ISTANBUL_MAP_AREAS = [
  { id: "istanbul-northern-courtyard", name: "Northern Courtyard", bounds: { x: 8, y: 0, width: 9, height: 8 } },
  { id: "istanbul-central-side-streets", name: "Central Side Streets", bounds: { x: 20, y: 17, width: 13, height: 9 } },
  { id: "istanbul-southern-neighborhood", name: "Southern Neighborhood", bounds: { x: 2, y: 40, width: 47, height: 11 } },
  { id: "istanbul-eminonu-promenade", name: "Eminonu Promenade", bounds: { x: 48, y: 20, width: 15, height: 15 } },
];

const REGIONS = {
  overworld: makeOverworld(),
  istanbul: makeRegion("istanbul", "Istanbul", "A fantasy city of lively squares, tram streets, ferries, markets, and quiet alleys.", { x: 24, y: 19 }, { accent: "#67c9dc", panel: "#183b50" }, "grass", (cells) => {
    // Shoreline and dense building blocks define distinct, walkable neighborhoods.
    // Istanbul grows east to a new quay and south into a connected neighborhood.
    paint(cells, 50, 0, 67, 51, "water");
    paint(cells, 4, 4, 20, 15, "city");                 // Taksim blocks
    paint(cells, 28, 4, 46, 16, "city");                // Galata blocks
    paint(cells, 4, 28, 18, 39, "city");                // Kadikoy blocks
    paint(cells, 34, 22, 49, 31, "city");               // Eminonu blocks
    paint(cells, 24, 28, 31, 37, "city");               // alley walls
    // Additional block fronts keep the expanded footprint legible as city streets.
    paint(cells, 3, 42, 12, 48, "city");
    paint(cells, 20, 42, 30, 48, "city");
    paint(cells, 35, 42, 47, 48, "city");
    paint(cells, 4, 0, 20, 4, "city");
    // Recognizable open spaces are walkable tile fields over the building blocks.
    paint(cells, 8, 7, 16, 13, "plaza");
    paint(cells, 8, 0, 16, 5, "plaza"); // Small upper courtyard joined to Taksim
    paint(cells, 15, 15, 19, 19, "tramTrack");
    paint(cells, 34, 8, 38, 13, "plaza");
    paint(cells, 38, 24, 49, 28, "pier");
    paint(cells, 7, 31, 15, 37, "market");
    paint(cells, 19, 29, 23, 34, "garden");
    paint(cells, 26, 29, 30, 36, "alley");
    // The new eastward quay has a walkable promenade and a pier head surrounded
    // by water. The old city's locations and their coordinates remain untouched.
    paint(cells, 49, 22, 62, 31, "pier");
    paint(cells, 50, 21, 54, 34, "street");
    paint(cells, 55, 25, 60, 29, "plaza");
    // Public paths are carved last so the logical walkable network agrees with the
    // rendered streets. Three-tile connectors leave enough room for the player's
    // 12px body to turn without scraping adjacent building collision cells.
    line(cells, { x: 2, y: 20 }, { x: 48, y: 20 }, "street", 1);
    line(cells, { x: 12, y: 5 }, { x: 12, y: 7 }, "street", 0);
    line(cells, { x: 14, y: 14 }, { x: 14, y: 20 }, "street", 1); // Taksim south entrance
    paint(cells, 13, 13, 15, 13, "street"); // Broad doorway; leave the square paving open.
    line(cells, { x: 17, y: 13 }, { x: 17, y: 31 }, "tramTrack", 0);
    line(cells, { x: 17, y: 20 }, { x: 36, y: 13 }, "street", 1); // Istiklal to Galata
    line(cells, { x: 24, y: 20 }, { x: 24, y: 25 }, "street", 0); // Quiet telephone-booth side street
    line(cells, { x: 36, y: 13 }, { x: 36, y: 20 }, "street", 1); // Galata south entrance
    line(cells, { x: 41, y: 20 }, { x: 41, y: 27 }, "street", 1); // Eminonu waterfront entrance
    line(cells, { x: 41, y: 27 }, { x: 49, y: 27 }, "pier", 1);
    line(cells, { x: 17, y: 20 }, { x: 17, y: 34 }, "street", 1); // Kadikoy market approach
    line(cells, { x: 7, y: 34 }, { x: 29, y: 34 }, "street", 0);
    line(cells, { x: 22, y: 31 }, { x: 22, y: 34 }, "street", 1); // Tea garden connection
    line(cells, { x: 28, y: 30 }, { x: 28, y: 34 }, "alley", 1); // Hidden Alley entrance
    // A public southern street grid branches from Kadikoy's existing approach.
    // Buildings remain solid; the broad cross streets and north/south lanes join
    // them into connected blocks rather than isolated walkable pockets.
    line(cells, { x: 17, y: 34 }, { x: 17, y: 49 }, "street", 1);
    line(cells, { x: 2, y: 44 }, { x: 49, y: 44 }, "street", 1);
    line(cells, { x: 2, y: 49 }, { x: 49, y: 49 }, "street", 1);
    line(cells, { x: 34, y: 44 }, { x: 34, y: 49 }, "street", 1);
    line(cells, { x: 47, y: 34 }, { x: 47, y: 49 }, "street", 1);
    // Connect the existing Eminonu route to the expanded promenade; its open
    // paths end at the waterline instead of turning the whole coast walkable.
    line(cells, { x: 48, y: 20 }, { x: 50, y: 26 }, "street", 1);
    line(cells, { x: 49, y: 27 }, { x: 61, y: 27 }, "pier", 1);
    // Keep the outer city edge and remaining coast blocked.
    paint(cells, 0, 51, 49, 51, "city");
  }, { x: 5, y: 20 }, ISTANBUL_LANDMARKS, { width: 68, height: 52 }, ISTANBUL_MAP_AREAS),
  cappadocia: makeRegion("cappadocia", "Cappadocia", "Warm valleys, sculpted stone, and quiet cave openings.", { x: 56, y: 39 }, { accent: "#efc06d", panel: "#55402d" }, "sand", (cells) => {
    line(cells, { x: 4, y: 20 }, { x: 51, y: 20 }, "road", 1);
    for (const [x, y] of [[12, 9], [18, 27], [28, 11], [35, 29], [44, 8], [46, 24]]) {
      paint(cells, x, y, x + 2, y + 2, "rock"); cells[y + 1][x + 1] = "cave";
    }
  }, { x: 5, y: 20 }),
  blackSea: makeRegion("blackSea", "Black Sea", "Rain-dark forest, mountain paths, and cool coastal water.", { x: 66, y: 15 }, { accent: "#93c985", panel: "#1f443a" }, "grass", (cells) => {
    paint(cells, 0, 0, 55, 4, "water"); paint(cells, 42, 0, 55, 16, "water");
    line(cells, { x: 4, y: 20 }, { x: 51, y: 20 }, "road", 1);
    paint(cells, 4, 7, 10, 12, "mountain"); paint(cells, 34, 27, 43, 35, "mountain");
    for (let y = 7; y < 38; y += 4) for (let x = 12 + (y % 3); x < 52; x += 6) {
      if (cells[y][x] === "grass") paint(cells, x, y, x + 1, y + 1, "forest");
    }
  }, { x: 5, y: 20 }),
  aegean: makeRegion("aegean", "Aegean Coast", "Sunlit coves, pale paths, and windswept olive groves.", { x: 25, y: 49 }, { accent: "#f3d27b", panel: "#40523a" }, "meadow", (cells) => {
    paint(cells, 39, 29, 55, 41, "sea"); paint(cells, 49, 20, 55, 28, "sea");
    line(cells, { x: 4, y: 20 }, { x: 45, y: 20 }, "road", 1);
    line(cells, { x: 42, y: 20 }, { x: 42, y: 34 }, "road", 0);
    for (let y = 8; y < 36; y += 5) for (let x = 8 + (y % 4); x < 38; x += 7) {
      if (cells[y][x] === "meadow") paint(cells, x, y, x + 1, y + 1, "olive");
    }
  }, { x: 5, y: 20 }),
};

export const REGIONS_BY_ID = Object.freeze(REGIONS);
export const REGION_LIST = Object.freeze(Object.values(REGIONS));

// Bidirectional links live in data; transitions only resolve the matching endpoint.
export const REGION_CONNECTIONS = Object.freeze(Object.fromEntries(
  ["istanbul", "cappadocia", "blackSea", "aegean"].map((id) => [
    `to-${id}`,
    Object.freeze([
      { regionId: "overworld", exitId: `gate-${id.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, spawnId: `return-${id}` },
      { regionId: id, exitId: "return-to-overworld", spawnId: "arrival" },
    ]),
  ]),
));

export const WORLD_START = Object.freeze({ regionId: "overworld", spawnId: "start" });
