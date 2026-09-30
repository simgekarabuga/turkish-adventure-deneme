const SLOT_COUNT = 12;

export function drawInventoryUI(context, state, width, height) {
  if (!state?.open) {
    if (state?.message) drawToast(context, state.message, width, height);
    return;
  }
  const panelW = Math.min(440, width - 28); const panelH = 292;
  const x = Math.round((width - panelW) / 2); const y = Math.round((height - panelH) / 2);
  context.fillStyle = "#101a20f2"; context.fillRect(x, y, panelW, panelH);
  context.strokeStyle = "#d6bd7b"; context.lineWidth = 2; context.strokeRect(x + 1, y + 1, panelW - 2, panelH - 2);
  context.fillStyle = "#fff1c6"; context.font = "bold 17px system-ui, sans-serif"; context.textBaseline = "top";
  context.fillText("Inventory", x + 16, y + 12);
  context.font = "10px system-ui, sans-serif"; context.fillStyle = "#c2d0c4";
  context.fillText("DEBUG ONLY: F3 enables 1–4 add item, 5 remove simit", x + 16, y + 37);

  const slotSize = 42; const gap = 5; const gridX = x + 16; const gridY = y + 62;
  for (let index = 0; index < SLOT_COUNT; index += 1) {
    const sx = gridX + (index % 4) * (slotSize + gap); const sy = gridY + Math.floor(index / 4) * (slotSize + gap);
    context.fillStyle = index === state.selectedIndex ? "#d6bd7b" : "#34434a"; context.fillRect(sx, sy, slotSize, slotSize);
    context.fillStyle = index === state.selectedIndex ? "#243034" : "#19252b"; context.fillRect(sx + 2, sy + 2, slotSize - 4, slotSize - 4);
    const stack = state.stacks[index];
    if (!stack) {
      context.fillStyle = "#68777a"; context.font = "11px monospace"; context.fillText("—", sx + 18, sy + 15);
      continue;
    }
    drawItemIcon(context, stack.item.icon, sx + 10, sy + 9);
    context.fillStyle = "#fff3d1"; context.font = "bold 10px system-ui, sans-serif";
    context.fillText(String(stack.quantity), sx + 28, sy + 28);
  }

  const detailX = gridX + 4 * (slotSize + gap) + 18; const detailW = x + panelW - detailX - 16;
  const selected = state.stacks[state.selectedIndex];
  context.fillStyle = "#25343a"; context.fillRect(detailX, gridY, detailW, 136);
  context.fillStyle = "#fff1c6"; context.font = "bold 13px system-ui, sans-serif";
  context.fillText(selected?.item.name ?? "Empty slot", detailX + 10, gridY + 10);
  context.fillStyle = "#d0d9cf"; context.font = "11px system-ui, sans-serif";
  context.fillText(selected ? `Quantity: ${selected.quantity}` : "No item selected", detailX + 10, gridY + 34);
  context.fillText(selected ? `Type: ${selected.item.type}` : "Choose an occupied slot", detailX + 10, gridY + 52);
  wrapText(context, selected?.item.description ?? "Empty slots are available for future items.", detailX + 10, gridY + 74, detailW - 20, 15, 3);
  context.fillStyle = "#c2d0c4"; context.font = "10px system-ui, sans-serif";
  context.fillText("Arrows/WASD select · E/Enter/Space use · I close", x + 16, y + panelH - 22);
  if (state.message) drawToast(context, state.message, width, height);
}

function drawItemIcon(context, icon, x, y) {
  const colors = { ring: "#d9a84e", cup: "#8ec7ce", charm: "#648bc1", gem: "#bd8fd0" };
  context.fillStyle = colors[icon] ?? "#e2c36f";
  if (icon === "ring") { context.fillRect(x + 2, y, 12, 3); context.fillRect(x, y + 3, 3, 9); context.fillRect(x + 13, y + 3, 3, 9); context.fillRect(x + 3, y + 11, 10, 3); }
  else { context.fillRect(x + 3, y + 2, 9, 12); context.fillRect(x, y + 5, 15, 6); }
}

function drawToast(context, text, width, height) {
  context.font = "bold 12px system-ui, sans-serif"; const boxW = context.measureText(text).width + 24;
  const x = (width - boxW) / 2; const y = height - 40;
  context.fillStyle = "#10202df2"; context.fillRect(x, y, boxW, 26);
  context.fillStyle = "#fff1c6"; context.textBaseline = "top"; context.fillText(text, x + 12, y + 7);
}

function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(/\s+/); let line = ""; let lines = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y + lines * lineHeight); lines += 1; line = word;
      if (lines >= maxLines) return;
    } else line = candidate;
  }
  if (line && lines < maxLines) context.fillText(line, x, y + lines * lineHeight);
}
