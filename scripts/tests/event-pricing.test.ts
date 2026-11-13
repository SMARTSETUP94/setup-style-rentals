import { describe, expect, test } from "bun:test";
import { computeLine } from "@/lib/pricing";
import { ItemSchema } from "@/lib/quote-schema";

const ev = (days: number, quantity = 1, customChosen = false) =>
  computeLine({ price_day: 0, deposit: 0, quantity, days, optionPrices: [],
    priceEvent: 300, eventDaysIncluded: 3, priceExtraDay: 60, customPrice: 40, customChosen });

describe("prix par événement", () => {
  test("1 jour = prix événement", () => expect(ev(1).net).toBe(300));
  test("3 jours = toujours inclus", () => expect(ev(3).net).toBe(300));
  test("5 jours = 300 + 2 × 60", () => expect(ev(5).net).toBe(420));
  test("quantité 10, 5 jours : aucune remise", () => {
    const l = ev(5, 10);
    expect(l.net).toBe(4200);
    expect(l.discount).toBe(0);
  });
  test("personnalisation : + quantité × prix, une fois par événement", () => {
    expect(ev(5, 10, true).net).toBe(4600);
    expect(ev(1, 1, true).net).toBe(340);
  });
  test("personnalisation à 0 ou absente : sans effet", () => {
    const l = computeLine({ price_day: 0, deposit: 0, quantity: 2, days: 1, optionPrices: [], priceEvent: 300, priceExtraDay: 60, customPrice: 0, customChosen: true });
    expect(l.net).toBe(600);
  });
  test("produit ancien modèle (price_event NULL) : calcul inchangé", () => {
    const l = computeLine({ price_day: 50, deposit: 0, quantity: 2, days: 3, optionPrices: [], priceEvent: null, customPrice: 40, customChosen: true });
    expect(l.gross).toBe(300);
    expect(l.discount).toBe(30); // 10 % volume par défaut
    expect(l.event).toBeUndefined();
  });
  test("la demande accepte custom_chosen", () => {
    const r = ItemSchema.safeParse({ line_id: "a", productId: "00000000-0000-4000-8000-000000000000", quantity: 1, custom_chosen: true });
    expect(r.success).toBe(true);
  });
});
