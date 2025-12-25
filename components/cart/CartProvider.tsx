'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotalCents: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'laser-market:cart:v1';

function clampQuantity(q: number) {
  if (!Number.isFinite(q)) return 1;
  return Math.max(1, Math.min(999, Math.floor(q)));
}

function safeParseCart(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => x as Partial<CartItem>)
      .filter((x) => typeof x.id === 'string' && typeof x.name === 'string' && typeof x.priceCents === 'number')
      .map((x) => ({
        id: x.id as string,
        name: x.name as string,
        priceCents: x.priceCents as number,
        imageUrl: typeof x.imageUrl === 'string' ? x.imageUrl : null,
        quantity: clampQuantity(typeof x.quantity === 'number' ? x.quantity : 1),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(() => {
    if (typeof window === 'undefined') return { items: [], isOpen: false };
    const items = safeParseCart(window.localStorage.getItem(STORAGE_KEY));
    return { items, isOpen: false };
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const openCart = useCallback(() => setState((s) => ({ ...s, isOpen: true })), []);
  const closeCart = useCallback(() => setState((s) => ({ ...s, isOpen: false })), []);
  const toggleCart = useCallback(() => setState((s) => ({ ...s, isOpen: !s.isOpen })), []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      const q = clampQuantity(quantity);
      setState((s) => {
        const existing = s.items.find((x) => x.id === item.id);
        const items = existing
          ? s.items.map((x) => (x.id === item.id ? { ...x, quantity: clampQuantity(x.quantity + q) } : x))
          : [...s.items, { ...item, quantity: q }];

        return { items, isOpen: true };
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setState((s) => ({ ...s, items: s.items.filter((x) => x.id !== id) }));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const q = clampQuantity(quantity);
    setState((s) => ({
      ...s,
      items: s.items.map((x) => (x.id === id ? { ...x, quantity: q } : x)),
    }));
  }, []);

  const clear = useCallback(() => {
    setState((s) => ({ ...s, items: [] }));
  }, []);

  const itemCount = useMemo(() => state.items.reduce((sum, x) => sum + x.quantity, 0), [state.items]);
  const subtotalCents = useMemo(() => state.items.reduce((sum, x) => sum + x.quantity * x.priceCents, 0), [state.items]);

  const value: CartContextValue = useMemo(
    () => ({
      items: state.items,
      isOpen: state.isOpen,
      itemCount,
      subtotalCents,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [state.items, state.isOpen, itemCount, subtotalCents, openCart, closeCart, toggleCart, addItem, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
