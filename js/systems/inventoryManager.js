import { ITEMS_BY_ID } from "../../data/items.js";

/** Owns inventory rules and emits domain events without depending on UI or quests. */
export class InventoryManager {
  constructor(gameState, definitions = ITEMS_BY_ID) {
    this.gameState = gameState;
    this.definitions = definitions;
    this.listeners = new Set();
    gameState.player.inventory ??= [];
    // Normalize the earlier quest-reward stack shape at the system boundary.
    gameState.player.inventory = gameState.player.inventory.map((stack) => ({
      itemId: stack.itemId ?? stack.id,
      quantity: stack.quantity ?? stack.amount ?? 0,
      // Old stacks have unknown provenance and cannot satisfy source-bound turn-ins.
      sources: Array.isArray(stack.sources)
        ? stack.sources.map((source) => ({ ...source })).filter((source) => source.quantity > 0)
        : [{ sourceId: null, sourceType: null, regionId: null, quantity: stack.quantity ?? stack.amount ?? 0 }],
    })).filter((stack) => this.definitions.has(stack.itemId) && stack.quantity > 0);
  }

  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  getDefinition(itemId) { return this.definitions.get(itemId) ?? null; }
  getQuantity(itemId) {
    return this.gameState.player.inventory
      .filter((stack) => stack.itemId === itemId)
      .reduce((total, stack) => total + stack.quantity, 0);
  }
  getQuantityFromSource(itemId, sourceId) {
    return this.gameState.player.inventory
      .filter((stack) => stack.itemId === itemId)
      .flatMap((stack) => stack.sources ?? [])
      .filter((source) => source.sourceId === sourceId)
      .reduce((total, source) => total + source.quantity, 0);
  }

  hasItem(itemId, quantity = 1, options = {}) {
    return options.sourceId === undefined
      ? this.getQuantity(itemId) >= quantity
      : this.getQuantityFromSource(itemId, options.sourceId) >= quantity;
  }
  getStacks() { return this.gameState.player.inventory.map((stack) => ({ ...stack, item: this.getDefinition(stack.itemId) })); }

  canAddItem(itemId, quantity = 1) {
    const item = this.getDefinition(itemId);
    if (!item || !Number.isInteger(quantity) || quantity < 1) return false;
    return this.getQuantity(itemId) + quantity <= (item.stackable ? item.maxStack : 1);
  }

  addItem(itemId, quantity = 1, context = {}) {
    if (!this.canAddItem(itemId, quantity)) return false;
    const stack = this.gameState.player.inventory.find((entry) => entry.itemId === itemId);
    if (stack) stack.quantity += quantity;
    else this.gameState.player.inventory.push({ itemId, quantity, sources: [] });
    const destination = stack ?? this.gameState.player.inventory.find((entry) => entry.itemId === itemId);
    const sourceRecord = {
      sourceId: context.sourceId ?? null,
      sourceType: context.sourceType ?? null,
      regionId: context.regionId ?? null,
    };
    const existingSource = destination.sources.find((source) =>
      source.sourceId === sourceRecord.sourceId && source.sourceType === sourceRecord.sourceType && source.regionId === sourceRecord.regionId,
    );
    if (existingSource) existingSource.quantity += quantity;
    else destination.sources.push({ ...sourceRecord, quantity });
    this.emit({ type: "item_added", itemId, quantity, ...context });
    this.emit({ type: "inventory_changed", itemId });
    return true;
  }

  removeItem(itemId, quantity = 1, options = {}) {
    if (!Number.isInteger(quantity) || quantity < 1 || !this.hasItem(itemId, quantity, options)) return false;
    let remaining = quantity;
    for (const stack of this.gameState.player.inventory.filter((entry) => entry.itemId === itemId)) {
      const sources = stack.sources ?? [{ sourceId: null, quantity: stack.quantity }];
      let removedFromStack = 0;
      for (const source of sources) {
        if (options.sourceId !== undefined && source.sourceId !== options.sourceId) continue;
        const removed = Math.min(source.quantity, remaining);
        source.quantity -= removed;
        remaining -= removed;
        removedFromStack += removed;
        if (remaining === 0) break;
      }
      stack.sources = sources.filter((source) => source.quantity > 0);
      stack.quantity -= removedFromStack;
      if (remaining === 0) break;
    }
    if (remaining > 0) return false;
    this.gameState.player.inventory = this.gameState.player.inventory.filter((entry) => entry.quantity > 0);
    this.emit({ type: "item_removed", itemId, quantity, ...(options.sourceId === undefined ? {} : { sourceId: options.sourceId }) });
    this.emit({ type: "inventory_changed", itemId });
    return true;
  }

  clearItem(itemId) {
    const quantity = this.getQuantity(itemId);
    return quantity === 0 ? false : this.removeItem(itemId, quantity);
  }

  useItem(itemId) {
    const item = this.getDefinition(itemId);
    if (!item?.usable || !this.hasItem(itemId)) return false;
    if (!this.removeItem(itemId, 1)) return false;
    this.emit({ type: "item_used", itemId, quantity: 1 });
    return true;
  }

  emit(event) { for (const listener of this.listeners) listener(event); }
}
