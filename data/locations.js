import { GAME_CONFIG } from "../js/config.js";

const TILE = GAME_CONFIG.tileSize;

/** Coordinates are region-local world pixels, not tiles; the non-Istanbul entries remain technical tests. */
export const LOCATION_DEFINITIONS = Object.freeze([
  { id: "istanbul_taksim", regionId: "istanbul", name: "Taksim Square", description: "A broad stone plaza surrounding the city's old monument.", x: 12 * TILE, y: 10 * TILE, radius: 30, hidden: false, discoveryMessage: "Location discovered: Taksim Square", metadata: { landmarkId: "istanbul-taksim-monument" } },
  { id: "istanbul_istiklal", regionId: "istanbul", name: "Istiklal Street", description: "A lively pedestrian street with a small tram line.", x: 17 * TILE, y: 18 * TILE, radius: 28, hidden: false, discoveryMessage: "Location discovered: Istiklal Street", metadata: { landmarkId: "istanbul-istiklal-tram" } },
  { id: "istanbul_galata", regionId: "istanbul", name: "Galata", description: "A compact hillside quarter watched over by its old stone tower.", x: 36 * TILE, y: 10 * TILE, radius: 30, hidden: false, discoveryMessage: "Location discovered: Galata", metadata: { landmarkId: "istanbul-galata-tower" } },
  { id: "istanbul_eminonu", regionId: "istanbul", name: "Eminonu Waterfront", description: "A busy landing where ferries meet the old city shore.", x: 43 * TILE, y: 26 * TILE, radius: 30, hidden: false, discoveryMessage: "Location discovered: Eminonu Waterfront", metadata: { landmarkId: "istanbul-eminonu-pier" } },
  { id: "istanbul_kadikoy", regionId: "istanbul", name: "Kadikoy Market", description: "A warm market square full of stalls and neighborhood paths.", x: 11 * TILE, y: 34 * TILE, radius: 30, hidden: false, discoveryMessage: "Location discovered: Kadikoy Market", metadata: { landmarkId: "istanbul-kadikoy-market" } },
  { id: "istanbul_hidden_alley", regionId: "istanbul", name: "Hidden Alley", description: "A quiet side passage tucked behind the main street.", x: 28 * TILE, y: 33 * TILE, radius: 25, hidden: true, discoveryMessage: "Location discovered: Hidden Alley", metadata: { landmarkId: "istanbul-hidden-alley", secret: true } },
  { id: "cappadocia_test_valley", regionId: "cappadocia", name: "Test Valley", description: "A quiet stretch of the valley path.", x: 20 * TILE, y: 20 * TILE, radius: 26, hidden: false, discoveryMessage: "Location discovered: Test Valley", metadata: {} },
  { id: "cappadocia_test_lookout", regionId: "cappadocia", name: "Test Lookout", description: "A viewpoint along the main valley road.", x: 40 * TILE, y: 20 * TILE, radius: 26, hidden: false, discoveryMessage: "Location discovered: Test Lookout", metadata: {} },
  { id: "blacksea_test_harbor", regionId: "blackSea", name: "Test Harbor", description: "A small harbor path beside the northern water.", x: 42 * TILE, y: 20 * TILE, radius: 26, hidden: false, discoveryMessage: "Location discovered: Test Harbor", metadata: {} },
  { id: "aegean_test_beach", regionId: "aegean", name: "Test Beach", description: "A sandy path overlooking the coast.", x: 42 * TILE, y: 27 * TILE, radius: 26, hidden: false, discoveryMessage: "Location discovered: Test Beach", metadata: {} },
]);

export const LOCATIONS_BY_ID = new Map(LOCATION_DEFINITIONS.map((location) => [location.id, location]));
