/** Pure pricing module shared by the browser cart and the server submit route.
 *  No React / browser dependencies. */

/** Volume discount tier: applies when quantity >= min_qty */
export interface QuantityDiscountTier {
  min_qty: number;
  /** rate as a decimal, e.g. 0.10 for 10% */
  rate: number;
}

/** Duration discount tier: applies when number of rental days >= min_days */
export interface DurationDiscountTier {
  min_days: number;
  rate: number;
}

/** Default volume discount tiers used when a product does not override them. */
export const DEFAULT_QUANTITY_DISCOUNTS: QuantityDiscountTier[] = [
  { min_qty: 2, rate: 0.1 },
  { min_qty: 6, rate: 0.15 },
  { min_qty: 10, rate: 0.2 },
];

export const VAT_RATE = 0.2;

function pickTierRate<T extends { rate: number }>(tiers: T[] | undefined, matches: (t: T) => boolean): number {
  if (!tiers || tiers.length === 0) return 0;
  const eligible = tiers.filter(matches);
  if (eligible.length === 0) return 0;
  return eligible.reduce((max, t) => (t.rate > max ? t.rate : max), 0);
}

/** Volume discount based on the product's tiers (or defaults if none provided). */
export function volumeDiscount(qty: number, tiers?: QuantityDiscountTier[]): number {
  // If an empty array is explicitly passed, no discount applies (unique products).
  const list = tiers ?? DEFAULT_QUANTITY_DISCOUNTS;
  return pickTierRate(list, (t) => qty >= t.min_qty);
}

/** Duration discount based on the product's tiers. Returns 0 if no tiers. */
export function durationDiscount(days: number, tiers?: DurationDiscountTier[]): number {
  return pickTierRate(tiers, (t) => days >= t.min_days);
}

export interface LineInput {
  price_day: number;
  deposit: number;
  quantity: number;
  days: number;
  optionPrices: number[];
  quantityDiscounts?: QuantityDiscountTier[];
  durationDiscounts?: DurationDiscountTier[];
}

export interface LineResult {
  gross: number;
  discount: number;
  net: number;
  deposit: number;
  optionsPerUnit: number;
  optionsTotal: number;
  qtyRate: number;
  durationRate: number;
}

export function computeLine(l: LineInput): LineResult {
  const optsUnit = l.optionPrices.reduce((s, p) => s + (p || 0), 0);
  const rentalGross = l.price_day * l.days * l.quantity;
  const optionsGross = optsUnit * l.quantity; // fixed, not per day
  const gross = rentalGross + optionsGross;
  const qtyRate = volumeDiscount(l.quantity, l.quantityDiscounts);
  const durationRate = durationDiscount(l.days, l.durationDiscounts);
  // Combine rates additively, capped at 50%
  const combined = Math.min(0.5, qtyRate + durationRate);
  // Discount applies only on the rental part, not on fixed options
  const discount = rentalGross * combined;
  const net = gross - discount;
  const deposit = l.deposit * l.quantity;
  return { gross, discount, net, deposit, optionsPerUnit: optsUnit, optionsTotal: optionsGross, qtyRate, durationRate };
}

export interface LogisticsSettings {
  base: number;
  perItem: number;
  setup: number;
  pickup: number;
}

export interface Totals {
  subtotal_ht: number;
  discount_total: number;
  delivery_fee: number;
  setup_fee: number;
  pickup_fee: number;
  total_ht: number;
  vat: number;
  total_ttc: number;
  total_deposit: number;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(lines: LineResult[], logistics: LogisticsSettings): Totals {
  const sum = lines.reduce(
    (a, l) => ({ gross: a.gross + l.gross, discount: a.discount + l.discount, net: a.net + l.net, deposit: a.deposit + l.deposit }),
    { gross: 0, discount: 0, net: 0, deposit: 0 },
  );
  const has = lines.length > 0;
  const delivery_fee = has ? logistics.base + lines.length * logistics.perItem : 0;
  const setup_fee = has ? logistics.setup : 0;
  const pickup_fee = has ? logistics.pickup : 0;
  const total_ht = sum.net + delivery_fee + setup_fee + pickup_fee;
  const vat = round2(total_ht * VAT_RATE);
  return {
    subtotal_ht: sum.gross,
    discount_total: sum.discount,
    delivery_fee,
    setup_fee,
    pickup_fee,
    total_ht,
    vat,
    total_ttc: total_ht + vat,
    total_deposit: sum.deposit,
  };
}

export const LOGISTICS_KEYS = {
  base: "logistics_base_fee",
  perItem: "logistics_per_item_fee",
  setup: "logistics_setup_fee",
  pickup: "logistics_pickup_fee",
} as const;

export function logisticsFromSettings(rows: Array<{ key: string; value_fr: string | null }>): LogisticsSettings {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    const n = Number(r.value_fr);
    map[r.key] = Number.isFinite(n) && n >= 0 ? n : 0;
  });
  return {
    base: map[LOGISTICS_KEYS.base] ?? 0,
    perItem: map[LOGISTICS_KEYS.perItem] ?? 0,
    setup: map[LOGISTICS_KEYS.setup] ?? 0,
    pickup: map[LOGISTICS_KEYS.pickup] ?? 0,
  };
}
