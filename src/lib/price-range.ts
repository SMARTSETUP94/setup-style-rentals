/** Public indicative range from an internal unit price. Pure arithmetic, no internal rates. */
export function publicRange(unitHt: number, lowPct: number, highPct: number, floorHt: number) {
  const low = Math.floor(Math.max(floorHt, unitHt * (1 - lowPct / 100)) / 50) * 50;
  const high = Math.ceil((unitHt * (1 + highPct / 100)) / 50) * 50;
  return { low, high: Math.max(high, low) };
}
