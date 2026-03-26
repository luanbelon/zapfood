"use client";

import type { ProductRecord } from "@/lib/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (p: ProductRecord, qty?: number) => void;
  inc: (productId: string) => void;
  remove: (productId: string) => void;
  dec: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE = "zapfood-cart";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((p: ProductRecord, qty = 1) => {
    const effectivePrice = p.promoActive && p.promoPrice ? p.promoPrice : p.price;
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === p.id);
      if (i === -1) {
        return [
          ...prev,
          {
            productId: p.id,
            name: p.name,
            price: effectivePrice,
            originalPrice: p.promoActive ? p.price : null,
            image: p.image,
            qty,
          },
        ];
      }
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
  }, []);

  const inc = useCallback((productId: string) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === productId);
      if (i === -1) return prev;
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + 1 };
      return next;
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const dec = useCallback((productId: string) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === productId);
      if (i === -1) return prev;
      const q = prev[i].qty - 1;
      if (q <= 0) return prev.filter((x) => x.productId !== productId);
      const next = [...prev];
      next[i] = { ...next[i], qty: q };
      return next;
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((x) => x.productId !== productId));
      return;
    }
    setItems((prev) => {
      const i = prev.findIndex((x) => x.productId === productId);
      if (i === -1) return prev;
      const next = [...prev];
      next[i] = { ...next[i], qty };
      return next;
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { total, count } = useMemo(() => {
    const total = items.reduce((s, x) => s + x.price * x.qty, 0);
    const count = items.reduce((s, x) => s + x.qty, 0);
    return { total, count };
  }, [items]);

  const value = useMemo(
    () => ({ items, add, inc, remove, dec, setQty, clear, total, count }),
    [items, add, inc, remove, dec, setQty, clear, total, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
