import { describe, expect, test } from "bun:test";
import { quoteDays, rentalUsage } from "@/lib/calendar-days";
import { matchConfigToOptions } from "@/lib/config-match";

describe("calendrier", () => {
  test("une pastille par jour couvert par une ligne de location", () => {
    const d = quoteDays({ event_date: "2026-12-01", items: [{ productId: "p", quantity: 1, startDate: "2026-12-10", endDate: "2026-12-12" }] });
    expect([...d.keys()]).toEqual(["2026-12-10", "2026-12-11", "2026-12-12"]);
  });
  test("repli sur la date d'événement sans dates de ligne", () => {
    expect([...quoteDays({ event_date: "2026-12-01", items: [{ productId: "p" }] })]).toEqual([["2026-12-01", "event"]]);
  });
  test("sur mesure seul : date de livraison souhaitée, type distinct", () => {
    expect([...quoteDays({ event_date: "2026-12-01", custom_delivery_date: "2026-12-20", items: [{ kind: "custom" }] })]).toEqual([["2026-12-20", "custom"]]);
  });
  test("conflits : lignes sur mesure ignorées", () => {
    const u = rentalUsage([{ productId: "p", quantity: 2, startDate: "2026-12-10", endDate: "2026-12-10" }, { kind: "custom", productId: "p", quantity: 5, startDate: "2026-12-10", endDate: "2026-12-10" }]);
    expect(u.get("2026-12-10")?.get("p")).toBe(2);
  });
});

describe("présélection depuis la 3D", () => {
  const cats = [{ id: "c1", name_fr: "Finition", name_en: "Finish" }, { id: "c2", name_fr: "Couleur", name_en: "Color" }];
  const opts = [
    { id: "o1", category_id: "c1", name_fr: "Chêne clair", name_en: "Light oak" },
    { id: "o2", category_id: "c1", name_fr: "Noir", name_en: "Black" },
    { id: "o3", category_id: "c2", name_fr: "Rouge", name_en: "Red" },
    { id: "o4", category_id: "c2", name_fr: "rouge", name_en: "Red" },
  ];
  test("correspondance insensible à la casse et aux accents", () => {
    expect(matchConfigToOptions({ finition: "CHENE CLAIR" }, cats, opts)).toEqual({ c1: "o1" });
  });
  test("pas de présélection si la correspondance n'est pas unique", () => {
    expect(matchConfigToOptions({ couleur: "Rouge" }, cats, opts)).toEqual({});
  });
});

describe("présélection depuis un récap texte", () => {
  test("« Finition : Placage bois » sélectionne l'option Placage bois", () => {
    const { recapPairs } = require("@/lib/config-match");
    const cats = [{ id: "c1", name_fr: "Finition", name_en: "Finish" }];
    const opts = [{ id: "o1", category_id: "c1", name_fr: "Placage bois", name_en: "Wood veneer" }, { id: "o2", category_id: "c1", name_fr: "Blanc", name_en: "White" }];
    expect(matchConfigToOptions(recapPairs("Stèle\n300 × 300\n\nFinition : Placage bois\nLogo : Sans logo"), cats, opts)).toEqual({ c1: "o1" });
  });
});
