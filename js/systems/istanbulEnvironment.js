import { ISTANBUL_DECORATION } from "../../data/istanbulDecoration.js";

const TILE = 16;
const TILE_SOURCE = Object.freeze({
  grass: [0, 0], meadow: [16, 0], water: [32, 0], sea: [32, 0],
  street: [48, 0], road: [48, 0], plaza: [64, 0], tramTrack: [80, 0],
  market: [96, 0], garden: [112, 0], alley: [128, 0], pier: [144, 0],
});
const CITY_VARIANTS = Object.freeze([[160, 0], [176, 0], [192, 0], [208, 0]]);
const ASSETS = Object.freeze({
  bench: { source: [0, 32, 32, 16], size: [32, 16] },
  lamp: { source: [32, 32, 16, 32], size: [16, 32] },
  planter: { source: [48, 32, 32, 24], size: [32, 24] },
  tree: { source: [80, 32, 32, 32], size: [32, 32] },
  "sign-bahar": { source: [112, 32, 48, 16], size: [48, 16] },
  "sign-sahaf": { source: [112, 48, 48, 16], size: [48, 16] },
  tower: { source: [160, 32, 48, 64], size: [48, 64] },
  monument: { source: [208, 32, 32, 48], size: [32, 48] },
  tram: { source: [240, 32, 48, 32], size: [48, 32] },
  boat: { source: [288, 32, 48, 32], size: [48, 32] },
  stall: { source: [336, 32, 32, 32], size: [32, 32] },
  lantern: { source: [368, 32, 16, 32], size: [16, 32] },
  crate: { source: [384, 32, 16, 16], size: [16, 16] },
  balcony: { source: [400, 32, 32, 16], size: [32, 16] },
});

/** Istanbul-only art layer. World tile data remains the sole collision authority. */
export class IstanbulEnvironment {
  constructor() {
    this.atlas = null;
    if (typeof Image === "undefined") return;
    this.atlas = new Image();
    this.atlas.src = new URL("../../assets/environment/istanbul-atlas.svg", import.meta.url).href;
  }

  isReady() { return Boolean(this.atlas?.complete && this.atlas.naturalWidth > 0); }

  drawTile(context, tile, screenX, screenY, size, gridX, gridY) {
    if (!this.isReady()) return false;
    const source = tile?.id === "city"
      ? CITY_VARIANTS[Math.abs((gridX * 7 + gridY * 11) % CITY_VARIANTS.length)]
      : TILE_SOURCE[tile?.id];
    if (!source) return false;
    context.drawImage(this.atlas, source[0], source[1], TILE, TILE, screenX, screenY, size, size);
    return true;
  }

  drawDecorations(context, camera, tileSize) {
    if (!this.isReady()) return;
    for (const decoration of ISTANBUL_DECORATION) {
      const asset = ASSETS[decoration.asset];
      if (!asset) continue;
      const [sourceX, sourceY, sourceWidth, sourceHeight] = asset.source;
      const [width, height] = asset.size;
      const worldX = decoration.x * tileSize;
      const worldY = decoration.y * tileSize;
      const x = decoration.anchor === "bottom-center" ? worldX - width / 2 : worldX;
      const y = decoration.anchor === "bottom-center" ? worldY - height : worldY;
      context.drawImage(this.atlas, sourceX, sourceY, sourceWidth, sourceHeight,
        Math.round(x - camera.x), Math.round(y - camera.y), width, height);
    }
  }

  drawLandmark(context, landmark, camera, tileSize) {
    if (!this.isReady()) return false;
    const assetName = ({ tower: "tower", monument: "monument", tram: "tram", pier: "boat" })[landmark.kind];
    const asset = ASSETS[assetName];
    if (!asset) return false;
    const [sourceX, sourceY, sourceWidth, sourceHeight] = asset.source;
    const [width, height] = asset.size;
    const centerX = landmark.x * tileSize + tileSize / 2;
    const centerY = landmark.y * tileSize + tileSize / 2;
    context.drawImage(this.atlas, sourceX, sourceY, sourceWidth, sourceHeight,
      Math.round(centerX - width / 2 - camera.x), Math.round(centerY - height + 5 - camera.y), width, height);
    // Keep the renderer's existing landmark labels visible above the new art.
    const labelWidth = landmark.label.length * 7 + 10;
    const labelX = Math.round(centerX - camera.x - labelWidth / 2);
    const labelY = Math.round(centerY - height - 14 - camera.y);
    context.fillStyle = "#10202ddd";
    context.fillRect(labelX, labelY, labelWidth, 16);
    context.fillStyle = "#f5f0dc";
    context.font = "11px system-ui, sans-serif";
    context.textBaseline = "top";
    context.fillText(landmark.label, labelX + 5, labelY + 2);
    return true;
  }
}
