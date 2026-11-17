import { expect, test } from "bun:test";
import { publicEstimate, publicRange } from "../../src/lib/price-range";
import { chiffrer } from "../../src/server/chiffrage.server.js";

const s20 = { range_low_pct: 20, range_high_pct: 20, floor_ht: 0 };

test("±20 %: low rounded down, high rounded up to the ten", () => {
  // 1234 × 0.8 = 987.2 → 980 ; 1234 × 1.2 = 1480.8 → 1490
  expect(publicRange(1234, 20, 20, 0)).toEqual({ low: 980, high: 1490 });
});
test("exact tens are not moved", () => {
  expect(publicRange(1000, 20, 20, 0)).toEqual({ low: 800, high: 1200 });
});
test("floor_ht lifts the low bound (and the high if needed)", () => {
  expect(publicRange(1000, 20, 20, 900)).toEqual({ low: 900, high: 1200 });
  expect(publicRange(500, 20, 20, 900)).toEqual({ low: 900, high: 900 });
});
test("blocking alerts → study, no amounts", () => {
  expect(publicEstimate({ ok: true, unite_ht: 1000, alertes: ["Hauteur hors limite"] }, s20)).toEqual({ per: "unit", study: true });
});
test("unpriced item → study; plain notes do not", () => {
  expect(publicEstimate({ ok: true, unite_ht: 1000, non_chiffre: ["Fichier d'impression non chiffré"] }, s20).study).toBe(true);
  expect(publicEstimate({ ok: true, unite_ht: 1000, non_chiffre: ["Teinte à valider"] }, s20)).toEqual({ low: 800, high: 1200, per: "unit", study: false });
});
test("incomplete or failed engine → study", () => {
  expect(publicEstimate({ ok: true, unite_ht: 1000, incomplet: true }, s20).study).toBe(true);
  expect(publicEstimate({ ok: false }, s20).study).toBe(true);
});
test("public response exposes only low, high, per, study", () => {
  const r = chiffrer({ pk: "comptoir", tous: {} });
  const out = publicEstimate(r, s20) as Record<string, unknown>;
  for (const k of Object.keys(out)) expect(["low", "high", "per", "study"]).toContain(k);
  const txt = JSON.stringify(out);
  for (const leak of ["unite_ht", "total_ht", "lignes", "alertes", "non_chiffre", "t0"]) expect(txt).not.toContain(leak);
});
