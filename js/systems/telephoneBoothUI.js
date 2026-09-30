/** Small modal phone-call panel drawn over the canvas while movement is locked. */
export function drawTelephoneBoothUI(context, state, width, height) {
  if (!state) return;
  const panelWidth = 330;
  const panelHeight = 92;
  const x = Math.round((width - panelWidth) / 2);
  const y = Math.round(height * 0.27);

  context.fillStyle = "#101a26f2";
  context.fillRect(x, y, panelWidth, panelHeight);
  context.strokeStyle = "#d6bd7b";
  context.lineWidth = 2;
  context.strokeRect(x + 1, y + 1, panelWidth - 2, panelHeight - 2);

  context.fillStyle = "#d6bd7b";
  context.fillRect(x + 16, y + 18, 3, 16);
  context.fillRect(x + 19, y + 15, 7, 3);
  context.fillRect(x + 26, y + 18, 3, 5);
  context.fillRect(x + 26, y + 29, 3, 5);
  context.fillRect(x + 19, y + 34, 7, 3);

  context.textBaseline = "top";
  context.font = "bold 12px system-ui, sans-serif";
  context.fillStyle = "#f3d27b";
  context.fillText(state.phase === "reaction" ? "Call ended" : state.phase === "error" ? "No connection" : "Telephone booth", x + 42, y + 14);
  context.font = "13px system-ui, sans-serif";
  context.fillStyle = "#f5f0dc";
  context.fillText(state.message, x + 42, y + 37, panelWidth - 58);
  if (["reaction", "error", "dead"].includes(state.phase)) {
    context.font = "10px system-ui, sans-serif";
    context.fillStyle = "#c3d1d2";
    context.fillText("E / Enter / Space · close", x + 42, y + 67);
  }
}
