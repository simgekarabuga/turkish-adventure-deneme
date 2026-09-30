import { GAME_CONFIG } from "../config.js";
import { drawDialogueUI } from "./dialogueUI.js";
import { drawQuestJournal } from "./questUI.js";
import { drawInventoryUI } from "./inventoryUI.js";
import { drawProgressionUI } from "./progressionUI.js";
import { ITEMS_BY_ID } from "../../data/items.js";
import { PlayerSprite } from "./playerSprite.js";
import { IstanbulEnvironment } from "./istanbulEnvironment.js";
import { NPCSpriteRenderer } from "./npcSpriteRenderer.js";
import { TelephoneBoothRenderer } from "./telephoneBoothRenderer.js";
import { drawTelephoneBoothUI } from "./telephoneBoothUI.js";
import { ISTANBUL_TELEPHONE_BOOTH } from "../../data/telephoneBooth.js";

export function createRenderer(context, width, height) {
  context.imageSmoothingEnabled = false;
  const playerSprite = new PlayerSprite();
  const istanbulEnvironment = new IstanbulEnvironment();
  const npcSprites = new NPCSpriteRenderer();
  const telephoneBoothRenderer = new TelephoneBoothRenderer();

  function render(world, player, camera, npcs, nearbyTarget, dialogue, questIndicators, questAction, quests, debug, metrics, inventoryUI, progressionUI, pickups = [], nearbyPickup = null, telephoneUI = null) {
    const tileSize = GAME_CONFIG.tileSize;
    context.fillStyle = world.theme.panel;
    context.fillRect(0, 0, width, height);
    const startX = Math.max(0, Math.floor(camera.x / tileSize));
    const startY = Math.max(0, Math.floor(camera.y / tileSize));
    const endX = Math.min(world.width, Math.ceil((camera.x + width) / tileSize));
    const endY = Math.min(world.height, Math.ceil((camera.y + height) / tileSize));

    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        const tile = world.getTile(x, y);
        const screenX = Math.floor(x * tileSize - camera.x);
        const screenY = Math.floor(y * tileSize - camera.y);
        const customTile = world.id === "istanbul"
          && istanbulEnvironment.drawTile(context, tile, screenX, screenY, tileSize, x, y);
        if (!customTile) drawTile(context, tile, screenX, screenY, tileSize, x, y);
      }
    }

    if (world.id === "istanbul") istanbulEnvironment.drawDecorations(context, camera, tileSize);
    if (debug && (world.id === "istanbul" || world.id === "overworld")) {
      drawMapCollisionOverlay(context, world, camera, tileSize, width, height);
    }
    for (const exit of world.exits) drawGate(context, exit, camera, tileSize, world.theme.accent);
    for (const landmark of world.landmarks) {
      const customLandmark = world.id === "istanbul"
        && istanbulEnvironment.drawLandmark(context, landmark, camera, tileSize);
      if (!customLandmark) drawLandmark(context, landmark, camera, tileSize);
    }
    if (world.id === ISTANBUL_TELEPHONE_BOOTH.regionId) {
      telephoneBoothRenderer.draw(context, ISTANBUL_TELEPHONE_BOOTH, camera, tileSize);
    }
    for (const pickup of pickups) drawPickup(context, pickup, camera);
    for (const npc of npcs) drawNPC(context, npc, camera, questIndicators.get(npc.id), npcSprites);
    if (nearbyPickup) drawPickupPrompt(context, nearbyPickup, camera);
    else if (nearbyTarget && !dialogue) drawInteractionPrompt(context, nearbyTarget, camera, questAction);

    playerSprite.draw(context, player, camera);
    if (debug) {
      context.strokeStyle = "#f4f1c9";
      context.lineWidth = 1;
      context.strokeRect(Math.round(player.x - camera.x) + 0.5, Math.round(player.y - camera.y) + 0.5, player.width, player.height);
    }
    drawRegionHeader(context, world, width);
    if (debug) drawDebug(context, world, player, camera, metrics);
    drawQuestJournal(context, quests, width);
    drawDialogueUI(context, dialogue, width, height);
    drawProgressionUI(context, progressionUI, width, height);
    drawInventoryUI(context, inventoryUI, width, height);
    drawTelephoneBoothUI(context, telephoneUI, width, height);
  }
  return { render };
}

