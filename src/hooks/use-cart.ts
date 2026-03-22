"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";

type LocalCartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  unit: string;
  slug: string;
  stock: number;
};

const CART_PREFIX = "mvm-cart";

// --- Shared external store ---
let listeners: (() => void)[] = [];
let cartSnapshot: LocalCartItem[] = [];
let activeCartKey = `${CART_PREFIX}-guest`;

function getCartKey(userId?: string | null) {
  return userId ? `${CART_PREFIX}-${userId}` : `${CART_PREFIX}-guest`;
}

function getCartFromStorage(key?: string): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key || activeCartKey) || "[]");
  } catch {
    return [];
  }
}

function emitChange() {
  cartSnapshot = getCartFromStorage(activeCartKey);
  listeners.forEach((l) => l());
}

function switchCartKey(newKey: string) {
  if (newKey === activeCartKey) return;
  activeCartKey = newKey;
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return cartSnapshot;
}

function getServerSnapshot() {
  return [] as LocalCartItem[];
}

// Initialize
if (typeof window !== "undefined") {
  cartSnapshot = getCartFromStorage(activeCartKey);
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith(CART_PREFIX)) emitChange();
  });
}

function saveCart(items: LocalCartItem[]) {
  localStorage.setItem(activeCartKey, JSON.stringify(items));
  emitChange();
}

export function useLocalCart() {
  const { data: session } = useSession();

  // Switch cart key when user changes (login/logout)
  const userCartKey = getCartKey(session?.user?.id);
  if (userCartKey !== activeCartKey) {
    switchCartKey(userCartKey);
  }

  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: Omit<LocalCartItem, "quantity">, quantity = 1) => {
    const current = getCartFromStorage();
    const existing = current.find((i) => i.productId === item.productId);
    let next: LocalCartItem[];
    if (existing) {
      next = current.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
          : i
      );
    } else {
      next = [...current, { ...item, quantity }];
    }
    saveCart(next);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const current = getCartFromStorage();
    const next = quantity <= 0
      ? current.filter((i) => i.productId !== productId)
      : current.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    saveCart(next);
  }, []);

  const removeItem = useCallback((productId: string) => {
    const current = getCartFromStorage();
    saveCart(current.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isLoaded = typeof window !== "undefined";

  return { items, isLoaded, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal };
}
