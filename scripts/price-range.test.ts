import { expect, test } from "bun:test";
import { publicRange } from "../src/lib/price-range";

test("5% / 15% rounded to the ten", () => {
  // 1463 → 1460 ; 1771 → 1780
  expect(publicRange(1540, 5, 15, 0)).toEqual({ low: 1460, high: 1780 });
});
test("floor wins when higher than the low bound", () => {
  expect(publicRange(1000, 5, 15, 1200)).toEqual({ low: 1200, high: 1200 });
});