function drawPickup(context, pickup, camera) {
  const x = Math.round(pickup.x - camera.x - 7); const y = Math.round(pickup.y - camera.y - 7);
  context.fillStyle = "#14221ddd"; context.fillRect(x - 2, y - 2, 18, 18);
  if (pickup.icon === "ring") {
    context.fillStyle = "#c9984b"; context.fillRect(x + 3, y + 2, 6, 2); context.fillRect(x + 1, y + 4, 2, 6); context.fillRect(x + 9, y + 4, 2, 6); context.fillRect(x + 3, y + 10, 6, 2);
    context.fillStyle = "#e3c878"; context.fillRect(x + 4, y + 4, 4, 6);
  } else if (pickup.icon === "cup") {
    context.fillStyle = "#f1e2bd"; context.fillRect(x + 3, y + 3, 7, 8); context.fillRect(x + 10, y + 5, 3, 2);
    context.fillStyle = "#9b493b"; context.fillRect(x + 4, y + 4, 5, 3);
  } else if (pickup.icon === "charm") {
    context.fillStyle = "#4484c4"; context.fillRect(x + 2, y + 2, 10, 10);
    context.fillStyle = "#e7e1c8"; context.fillRect(x + 4, y + 5, 6, 4);
    context.fillStyle = "#253c6a"; context.fillRect(x + 6, y + 5, 2, 4);
  } else {
    context.fillStyle = "#b57c49"; context.fillRect(x + 3, y + 3, 9, 9);
    context.fillStyle = "#e6c87d"; context.fillRect(x + 4, y + 2, 7, 2); context.fillRect(x + 4, y + 11, 7, 2);
  }
}

/** F3-only collision overlay for Istanbul and its overworld entrance. */
function drawMapCollisionOverlay(context, world, camera, tileSize, width, height) {
  const startX = Math.max(0, Math.floor(camera.x / tileSize));
  const startY = Math.max(0, Math.floor(camera.y / tileSize));
  const endX = Math.min(world.width, Math.ceil((camera.x + width) / tileSize));
  const endY = Math.min(world.height, Math.ceil((camera.y + height) / tileSize));
  for (let tileY = startY; tileY < endY; tileY += 1) {
    for (let tileX = startX; tileX < endX; tileX += 1) {
      const walkable = world.getTile(tileX, tileY)?.walkable === true;
      const screenX = Math.floor(tileX * tileSize - camera.x);
      const screenY = Math.floor(tileY * tileSize - camera.y);
      context.fillStyle = walkable ? "rgba(58, 205, 125, 0.15)" : "rgba(233, 77, 69, 0.22)";
      context.fillRect(screenX, screenY, tileSize, tileSize);
      context.strokeStyle = walkable ? "rgba(135, 255, 177, 0.7)" : "rgba(255, 145, 135, 0.8)";
      context.lineWidth = 1;
      context.strokeRect(screenX + 0.5, screenY + 0.5, tileSize - 1, tileSize - 1);
    }
  }
}

function drawPickupPrompt(context, pickup, camera) {
  const item = ITEMS_BY_ID.get(pickup.itemId);
  const text = `E — Pick up ${item?.name ?? "item"}`;
  context.font = "bold 10px system-ui, sans-serif";
  const width = context.measureText(text).width + 14;
  const x = Math.round(pickup.x - camera.x - width / 2);
  const y = Math.round(pickup.y - camera.y - 25);
  context.fillStyle = "#10202df2"; context.fillRect(x, y, width, 16);
  context.fillStyle = "#fff3c4"; context.textBaseline = "top"; context.fillText(text, x + 7, y + 3);
}

function drawNPC(context, npc, camera, questIndicator, npcSprites) {
  const x = Math.round(npc.x - camera.x);
  const y = Math.round(npc.y - camera.y);
  const hasSprite = npcSprites.draw(context, npc, camera);
  if (!hasSprite) drawNPCPlaceholder(context, x, y, npc);
  else npcSprites.drawCompanion(context, npc, camera);
  // Keep quest status separate from the character art so either can be replaced independently.
  if (questIndicator) drawQuestIndicator(context, x + 24, y - 4, questIndicator);
}

