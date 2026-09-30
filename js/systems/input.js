const MOVEMENT_KEYS = new Set(["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]);
const PREVENT_DEFAULT_KEYS = new Set([...MOVEMENT_KEYS, "e", "enter", "space"]);

function normalizeKey(key) {
  const normalized = key.toLowerCase();
  return normalized === " " || normalized === "spacebar" ? "space" : normalized;
}

export function createInput(target = window) {
  const pressed = new Set();
  const justPressed = new Set();
  let debugToggleRequested = false;
  function onKeyDown(event) {
    const key = normalizeKey(event.key);
    if (PREVENT_DEFAULT_KEYS.has(key)) event.preventDefault();
    if (!event.repeat && !pressed.has(key)) justPressed.add(key);
    pressed.add(key);
    if (key === "f3" && !event.repeat) {
      event.preventDefault();
      debugToggleRequested = true;
    }
  }
  function onKeyUp(event) { pressed.delete(normalizeKey(event.key)); }
  function clear() { pressed.clear(); justPressed.clear(); }
  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  target.addEventListener("blur", clear);
  return {
    isDown(...keys) { return keys.some((key) => pressed.has(key.toLowerCase())); },
    consumePress(...keys) {
      for (const key of keys.map(normalizeKey)) {
        if (justPressed.delete(key)) return true;
      }
      return false;
    },
    consumeDebugToggle() {
      const requested = debugToggleRequested;
      debugToggleRequested = false;
      return requested;
    },
    destroy() {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      target.removeEventListener("blur", clear);
      clear();
    },
  };
}
