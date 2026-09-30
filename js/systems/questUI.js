/** Compact canvas journal for active quest objectives. */
export function drawQuestJournal(context, quests, width) {
  if (quests.length === 0) return;
  const panelWidth = 218;
  const x = width - panelWidth - 8;
  const y = 52;
  const cardHeight = 75;
  const height = 28 + quests.length * cardHeight;
  context.fillStyle = "#101a26ee";
  context.fillRect(x, y, panelWidth, height);
  context.fillStyle = "#e6c66a";
  context.fillRect(x, y, panelWidth, 3);
  context.textBaseline = "top";
  context.font = "bold 10px system-ui, sans-serif";
  context.fillStyle = "#f3d27b";
  context.fillText("QUEST JOURNAL", x + 10, y + 9);

  quests.forEach((quest, index) => {
    const cardY = y + 28 + index * cardHeight;
    context.fillStyle = "#52634e";
    context.fillRect(x + 8, cardY, panelWidth - 16, 1);
    context.font = "bold 11px system-ui, sans-serif";
    context.fillStyle = "#fff3cf";
    context.fillText(quest.title, x + 10, cardY + 6);
    context.font = "9px system-ui, sans-serif";
    context.fillStyle = "#d1d9cb";
    context.fillText(quest.description, x + 10, cardY + 22);
    quest.objectives.forEach((objective, objectiveIndex) => {
      const label = objective.label ?? objective.type.replaceAll("_", " ");
      const progress = `${objective.currentProgress}/${objective.requiredAmount}`;
      context.fillStyle = objective.completed ? "#9ee0a7" : "#f0dda5";
      context.fillText(`${label}  ${progress}`, x + 10, cardY + 40 + objectiveIndex * 13);
    });
  });
}
