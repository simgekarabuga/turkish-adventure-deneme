/** Cumulative XP thresholds by level (level 1 begins at zero XP). */
export const XP_THRESHOLDS = Object.freeze([0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]);

export function xpThresholdForLevel(level) {
  if (level <= XP_THRESHOLDS.length) return XP_THRESHOLDS[level - 1];
  // Beyond the authored table, keep the final step size predictable and configurable.
  const lastStep = XP_THRESHOLDS.at(-1) - XP_THRESHOLDS.at(-2);
  return XP_THRESHOLDS.at(-1) + (level - XP_THRESHOLDS.length) * lastStep;
}