function drawNPCPlaceholder(context, x, y, npc) {
  const palette = {
    elder: { clothes: "#537d72", skin: "#d8b58b", hair: "#d4cfb6", accent: "#e7cf85" },
    traveler: { clothes: "#a45d42", skin: "#d6a77b", hair: "#493529", accent: "#e8bd72" },
    fisherman: { clothes: "#4d7191", skin: "#d4aa7e", hair: "#4b3930", accent: "#a6d5dc" },
    "tea-seller": { clothes: "#9c6845", skin: "#d9b28c", hair: "#4d352b", accent: "#e4cc88" },
    "street-musician": { clothes: "#76528c", skin: "#d3a47c", hair: "#352d35", accent: "#d5b96f" },
    "ferry-worker": { clothes: "#426c80", skin: "#d4aa7e", hair: "#44362d", accent: "#c3d2cf" },
    "cat-lover": { clothes: "#657d4e", skin: "#dfb990", hair: "#4e382b", accent: "#e3c875" },
    "mysterious-old-man": { clothes: "#594d69", skin: "#cda57e", hair: "#c4bda9", accent: "#b4a1cc" },
  }[npc.spriteId] ?? { clothes: "#687b91", skin: "#d6b18a", hair: "#493b34", accent: "#e7cf85" };

  // Small square primitives are temporary original characters, not sprite assets.
  context.fillStyle = "#15221c";
  context.fillRect(x + 1, y + 13, 10, 3);
  context.fillStyle = palette.clothes;
  context.fillRect(x + 2, y + 7, 8, 8);
  context.fillRect(x + 1, y + 9, 2, 5);
  context.fillRect(x + 9, y + 9, 2, 5);
  context.fillStyle = palette.skin;
  context.fillRect(x + 3, y + 2, 6, 6);
  context.fillStyle = palette.hair;
  context.fillRect(x + 2, y + 1, 8, 3);
  context.fillRect(x + 2, y + 3, 2, 3);
  context.fillStyle = "#29291f";
  context.fillRect(x + 7, y + 5, 1, 1);
  context.fillStyle = palette.accent;
  context.fillRect(x + 5, y + 10, 2, 3);
}

function drawQuestIndicator(context, x, y, status) {
  const colors = { available: "#edbf4f", ready: "#83d39b", active: "#82bedc" };
  const symbols = { available: "!", ready: "?", active: "•" };
  context.fillStyle = "#15221c";
  context.fillRect(x - 1, y - 1, 15, 15);
  context.fillStyle = colors[status] ?? "#edbf4f";
  context.fillRect(x, y, 13, 13);
  context.fillStyle = "#18211d";
  context.font = "bold 11px system-ui, sans-serif";
  context.textBaseline = "top";
  context.fillText(symbols[status] ?? "!", x + 4, y + 1);
}

function drawInteractionPrompt(context, npc, camera, questAction) {
  const centerX = Math.round(npc.x + npc.width / 2 - camera.x);
  const top = Math.round(npc.y - camera.y - 35);
  const questHint = questAction?.action === "accept" ? " · Q Accept" : questAction?.action === "turn-in" ? " · Q Turn in" : "";
  const text = npc.promptLabel ?? `E — Talk${questHint}`;
  context.font = "bold 10px system-ui, sans-serif";
  const panelWidth = Math.max(62, Math.ceil(context.measureText(text).width + 12));
  context.fillStyle = "#10202df2";
  context.fillRect(centerX - panelWidth / 2, top, panelWidth, 16);
  context.fillStyle = "#fff3c4";
  context.font = "bold 10px system-ui, sans-serif";
  context.textBaseline = "top";
  context.fillText(text, centerX - panelWidth / 2 + 6, top + 3);
}

