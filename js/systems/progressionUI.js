/** HUD and read-only achievement journal drawing/controller. */
export class ProgressionUI {
  constructor(input, progression, achievements, eventBus = null, discovery = null) {
    this.input = input;
    this.progression = progression;
    this.achievements = achievements;
    this.discovery = discovery;
    this.open = false;
    this.notification = "";
    this.notificationTime = 0;
    this.notificationQueue = [];
    this.unsubscribers = [];
    if (eventBus) {
      this.unsubscribers.push(eventBus.on("location_discovered", (event) => {
        this.notificationQueue.push(event.message ?? `Location discovered: ${event.name ?? event.locationId}`);
      }));
      this.unsubscribers.push(eventBus.on("item_source_collected", (event) => {
        this.notificationQueue.push(`Acquired: ${event.itemName}${event.quantity > 1 ? ` x${event.quantity}` : ""}`);
      }));
      this.unsubscribers.push(eventBus.on("item_pickup_failed", (event) => this.notificationQueue.push(event.message ?? "Inventory full")));
    }
  }

  update(deltaTime, blocked = false) {
    if (this.input.consumePress("h") && !blocked) this.open = !this.open;
    this.notificationTime = Math.max(0, this.notificationTime - deltaTime);
    const nextNotification = this.achievements.consumeNotification();
    if (nextNotification) this.notificationQueue.push(nextNotification);
    if (this.notificationTime === 0) {
      this.notification = this.notificationQueue.shift() ?? "";
      if (this.notification) this.notificationTime = 3.5;
    }
  }

  isOpen() { return this.open; }
  getView() {
    return {
      progression: this.progression.getSnapshot(),
      discoveryProgress: this.discovery?.getProgress() ?? { discovered: 0, total: 0 },
      open: this.open,
      achievements: this.achievements.getAll(),
      notification: this.notification,
    };
  }
  destroy() { for (const unsubscribe of this.unsubscribers) unsubscribe(); this.unsubscribers.length = 0; }
}

export function drawProgressionUI(context, view, width, height) {
  const { progression } = view;
  const panelWidth = 174; const x = width - panelWidth - 10; const y = 10;
  context.fillStyle = "#101a20e8"; context.fillRect(x, y, panelWidth, 65);
  context.fillStyle = "#d6bd7b"; context.fillRect(x, y, 3, 65);
  context.font = "bold 11px system-ui, sans-serif"; context.textBaseline = "top"; context.fillStyle = "#fff1c6";
  context.fillText(`Level ${progression.level}`, x + 11, y + 7);
  context.fillStyle = "#d0d9cf"; context.font = "10px system-ui, sans-serif";
  context.fillText(`XP ${progression.xpIntoLevel} / ${progression.xpForNextLevel}`, x + 11, y + 23);
  context.fillText(`Coins ${progression.coins}`, x + 11, y + 37);
  context.fillText(`Locations ${view.discoveryProgress.discovered}/${view.discoveryProgress.total} · H Journal`, x + 11, y + 51);

  if (view.open) drawAchievementPanel(context, view.achievements, width, height);
  if (view.notification) drawUnlockNotification(context, view.notification, width);
}

function drawAchievementPanel(context, achievements, width, height) {
  const panelWidth = Math.min(420, width - 28); const panelHeight = Math.min(330, 110 + achievements.length * 49);
  const x = Math.round((width - panelWidth) / 2); const y = Math.round((height - panelHeight) / 2);
  context.fillStyle = "#101a20f4"; context.fillRect(x, y, panelWidth, panelHeight);
  context.strokeStyle = "#d6bd7b"; context.lineWidth = 2; context.strokeRect(x + 1, y + 1, panelWidth - 2, panelHeight - 2);
  context.fillStyle = "#fff1c6"; context.font = "bold 16px system-ui, sans-serif"; context.textBaseline = "top";
  context.fillText("Achievements", x + 16, y + 12);
  context.fillStyle = "#c2d0c4"; context.font = "10px system-ui, sans-serif";
  context.fillText("H close", x + panelWidth - 58, y + 17);
  achievements.forEach((achievement, index) => {
    const rowY = y + 43 + index * 49;
    context.fillStyle = achievement.unlocked ? "#254335" : "#25343a";
    context.fillRect(x + 12, rowY, panelWidth - 24, 43);
    context.fillStyle = achievement.unlocked ? "#a9dfb3" : "#d6bd7b";
    context.font = "bold 11px system-ui, sans-serif";
    context.fillText(`${achievement.unlocked ? "✓" : "·"} ${achievement.title}`, x + 22, rowY + 6);
    context.fillStyle = "#d0d9cf"; context.font = "10px system-ui, sans-serif";
    const progressText = achievement.unlocked ? "Unlocked" : formatAchievementProgress(achievement);
    context.fillText(`${achievement.description}  ${progressText}`, x + 22, rowY + 23, panelWidth - 44);
  });
}

function formatAchievementProgress(achievement) {
  const criteria = achievement.criteria;
  if (criteria.requiredRegionIds) return `${achievement.progress}/${criteria.requiredRegionIds.length} regions`;
  if (criteria.requiredLevel !== undefined) return `Level ${achievement.progress}/${criteria.requiredLevel}`;
  return `${achievement.progress}/${criteria.requiredAmount ?? 1}`;
}

function drawUnlockNotification(context, text, width) {
  context.font = "bold 12px system-ui, sans-serif";
  const boxWidth = Math.min(width - 20, context.measureText(text).width + 28);
  const x = Math.round((width - boxWidth) / 2); const y = 70;
  context.fillStyle = "#193c2d"; context.fillRect(x, y, boxWidth, 30);
  context.strokeStyle = "#a9dfb3"; context.strokeRect(x, y, boxWidth, 30);
  context.fillStyle = "#e6ffe8"; context.textBaseline = "top"; context.fillText(text, x + 12, y + 8, boxWidth - 24);
}
