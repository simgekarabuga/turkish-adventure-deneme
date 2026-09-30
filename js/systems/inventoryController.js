const SLOT_COUNT = 12;

/** Keyboard focus and item-use behavior, kept outside renderer and item rules. */
export class InventoryController {
  constructor(input, inventory) {
    this.input = input;
    this.inventory = inventory;
    this.open = false;
    this.selectedIndex = 0;
    this.message = "";
    this.messageTime = 0;
  }

  update(deltaTime, debug, dialogueActive = false, uiBlocked = false) {
    this.messageTime = Math.max(0, this.messageTime - deltaTime);
    if (this.messageTime === 0) this.message = "";
    const toggleInventory = this.input.consumePress("i");
    if (toggleInventory && !dialogueActive && (!uiBlocked || this.open)) this.open = !this.open;

    // Always consume these key edges so presses made outside debug mode cannot be replayed later.
    const testItemKey = [1, 2, 3, 4].find((number) => this.input.consumePress(String(number)));
    const removeSimitKey = this.input.consumePress("5");
    // Test-only item grants are isolated behind the existing F3 debug toggle.
    if (debug && !this.open && !dialogueActive) {
      if (testItemKey) {
        const itemId = ["simit", "turkish_tea", "nazar_charm", "cat_food"][testItemKey - 1];
        this.setMessage(this.inventory.addItem(itemId) ? `Added ${this.inventory.getDefinition(itemId).name}` : "Stack limit reached");
      }
      if (removeSimitKey) this.setMessage(this.inventory.removeItem("simit") ? "Removed 1 Simit" : "No Simit to remove");
    }
    if (!this.open) return;

    if (this.input.consumePress("arrowleft", "a")) this.selectedIndex = (this.selectedIndex + SLOT_COUNT - 1) % SLOT_COUNT;
    if (this.input.consumePress("arrowright", "d")) this.selectedIndex = (this.selectedIndex + 1) % SLOT_COUNT;
    if (this.input.consumePress("arrowup", "w")) this.selectedIndex = (this.selectedIndex + SLOT_COUNT - 4) % SLOT_COUNT;
    if (this.input.consumePress("arrowdown", "s")) this.selectedIndex = (this.selectedIndex + 4) % SLOT_COUNT;
    if (this.input.consumePress("e", "enter", "space")) {
      const stack = this.inventory.getStacks()[this.selectedIndex];
      if (stack && this.inventory.useItem(stack.itemId)) this.setMessage(stack.item.useMessage ?? `Used ${stack.item.name}`);
      else if (stack) this.setMessage(`${stack.item.name} cannot be used`);
    }
  }

  setMessage(message) { this.message = message; this.messageTime = 1.8; }
  isOpen() { return this.open; }
  getUIState() { return { open: this.open, selectedIndex: this.selectedIndex, stacks: this.inventory.getStacks(), message: this.message }; }
}