function drawTile(context, tile, x, y, size, gridX, gridY) {
  context.fillStyle = tile.color;
  context.fillRect(x, y, size, size);
  switch (tile.id) {
    case "water": case "sea":
      context.fillStyle = "#a0d9dc";
      context.fillRect(x + ((gridX + gridY) % 3) * 3 + 2, y + 7, 5, 1);
      break;
    case "forest":
      context.fillStyle = "#39734b"; context.fillRect(x + 3, y + 2, 10, 8);
      context.fillStyle = "#493d2d"; context.fillRect(x + 7, y + 9, 3, 5);
      break;
    case "mountain": case "rock":
      context.fillStyle = "#a79b84"; context.fillRect(x + 3, y + 3, 10, 9);
      context.fillStyle = "#625b50"; context.fillRect(x + 7, y + 7, 6, 7);
      break;
    case "cave":
      context.fillStyle = "#9c8361"; context.fillRect(x + 2, y + 3, 12, 10);
      context.fillStyle = "#242321"; context.fillRect(x + 6, y + 7, 5, 7);
      break;
    case "city":
      context.fillStyle = "#d5af7e"; context.fillRect(x + 2, y + 3, 11, 10);
      context.fillStyle = "#754d3d"; context.fillRect(x + 4, y + 5, 3, 3); context.fillRect(x + 9, y + 5, 2, 3);
      break;
    case "bridge":
      context.fillStyle = "#9b7048"; context.fillRect(x + 2, y + 4, 12, 2); context.fillRect(x + 2, y + 10, 12, 2);
      break;
    case "olive":
      context.fillStyle = "#82904b"; context.fillRect(x + 3, y + 3, 10, 8);
      context.fillStyle = "#6c4f32"; context.fillRect(x + 7, y + 9, 3, 5);
      break;
    case "gate":
      context.fillStyle = "#fff0a8"; context.fillRect(x + 5, y + 5, 6, 6);
      break;
    case "plaza":
      context.fillStyle = "#c9b391"; context.fillRect(x + 2, y + 2, size - 4, 1); context.fillRect(x + 2, y + size - 3, size - 4, 1);
      context.fillStyle = "#a98e70"; context.fillRect(x + 3, y + 7, 2, 2); context.fillRect(x + 10, y + 11, 2, 2);
      break;
    case "street":
      context.fillStyle = "#c7ad88"; context.fillRect(x + 2, y + 3, size - 4, 1); context.fillRect(x + 2, y + 12, size - 4, 1);
      break;
    case "tramTrack":
      context.fillStyle = "#ded0ad"; context.fillRect(x + 4, y, 2, size); context.fillRect(x + 10, y, 2, size);
      context.fillStyle = "#685f52"; for (let step = 2; step < size; step += 5) context.fillRect(x + 3, y + step, 10, 1);
      break;
    case "market":
      context.fillStyle = "#e3b96f"; context.fillRect(x + 2, y + 3, 12, 2); context.fillRect(x + 3, y + 6, 10, 5);
      break;
    case "garden":
      context.fillStyle = "#6b9658"; context.fillRect(x + 2, y + 3, 4, 4); context.fillRect(x + 10, y + 9, 4, 4);
      context.fillStyle = "#d4c092"; context.fillRect(x + 7, y + 7, 3, 3);
      break;
    case "alley":
      context.fillStyle = "#74665b"; context.fillRect(x + 2, y + 2, 2, 12); context.fillRect(x + 12, y + 2, 2, 12);
      break;
    case "pier":
      context.fillStyle = "#c29a68"; context.fillRect(x + 1, y + 3, 14, 1); context.fillRect(x + 1, y + 8, 14, 1); context.fillRect(x + 1, y + 13, 14, 1);
      break;
    default: break;
  }
}

function drawGate(context, exit, camera, tileSize, accent) {
  const x = Math.round(exit.x - camera.x); const y = Math.round(exit.y - camera.y);
  if (x < -tileSize || y < -tileSize || x > context.canvas?.width || y > context.canvas?.height) return;
  context.fillStyle = accent;
  context.fillRect(x, y, tileSize, 2); context.fillRect(x, y + tileSize - 2, tileSize, 2);
  context.fillRect(x, y, 2, tileSize); context.fillRect(x + tileSize - 2, y, 2, tileSize);
}

function drawLandmark(context, landmark, camera, tileSize) {
  const x = Math.round(landmark.x * tileSize - camera.x);
  const y = Math.round(landmark.y * tileSize - camera.y);
  drawLandmarkMarker(context, landmark.kind, x, y, tileSize);
  const labelWidth = landmark.label.length * 7 + 10;
  context.fillStyle = "#10202ddd";
  context.fillRect(x - labelWidth / 2, y - 21, labelWidth, 16);
  context.fillStyle = "#f5f0dc";
  context.font = "11px system-ui, sans-serif";
  context.textBaseline = "top";
  context.fillText(landmark.label, x - labelWidth / 2 + 5, y - 19);
}

