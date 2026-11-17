/** Public indicative range from an internal unit price. Pure arithmetic, no internal rates. */
export function publicRange(unitHt: number, lowPct: number, highPct: number, floorHt: number) {
  const floor = Number.isFinite(floorHt) && floorHt > 0 ? floorHt : 0;
  const low = Math.max(floor, Math.floor((unitHt * (1 - lowPct / 100)) / 10) * 10);
  const high = Math.max(low, floor, Math.ceil((unitHt * (1 + highPct / 100)) / 10) * 10);
  return { low, high };
}

export type RangeSettings = { range_low_pct: number | null; range_high_pct: number | null; floor_ht: number | null };
export type EngineResult = { ok: boolean; unite_ht?: number; incomplet?: boolean; alertes?: unknown[]; non_chiffre?: unknown[] };
/** Only these keys ever leave the server. */
export type PublicEstimate = { low: number; high: number; per: "unit"; study: false } | { per: "unit"; study: true };

/** Standard exclusions listed in `non_chiffre` (ink, hardware, delivery) are covered by the public reserves;
 * the engine flags a genuinely unpriced configuration with `incomplet`. */
/** Maps an internal engine result to the public whitelist. Non-simple configurations become a study. */
export function publicEstimate(r: EngineResult, s: RangeSettings): PublicEstimate {
  const unit = Number(r.unite_ht);
  const blocking = (r.alertes?.length ?? 0) > 0 || r.incomplet === true;
  if (!r.ok || blocking || !Number.isFinite(unit) || unit <= 0) return { per: "unit", study: true };
  const { low, high } = publicRange(unit, Number(s.range_low_pct ?? 20), Number(s.range_high_pct ?? 20), Number(s.floor_ht ?? 0));
  return { low, high, per: "unit", study: false };
}
