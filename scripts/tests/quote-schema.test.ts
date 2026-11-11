import { describe, expect, test } from "bun:test";
import { PayloadSchema } from "@/lib/quote-schema";

const rental = { line_id: "l1", productId: "11111111-1111-4111-8111-111111111111", quantity: 1,
  startDate: "2026-12-11", endDate: "2026-12-11", days: 1, option_ids: [] };
const custom = { kind: "custom", line_id: "c1", piece: "stele", quantity: 1, reference: "STL-1",
  configuration: { pk: "stele", qte: 1, tous: {} } };
const base = { customer_name: "Test", email: "test@example.com", lang: "fr", items: [rental] };

describe("validation /api/quotes/submit", () => {
  test("demande valide acceptée (location + sur mesure)", () => {
    expect(PayloadSchema.safeParse({ ...base, items: [rental, custom] }).success).toBe(true);
  });
  test("prix envoyé par le navigateur refusé (ligne)", () => {
    expect(PayloadSchema.safeParse({ ...base, items: [{ ...rental, price_day: 1 }] }).success).toBe(false);
  });
  test("total envoyé par le navigateur refusé (demande)", () => {
    expect(PayloadSchema.safeParse({ ...base, total_ttc: 1 }).success).toBe(false);
  });
  test("champ inconnu refusé", () => {
    expect(PayloadSchema.safeParse({ ...base, foo: "bar" }).success).toBe(false);
  });
  test("ligne sur mesure invalide refusée : pièce inconnue", () => {
    expect(PayloadSchema.safeParse({ ...base, items: [{ ...custom, piece: "inconnue" }] }).success).toBe(false);
  });
  test("ligne sur mesure invalide refusée : quantité > 50", () => {
    expect(PayloadSchema.safeParse({ ...base, items: [{ ...custom, quantity: 51 }] }).success).toBe(false);
  });
  test("ligne sur mesure invalide refusée : prix ajouté", () => {
    expect(PayloadSchema.safeParse({ ...base, items: [{ ...custom, unit_price: 10 }] }).success).toBe(false);
  });
});
