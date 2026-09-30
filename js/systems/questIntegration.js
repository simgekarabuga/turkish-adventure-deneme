/** Connects generic NPC/location events and quest actions without quest logic in entities. */
export class QuestIntegrationSystem {
  constructor(questManager) {
    this.questManager = questManager;
  }

  onNpcTalk(npc) {
    this.questManager.processObjectiveEvent({
      type: "talk_to_npc",
      targetId: npc.id,
      regionId: npc.regionId,
    });
  }

  onLocationReached(location) {
    this.questManager.processObjectiveEvent({
      type: "reach_location",
      targetId: location.id,
      regionId: location.regionId,
    });
  }

  update(input, nearbyNpc) {
    if (!input.consumePress("q")) return;
    if (!nearbyNpc) return;
    const action = this.questManager.getNpcQuestAction(nearbyNpc.id);
    if (action?.action === "accept") this.questManager.startQuest(action.questId);
    else if (action?.action === "turn-in") this.questManager.completeQuest(action.questId);
  }

  getNpcIndicator(npcId) { return this.questManager.getNpcQuestIndicator(npcId); }
  getJournalEntries() { return this.questManager.getActiveQuests(); }
}
