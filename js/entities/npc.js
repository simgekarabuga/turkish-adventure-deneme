/** A stationary NPC instance created from one data record. */
export class NPC {
  constructor(definition) {
    this.id = definition.id;
    this.name = definition.name;
    this.regionId = definition.regionId;
    this.x = definition.x;
    this.y = definition.y;
    this.spriteId = definition.spriteId;
    this.interactionRadius = definition.interactionRadius;
    this.dialogueId = definition.dialogueId;
    this.description = definition.description ?? "";
    this.tags = definition.tags ?? [];
    this.width = 12;
    this.height = 16;
    this.blocksMovement = true;
  }

  getCollisionBounds() {
    return { x: this.x + 2, y: this.y + 7, width: 8, height: 9 };
  }
}
