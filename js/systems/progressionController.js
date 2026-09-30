/** Debug-only progression controls, using the existing F3 debug state. */
export class ProgressionController {
  constructor(input, progression) { this.input = input; this.progression = progression; }
  update(debug) {
    const addXp = this.input.consumePress("6");
    const addCoins = this.input.consumePress("7");
    const removeCoins = this.input.consumePress("8");
    if (!debug) return;
    if (addXp) this.progression.addXp(25);
    if (addCoins) this.progression.addCoins(100);
    if (removeCoins) this.progression.removeCoins(10);
  }
}
