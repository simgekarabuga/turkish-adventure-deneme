/** Canvas-only presentation for dialogue; conversation state stays in DialogueSystem. */
export function drawDialogueUI(context, dialogue, width, height) {
  if (!dialogue) return;
  const boxHeight = 112;
  const x = 24;
  const y = height - boxHeight - 20;
  const boxWidth = width - x * 2;

  context.fillStyle = "#101a26";
  context.fillRect(x, y, boxWidth, boxHeight);
  context.fillStyle = "#e6c66a";
  context.fillRect(x, y, boxWidth, 3);
  context.fillRect(x, y, 3, boxHeight);
  context.fillRect(x + boxWidth - 3, y, 3, boxHeight);
  context.fillRect(x, y + boxHeight - 3, boxWidth, 3);

  context.textBaseline = "top";
  context.font = "bold 14px system-ui, sans-serif";
  context.fillStyle = "#f3d27b";
  context.fillText(dialogue.speaker, x + 18, y + 14);
  context.font = "15px system-ui, sans-serif";
  context.fillStyle = "#f5f0dc";
  context.fillText(dialogue.text, x + 18, y + 42);
  context.font = "11px system-ui, sans-serif";
  context.fillStyle = "#c3d1d2";
  context.fillText("E / Enter / Space · continue     Esc · close", x + 18, y + 82);
}