/** Original geometric landmark markers; stable IDs live in world data. */
function drawLandmarkMarker(context, kind, x, y, tileSize) {
  const cx = x + tileSize / 2;
  if (kind === "monument") {
    context.fillStyle = "#786b59"; context.fillRect(cx - 7, y + 12, 14, 3);
    context.fillStyle = "#d5c49d"; context.fillRect(cx - 4, y + 3, 8, 9); context.fillRect(cx - 6, y + 2, 12, 2);
  } else if (kind === "tram") {
    context.fillStyle = "#572f2c"; context.fillRect(cx - 10, y + 5, 20, 9);
    context.fillStyle = "#d5bd82"; context.fillRect(cx - 7, y + 7, 5, 3); context.fillRect(cx + 2, y + 7, 5, 3);
    context.fillStyle = "#262523"; context.fillRect(cx - 7, y + 14, 3, 2); context.fillRect(cx + 4, y + 14, 3, 2);
  } else if (kind === "tower") {
    context.fillStyle = "#4f463d"; context.fillRect(cx - 7, y + 5, 14, 12);
    context.fillStyle = "#bd9b6b"; context.fillRect(cx - 5, y + 2, 10, 4); context.fillRect(cx - 3, y, 6, 3);
    context.fillStyle = "#292b2a"; context.fillRect(cx - 2, y + 9, 4, 8);
  } else if (kind === "pier") {
    context.fillStyle = "#6d5035"; context.fillRect(cx - 8, y + 8, 16, 4);
    context.fillStyle = "#c69a60"; context.fillRect(cx - 10, y + 5, 20, 2); context.fillRect(cx - 10, y + 13, 20, 2);
  } else if (kind === "market") {
    context.fillStyle = "#8d4938"; context.fillRect(cx - 9, y + 4, 18, 4);
    context.fillStyle = "#e2c37e"; context.fillRect(cx - 8, y + 9, 16, 6);
    context.fillStyle = "#594331"; context.fillRect(cx - 10, y + 8, 2, 8); context.fillRect(cx + 8, y + 8, 2, 8);
  } else if (kind === "teaGarden") {
    context.fillStyle = "#513f32"; context.fillRect(cx - 7, y + 8, 14, 2); context.fillRect(cx - 1, y + 10, 2, 5);
    context.fillStyle = "#f0dfb4"; context.fillRect(cx + 2, y + 5, 4, 4);
    context.fillStyle = "#a44437"; context.fillRect(cx + 3, y + 6, 2, 2);
  } else if (kind === "alley") {
    context.fillStyle = "#37332f"; context.fillRect(cx - 6, y + 5, 12, 12);
    context.fillStyle = "#c3a97c"; context.fillRect(cx - 4, y + 7, 8, 10); context.fillRect(cx - 7, y + 5, 14, 2);
  }
}

function drawRegionHeader(context, world, width) {
  context.fillStyle = world.theme.panel;
  context.fillRect(8, 8, Math.min(width - 16, 340), 38);
  context.fillStyle = world.theme.accent;
  context.fillRect(8, 8, 4, 38);
  context.fillStyle = "#fff6de";
  context.font = "bold 14px system-ui, sans-serif";
  context.textBaseline = "top";
  context.fillText(world.name, 20, 13);
  context.fillStyle = "#d4dfd5";
  context.font = "10px system-ui, sans-serif";
  context.fillText(world.id === "overworld" ? "Move with WASD or arrows · F3 debug" : "Return through the marked gate", 20, 31);
}

function drawDebug(context, world, player, camera, metrics) {
  const lines = [
    `Region: ${world.name}`,
    `Player: ${player.x.toFixed(1)}, ${player.y.toFixed(1)}`,
    `Camera: ${camera.x.toFixed(1)}, ${camera.y.toFixed(1)}`,
    `FPS: ${metrics.fps.toFixed(0)}  |  frame: ${metrics.frameTime.toFixed(1)} ms`,
    "F3: hide debug",
  ];
  if (world.id === "istanbul" || world.id === "overworld") lines.push("Tiles: green walkable · red blocked");
  context.fillStyle = "#07111ddd";
  context.fillRect(8, 52, 244, lines.length * 15 + 14);
  context.font = "12px monospace";
  context.textBaseline = "top";
  context.fillStyle = "#e5f4e3";
  lines.forEach((line, index) => context.fillText(line, 16, 58 + index * 15));
}
