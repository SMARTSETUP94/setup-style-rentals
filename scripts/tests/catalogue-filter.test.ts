import { expect, test } from "bun:test";
import { cataloguePrice, cataloguePriceBounds, withinPriceRange } from "@/lib/catalogue-filter";

test("filter uses event price instead of daily price whenever present", () => {
  const product = { price_event: 300, price_day: 20 };
  expect(cataloguePrice(product)).toBe(300);
  expect(withinPriceRange(product, 250, 350)).toBe(true);
  expect(withinPriceRange(product, 0, 100)).toBe(false);
});
test("legacy prices and zero event price retain their real values", () => {
  expect(cataloguePrice({ price_event: null, price_day: 25 })).toBe(25);
  expect(cataloguePrice({ price_event: 0, price_day: 25 })).toBe(0);
});
test("both inclusive limits and bounds derive from real prices", () => {
  const products = [{ price_event: 300, price_day: 20 }, { price_event: null, price_day: 25 }, { price_event: 720, price_day: 10 }];
  expect(cataloguePriceBounds(products)).toEqual({ min: 25, max: 720 });
  expect(products.filter(p => withinPriceRange(p, 300, 720)).length).toBe(2);
});