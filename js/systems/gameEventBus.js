/** Small domain-event hub keeps progression achievements independent of game systems. */
export class GameEventBus {
  constructor() { this.listeners = new Map(); }
  on(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
    return () => this.listeners.get(type)?.delete(listener);
  }
  emit(type, payload = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener({ ...payload, type });
  }
  destroy() { this.listeners.clear(); }
}
