/** Visual-only Istanbul dressing; tile walkability and all gameplay coordinates live in worldData.js. */
export const ISTANBUL_DECORATION = Object.freeze([
  // Taksim Square: keep the middle open around the existing monument and pickup.
  { id: "taksim-bench-west", asset: "bench", x: 7, y: 7 },
  { id: "taksim-bench-east", asset: "bench", x: 14, y: 12 },
  { id: "taksim-lamp-west", asset: "lamp", x: 7.5, y: 12, anchor: "bottom-center" },
  { id: "taksim-lamp-east", asset: "lamp", x: 17.5, y: 12, anchor: "bottom-center" },
  { id: "taksim-planter-northwest", asset: "planter", x: 5, y: 5 },
  { id: "taksim-planter-northeast", asset: "planter", x: 16, y: 5 },
  { id: "taksim-planter-southwest", asset: "planter", x: 5, y: 13 },
  // Istiklal: fictional shop names, readable facades, tram, and regular lamps.
  { id: "istiklal-bahar-sign", asset: "sign-bahar", x: 3, y: 4 },
  { id: "istiklal-sahaf-sign", asset: "sign-sahaf", x: 27, y: 4 },
  { id: "istiklal-balcony", asset: "balcony", x: 39, y: 5 },
  { id: "istiklal-lamp-a", asset: "lamp", x: 13.5, y: 21, anchor: "bottom-center" },
  { id: "istiklal-lamp-b", asset: "lamp", x: 25.5, y: 21, anchor: "bottom-center" },
  { id: "istiklal-lamp-c", asset: "lamp", x: 39.5, y: 21, anchor: "bottom-center" },
  // Galata and the other waterfront/neighborhoods share the same asset language.
  { id: "galata-planter", asset: "planter", x: 30, y: 15 },
  { id: "eminonu-boat", asset: "boat", x: 49, y: 23 },
  { id: "kadikoy-stall", asset: "stall", x: 13, y: 32 },
  { id: "kadikoy-planter", asset: "planter", x: 5, y: 36 },
  { id: "hidden-alley-lantern", asset: "lantern", x: 25, y: 31 },
  { id: "hidden-alley-crate", asset: "crate", x: 30, y: 35 },
]);
