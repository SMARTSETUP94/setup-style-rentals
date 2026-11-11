import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface SelectedOption {
  categoryId: string;
  categoryName_fr: string;
  categoryName_en: string;
  optionId: string;
  name_fr: string;
  name_en: string;
  price: number;
}

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

export interface CartItem {
  /** Unique identity of this cart line (generated on add). */
  lineId: string;
  productId: string;
  slug: string;
  name_fr: string;
  name_en: string;
  category_slug: string;
  image_url: string | null;
  price_day: number;
  deposit: number;
  quantity: number;
  days: number;
  startDate?: string;
  endDate?: string;
  selectedOptions?: SelectedOption[];
  quantityDiscounts?: QuantityDiscountTier[];
  durationDiscounts?: DurationDiscountTier[];
  /** Multiline summary of the 3D configurator selection (sent by the iframe). */
  configuratorRecap?: string;
  /** Optional pre-styled HTML summary from newer Pro configurators. Preferred for rendering when present. */
  configuratorRecapHtml?: string;
  /** Public URL of an uploaded client logo (when "Avec logo personnalisé" option is selected). */
  logoUrl?: string;
  /** Original filename of the uploaded logo, for display purposes. */
  logoFilename?: string;
  /** Structured configuration received from the 3D configurator. */
  configuratorData?: Record<string, unknown>;
}

export type NewCartItem = Omit<CartItem, "lineId"> & { lineId?: string };

export function newLineId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Tolerant parsing of a stored cart: never throws. */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: CartItem[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.productId !== "string" || !r.productId) continue;
    const q = Number(r.quantity);
    if (!Number.isFinite(q) || q < 1) continue;
    out.push({
      ...(r as unknown as CartItem),
      quantity: Math.floor(q),
      lineId: typeof r.lineId === "string" && r.lineId ? r.lineId : newLineId(),
    });
  }
  return out;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: NewCartItem) => void;
  update: (lineId: string, patch: Partial<Omit<CartItem, "lineId">>) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "setup-paris-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setItems(parseStoredCart(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't persist until we've loaded the existing cart from storage,
    // otherwise the empty initial state would overwrite it.
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or blocked — keep in-memory cart
    }
  }, [items, hydrated]);

  // Two cart lines are considered the same only if same product, same options, AND same dates
  const lineKey = (item: Pick<CartItem, "selectedOptions" | "startDate" | "endDate" | "configuratorRecap" | "logoUrl">) => {
    const opts = (item.selectedOptions ?? [])
      .map((o) => o.optionId)
      .sort()
      .join("|");
    return [opts, item.startDate ?? "", item.endDate ?? "", item.configuratorRecap ?? "", item.logoUrl ?? ""].join("¦");
  };

  const add = (item: NewCartItem) => {
    setItems((prev) => {
      const key = lineKey(item);
      const existing = prev.find(
        (i) => i.productId === item.productId && lineKey(i) === key,
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && lineKey(i) === key
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                days: item.days,
                startDate: item.startDate,
                endDate: item.endDate,
                quantityDiscounts: item.quantityDiscounts ?? i.quantityDiscounts,
                durationDiscounts: item.durationDiscounts ?? i.durationDiscounts,
                configuratorRecap: item.configuratorRecap ?? i.configuratorRecap,
                configuratorData: item.configuratorData ?? i.configuratorData,
              }
            : i,
        );
      }
      return [...prev, { ...item, lineId: newLineId() }];
    });
  };

  const update = (lineId: string, patch: Partial<Omit<CartItem, "lineId">>) => {
    setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, ...patch, lineId: i.lineId } : i)));
  };

  const remove = (lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  };

  const clear = () => setItems([]);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, update, remove, clear, count }}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Default volume discount tiers used when a product does not override them. */
export const DEFAULT_QUANTITY_DISCOUNTS: QuantityDiscountTier[] = [
  { min_qty: 2, rate: 0.1 },
  { min_qty: 6, rate: 0.15 },
  { min_qty: 10, rate: 0.2 },
];

function pickTierRate<T extends { rate: number }>(
  tiers: T[] | undefined,
  matches: (t: T) => boolean,
): number {
  if (!tiers || tiers.length === 0) return 0;
  const eligible = tiers.filter(matches);
  if (eligible.length === 0) return 0;
  // Highest matching rate wins
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

export function optionsTotal(item: CartItem): number {
  return (item.selectedOptions ?? []).reduce((s, o) => s + (o.price || 0), 0);
}

export function lineTotal(item: CartItem): {
  gross: number;
  discount: number;
  net: number;
  deposit: number;
  optionsPerUnit: number;
  optionsTotal: number;
  qtyRate: number;
  durationRate: number;
} {
  const optsUnit = optionsTotal(item);
  const rentalGross = item.price_day * item.days * item.quantity;
  const optionsGross = optsUnit * item.quantity; // fixed, not per day
  const gross = rentalGross + optionsGross;
  const qtyRate = volumeDiscount(item.quantity, item.quantityDiscounts);
  const durationRate = durationDiscount(item.days, item.durationDiscounts);
  // Combine rates additively, capped at 50% to stay sane
  const combined = Math.min(0.5, qtyRate + durationRate);
  // Discount applies only on the rental part, not on fixed options
  const discount = rentalGross * combined;
  const net = gross - discount;
  const deposit = item.deposit * item.quantity;
  return {
    gross,
    discount,
    net,
    deposit,
    optionsPerUnit: optsUnit,
    optionsTotal: optionsGross,
    qtyRate,
    durationRate,
  };
}
