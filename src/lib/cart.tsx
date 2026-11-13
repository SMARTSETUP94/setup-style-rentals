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

import {
  computeLine,
  DEFAULT_QUANTITY_DISCOUNTS,
  volumeDiscount,
  durationDiscount,
  type QuantityDiscountTier,
  type DurationDiscountTier,
  type LineResult,
} from "./pricing";

export { DEFAULT_QUANTITY_DISCOUNTS, volumeDiscount, durationDiscount };
export type { QuantityDiscountTier, DurationDiscountTier };

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
  /** True when the product has a 3D configurator that was not used (default configuration). */
  standardVersion?: boolean;
  /** Line kind — absent means "rental". */
  kind?: "rental" | "custom";
  /** Made-to-measure fields (kind === "custom"). */
  customRef?: string;
  customPiece?: string;
  customConfig?: Record<string, unknown>;
  customAlerts?: string[];
  customWeightKg?: number;
  customThumbnail?: string | null;
  /** Indicative public range shown at add time — display only, never a price. */
  customRange?: { low: number; high: number } | null;
}

export const isCustom = (i: Pick<CartItem, "kind">) => i.kind === "custom";

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
    const custom = r.kind === "custom";
    if (custom && (typeof r.customPiece !== "string" || !r.customPiece)) continue;
    out.push({
      ...(r as unknown as CartItem),
      kind: custom ? "custom" : (r.kind === "rental" ? "rental" : undefined),
      ...(custom
        ? {
            price_day: 0,
            deposit: 0,
            days: 1,
            customAlerts: Array.isArray(r.customAlerts) ? (r.customAlerts as unknown[]).filter((a): a is string => typeof a === "string") : [],
            customThumbnail: typeof r.customThumbnail === "string" ? r.customThumbnail : null,
            customRange:
              r.customRange && typeof r.customRange === "object" && Number.isFinite((r.customRange as { low?: unknown }).low) && Number.isFinite((r.customRange as { high?: unknown }).high)
                ? { low: Number((r.customRange as { low: number }).low), high: Number((r.customRange as { high: number }).high) }
                : null,
          }
        : {}),
      quantity: custom ? Math.min(50, Math.floor(q)) : Math.floor(q),
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
      // Quota exceeded: retry without the (heavy) custom thumbnails.
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(items.map((i) => (i.customThumbnail ? { ...i, customThumbnail: null } : i))),
        );
      } catch {
        // storage blocked — keep in-memory cart
      }
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
      // Custom-made lines never merge.
      if (item.kind === "custom") return [...prev, { ...item, lineId: item.lineId || newLineId() }];
      const key = lineKey(item);
      const existing = prev.find(
        (i) => !isCustom(i) && i.productId === item.productId && lineKey(i) === key,
      );
      if (existing) {
        return prev.map((i) =>
          !isCustom(i) && i.productId === item.productId && lineKey(i) === key
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

export function optionsTotal(item: CartItem): number {
  return (item.selectedOptions ?? []).reduce((s, o) => s + (o.price || 0), 0);
}

export function lineTotal(item: CartItem): LineResult {
  return computeLine({
    price_day: item.price_day,
    deposit: item.deposit,
    quantity: item.quantity,
    days: item.days,
    optionPrices: (item.selectedOptions ?? []).map((o) => o.price || 0),
    quantityDiscounts: item.quantityDiscounts,
    durationDiscounts: item.durationDiscounts,
  });
}
