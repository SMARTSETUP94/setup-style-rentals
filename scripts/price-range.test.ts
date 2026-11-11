import { expect, test } from "bun:test";
import { publicRange } from "../src/lib/price-range";

test("default 5% / 15% rounded to the fifty", () => {
  // 1540 × 0.95 = 1463 → 1450 ; 1540 × 1.15 = 1771 → 1800
  expect(publicRange(1540, 5, 15, 0)).toEqual({ low: 1450, high: 1800 });
});
test("floor wins when higher than the low bound", () => {
  expect(publicRange(1000, 5, 15, 1200)).toEqual({ low: 1200, high: 1200 });
});
