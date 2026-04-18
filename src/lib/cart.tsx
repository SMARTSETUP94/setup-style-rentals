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

export interface CartItem {
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
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  update: (productId: string, patch: Partial<CartItem>) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "setup-paris-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Two cart lines are considered the same only if same product AND same option selection
  const optionsKey = (opts?: SelectedOption[]) =>
    (opts ?? [])
      .map((o) => o.optionId)
      .sort()
      .join("|");

  const add = (item: CartItem) => {
    setItems((prev) => {
      const key = optionsKey(item.selectedOptions);
      const existing = prev.find(
        (i) => i.productId === item.productId && optionsKey(i.selectedOptions) === key,
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && optionsKey(i.selectedOptions) === key
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                days: item.days,
                startDate: item.startDate,
                endDate: item.endDate,
              }
            : i,
        );
      }
      return [...prev, item];
    });
  };

  const update = (productId: string, patch: Partial<CartItem>) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)));
  };

  const remove = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
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

/** Volume discount: 10% for 2-5, 15% for 6-10, 20% for 10+ */
export function volumeDiscount(qty: number): number {
  if (qty >= 10) return 0.2;
  if (qty >= 6) return 0.15;
  if (qty >= 2) return 0.1;
  return 0;
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
} {
  const optsUnit = optionsTotal(item);
  const rentalGross = item.price_day * item.days * item.quantity;
  const optionsGross = optsUnit * item.quantity; // fixed, not per day
  const gross = rentalGross + optionsGross;
  const discountRate = volumeDiscount(item.quantity);
  // Discount applies only on the rental part, not on fixed options
  const discount = rentalGross * discountRate;
  const net = gross - discount;
  const deposit = item.deposit * item.quantity;
  return {
    gross,
    discount,
    net,
    deposit,
    optionsPerUnit: optsUnit,
    optionsTotal: optionsGross,
  };
}
