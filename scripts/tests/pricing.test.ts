import { describe, expect, test } from "bun:test";
import { computeLine, computeTotals, durationDiscount, volumeDiscount, round2 } from "@/lib/pricing";

const logistics = { base: 80, perItem: 10, setup: 50, pickup: 50 };

describe("remises", () => {
  test("volume par défaut : 2 → 10 %, 6 → 15 %, 10 → 20 %", () => {
    expect(volumeDiscount(1)).toBe(0);
    expect(volumeDiscount(2)).toBe(0.1);
    expect(volumeDiscount(6)).toBe(0.15);
    expect(volumeDiscount(10)).toBe(0.2);
  });
  test("tableau vide = pièce unique, aucune remise", () => {
    expect(volumeDiscount(10, [])).toBe(0);
  });
  test("durée selon paliers du produit", () => {
    const tiers = [{ min_days: 3, rate: 0.1 }, { min_days: 7, rate: 0.25 }];
    expect(durationDiscount(2, tiers)).toBe(0);
    expect(durationDiscount(3, tiers)).toBe(0.1);
    expect(durationDiscount(8, tiers)).toBe(0.25);
  });
  test("remises cumulées plafonnées à 50 %, sur la location seule (pas les options)", () => {
    const l = computeLine({ price_day: 100, deposit: 0, quantity: 10, days: 7, optionPrices: [20],
      durationDiscounts: [{ min_days: 7, rate: 0.4 }] });
    // location 100×7×10 = 7000 ; 20 % + 40 % → 50 % ; options 20×10 = 200 non remisées
    expect(l.gross).toBe(7200);
    expect(l.discount).toBe(3500);
    expect(l.net).toBe(3700);
  });
});

describe("totaux", () => {
  test("frais logistiques : base + par ligne + installation + reprise", () => {
    const a = computeLine({ price_day: 60, deposit: 0, quantity: 1, days: 1, optionPrices: [] });
    const b = computeLine({ price_day: 40, deposit: 0, quantity: 1, days: 1, optionPrices: [] });
    const t = computeTotals([a, b], logistics);
    expect(t.delivery_fee).toBe(100);
    expect(t.setup_fee).toBe(50);
    expect(t.pickup_fee).toBe(50);
    expect(t.total_ht).toBe(300);
  });
  test("TVA 20 % arrondie au centime", () => {
    const l = computeLine({ price_day: 33.33, deposit: 0, quantity: 1, days: 1, optionPrices: [] });
    const t = computeTotals([l], { base: 0, perItem: 0, setup: 0, pickup: 0 });
    expect(t.vat).toBe(6.67);
    expect(round2(t.total_ttc)).toBe(40);
  });
  test("caution = caution unitaire × quantité, hors total", () => {
    const l = computeLine({ price_day: 50, deposit: 200, quantity: 3, days: 1, optionPrices: [] });
    const t = computeTotals([l], { base: 0, perItem: 0, setup: 0, pickup: 0 });
    expect(t.total_deposit).toBe(600);
    expect(t.total_ttc).toBe(t.total_ht + t.vat);
  });
  test("demande 100 % sur mesure (aucune ligne de location) : aucun frais", () => {
    const t = computeTotals([], logistics);
    expect(t.delivery_fee + t.setup_fee + t.pickup_fee).toBe(0);
    expect(t.total_ttc).toBe(0);
  });
});
