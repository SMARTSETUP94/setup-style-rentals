import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { iframePriceMessage } from "../../src/lib/custom-pricing";

test("fourchette → texte FR envoyé à l'iframe", () => {
  expect(iframePriceMessage({ range: { low: 1230, high: 1850 }, study: false }, "fr")).toEqual({
    type: "price-range", text: "Estimation indicative : 1\u202f230 – 1\u202f850 € HT / unité", sub: "Prix confirmé sous 48 h ouvrées",
  });
});
test("fourchette → texte EN", () => {
  const m = iframePriceMessage({ range: { low: 1230, high: 1850 }, study: false }, "en");
  expect(m.text).toBe("Indicative estimate: €1,230 – €1,850 excl. VAT / unit");
  expect(m.sub).toBe("Price confirmed within 48 business hours");
});
test("étude → message d'étude, sans montant", () => {
  const m = iframePriceMessage({ range: null, study: true }, "fr");
  expect(m.text).toBe("Étude nécessaire : prix sous 48 h ouvrées");
  expect(m.text).not.toMatch(/\d{3}/);
});
test("inactive → texte vide (l'iframe garde « Prix sur devis »)", () => {
  expect(iframePriceMessage(null, "fr")).toEqual({ type: "price-range", text: "", sub: "" });
});
test("l'iframe valide le message et ne calcule aucun prix", () => {
  const s = readFileSync("public/configurators/sur-mesure.html", "utf8");
  expect(s).toContain('if(!a(e.origin)||e.source!==window.parent)return');
  expect(s).toContain('"price-range"===t.type&&"string"==typeof t.text&&"string"==typeof t.sub');
});
