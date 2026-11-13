import { describe, expect, test } from "bun:test";
import { defaultOptionSelection, BRAND_3D_SLUGS } from "@/lib/default-options";
import { matchConfigToOptions } from "@/lib/config-match";
import { computeLine } from "@/lib/pricing";

// Données réelles du pouf (S16)
const cats = [
  { id: "forme", name_fr: "Forme", name_en: "Shape" },
  { id: "hab", name_fr: "Habillage", name_en: "Covering" },
  { id: "cous", name_fr: "Coussin", name_en: "Cushion" },
];
const opts = [
  { id: "cyl", category_id: "forme", name_fr: "Cylindrique", name_en: "Cylindrical", price: 0, sort_order: 0 },
  { id: "car", category_id: "forme", name_fr: "Carrée", name_en: "Square", price: 0, sort_order: 1 },
  { id: "blanc", category_id: "hab", name_fr: "Blanc", name_en: "White", price: 0, sort_order: 0 },
  { id: "pp", category_id: "hab", name_fr: "Papier peint", name_en: "Wallpaper", price: 100, sort_order: 1 },
  { id: "sans", category_id: "cous", name_fr: "Sans", name_en: "None", price: 0, sort_order: 0 },
  { id: "avec", category_id: "cous", name_fr: "Avec coussin", name_en: "With cushion", price: 75, sort_order: 1 },
];
const priceOf = (sel: Record<string, string>) => Object.values(sel).map((id) => opts.find((o) => o.id === id)!.price);

describe("ajout sans 3D (version standard)", () => {
  test("chaque catégorie reçoit son option incluse à 0 €", () => {
    expect(defaultOptionSelection(cats, opts)).toEqual({ forme: "cyl", hab: "blanc", cous: "sans" });
  });
  test("préfère l'option « d'origine » à une « couleur personnalisée » gratuite", () => {
    const sel = defaultOptionSelection([{ id: "b" }], [
      { id: "perso", category_id: "b", name_fr: "Couleur personnalisée", price: 0, sort_order: 0 },
      { id: "orig", category_id: "b", name_fr: "Finition d'origine", price: 0, sort_order: 1 },
    ]);
    expect(sel).toEqual({ b: "orig" });
  });
  test("podium : finition obligatoire présélectionnée sur « Brut » (incluse)", () => {
    const sel = defaultOptionSelection([{ id: "f" }], [
      { id: "brut", category_id: "f", name_fr: "Brut", price: 0, sort_order: 0 },
      { id: "laque", category_id: "f", name_fr: "Laqué", price: 80, sort_order: 1 },
    ]);
    expect(sel).toEqual({ f: "brut" });
  });
  test("prix serveur = prix affiché : pouf 50 €/j × 2 j, version standard = 100 €", () => {
    const sel = defaultOptionSelection(cats, opts);
    const shown = computeLine({ price_day: 50, deposit: 0, quantity: 1, days: 2, optionPrices: [priceOf(sel).reduce((a, b) => a + b, 0)] });
    const server = computeLine({ price_day: 50, deposit: 0, quantity: 1, days: 2, optionPrices: priceOf(sel) });
    expect(shown.net).toBe(100);
    expect(server.net).toBe(shown.net);
  });
});

describe("ajout après personnalisation 3D", () => {
  test("la configuration 3D remplace la configuration par défaut", () => {
    const sel = { ...defaultOptionSelection(cats, opts) };
    const m = matchConfigToOptions({ Habillage: "Papier peint", Coussin: "Avec coussin" }, cats, opts);
    Object.assign(sel, m);
    expect(sel).toEqual({ forme: "cyl", hab: "pp", cous: "avec" });
    const server = computeLine({ price_day: 50, deposit: 0, quantity: 1, days: 2, optionPrices: priceOf(sel) });
    expect(server.net).toBe(275);
  });
});

test("3D mise en avant uniquement sur les 8 objets de marque", () => {
  expect(BRAND_3D_SLUGS.size).toBe(8);
  expect(BRAND_3D_SLUGS.has("stele")).toBe(true);
  expect(BRAND_3D_SLUGS.has("pouf")).toBe(false);
});
