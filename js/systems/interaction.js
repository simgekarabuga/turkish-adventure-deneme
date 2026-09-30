import { DialogueSystem } from "./dialogue.js";

/** Resolves nearby NPCs and routes key presses to the dialogue state machine. */
export class InteractionSystem {
  constructor(npcManager, dialogueSystem = new DialogueSystem(), onNpcTalk = () => {}, onDialogueCompleted = () => {}, resolveNpcDialogue = (npc) => npc.dialogueId, onWorldInteract = () => {}) {
    this.npcManager = npcManager;
    this.dialogue = dialogueSystem;
    this.onNpcTalk = onNpcTalk;
    this.onDialogueCompleted = onDialogueCompleted;
    this.resolveNpcDialogue = resolveNpcDialogue;
    this.onWorldInteract = onWorldInteract;
    this.nearbyNpc = null;
    this.nearbyTarget = null;
  }

  update(player, input, worldInteractables = []) {
    if (this.dialogue.active) {
      this.nearbyNpc = null;
      this.nearbyTarget = null;
      if (input.consumePress("escape")) {
        this.dialogue.close();
        this.onDialogueCompleted();
      } else if (input.consumePress("e", "enter", "space")) {
        const wasActive = this.dialogue.active;
        this.dialogue.advance();
        if (wasActive && !this.dialogue.active) this.onDialogueCompleted();
      }
      return;
    }

    this.nearbyTarget = this.findNearby(player, worldInteractables);
    this.nearbyNpc = this.nearbyTarget?.interactionType === "world" ? null : this.nearbyTarget;
    if (this.nearbyTarget && input.consumePress("e")) {
      if (this.nearbyTarget.interactionType === "world") {
        this.onWorldInteract(this.nearbyTarget);
      } else {
        const dialogueId = this.resolveNpcDialogue(this.nearbyTarget);
        if (this.dialogue.start(dialogueId, this.nearbyTarget.name)) this.onNpcTalk(this.nearbyTarget);
      }
      this.nearbyNpc = null;
      this.nearbyTarget = null;
      return;
    }
    // Consume E even when there is no target so a key press cannot trigger later.
    input.consumePress("e");
    input.consumePress("enter", "space");
  }

  findNearby(player, worldInteractables = []) {
    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;
    let closest = null;
    let closestDistance = Infinity;
    for (const target of [...this.npcManager.getAll(), ...worldInteractables]) {
      const dx = target.x + target.width / 2 - playerX;
      const dy = target.y + target.height / 2 - playerY;
      const distance = Math.hypot(dx, dy);
      if (distance <= target.interactionRadius && distance < closestDistance) {
        closest = target;
        closestDistance = distance;
      }
    }
    return closest;
  }

  getNearbyNpc() { return this.nearbyNpc; }
  getNearbyTarget() { return this.nearbyTarget; }
  getDialogueState() { return this.dialogue.getState(); }
}
