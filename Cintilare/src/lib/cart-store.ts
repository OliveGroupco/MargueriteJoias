import { useSyncExternalStore } from "react";
import type { Product } from "./products";

export type CartItem = { product: Product; qty: number };

const KEY = "cintilare:cart";
let items: CartItem[] = load();
const listeners = new Set<() => void>();

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}
function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const cart = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    return items;
  },
  add(product: Product, qty = 1) {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else items = [...items, { product, qty }];
    items = [...items];
    emit();
  },
  remove(id: string) {
    items = items.filter((i) => i.product.id !== id);
    emit();
  },
  setQty(id: string, qty: number) {
    items = items
      .map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i))
      .filter((i) => i.qty > 0);
    emit();
  },
  clear() {
    items = [];
    emit();
  },
};

export function useCart() {
  const snap = useSyncExternalStore(
    cart.subscribe,
    () => items,
    () => [],
  );
  const count = snap.reduce((n, i) => n + i.qty, 0);
  const subtotal = snap.reduce((n, i) => n + i.qty * i.product.price, 0);
  return { items: snap, count, subtotal };
}
