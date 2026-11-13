export function cataloguePrice(product: { price_event?: number | null; price_day: number }): number {
  return Number(product.price_event ?? product.price_day);
}

export function cataloguePriceBounds(products: Array<{ price_event?: number | null; price_day: number }>) {
  const prices = products.map(cataloguePrice).filter(Number.isFinite);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 };
}

export function withinPriceRange(product: { price_event?: number | null; price_day: number }, min?: number, max?: number) {
  const price = cataloguePrice(product);
  return (min === undefined || price >= min) && (max === undefined || price <= max);
}