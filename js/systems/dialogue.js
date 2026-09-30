import { DIALOGUES } from "../../data/dialogues.js";

/** Small reusable conversation state machine, independent of its canvas UI. */
export class DialogueSystem {
  constructor(dialogues = DIALOGUES) {
    this.dialogues = dialogues;
    this.active = false;
    this.dialogueId = null;
    this.speakerName = "";
    this.lineIndex = 0;
  }

  start(dialogueId, speakerName) {
    if (!this.dialogues[dialogueId]?.length) return false;
    this.dialogueId = dialogueId;
    this.speakerName = speakerName;
    this.lineIndex = 0;
    this.active = true;
    return true;
  }

  advance() {
    if (!this.active) return;
    if (this.lineIndex < this.dialogues[this.dialogueId].length - 1) this.lineIndex += 1;
    else this.close();
  }

  close() {
    this.active = false;
    this.dialogueId = null;
    this.speakerName = "";
    this.lineIndex = 0;
  }

  getState() {
    if (!this.active) return null;
    const line = this.dialogues[this.dialogueId][this.lineIndex];
    return {
      dialogueId: this.dialogueId,
      lineIndex: this.lineIndex,
      totalLines: this.dialogues[this.dialogueId].length,
      speaker: line.speaker === "npc" ? this.speakerName : "Traveler",
      text: line.text,
    };
  }
}
