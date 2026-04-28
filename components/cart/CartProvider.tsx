'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { useSession } from 'next-auth/react';
import { buildSparePartCartLineId, buildSparePartVariantName } from '@/lib/sparePartSizeOptions';
import { normalizeSaleQuantity } from '@/lib/minimumSaleQuantity';
import { calculateVatTotals } from '@/lib/vat';

type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
  variantValue?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  replaceItems: (items: CartItem[]) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY_PREFIX = 'laser-market:cart';
const CART_EVENT_NAME = 'laser-market:cart:change';

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
        quantity: normalizeSaleQuantity(typeof x.quantity === 'number' ? x.quantity : 1, x.priceCents as number),
        variantValue: typeof x.variantValue === 'string' ? x.variantValue : null,
      }));
  } catch {
    return [];
  }
}

function emitCartChange(storageKey: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CART_EVENT_NAME, { detail: { key: storageKey } }));
}

function subscribeToCart(storageKey: string, callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const onCustom = (event: Event) => {
    const e = event as CustomEvent<{ key?: string }>;
    if (e.detail?.key === storageKey) {
      callback();
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      callback();
    }
  };

  window.addEventListener(CART_EVENT_NAME, onCustom);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(CART_EVENT_NAME, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

function readCart(storageKey: string) {
  if (typeof window === 'undefined') return [];
  return safeParseCart(window.localStorage.getItem(storageKey));
}

function readCartRaw(storageKey: string) {
  if (typeof window === 'undefined') return '[]';
  return window.localStorage.getItem(storageKey) ?? '[]';
}

function writeCart(storageKey: string, items: CartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(items));
  emitCartChange(storageKey);
}

function useCartItems(storageKey: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToCart(storageKey, onStoreChange),
    [storageKey],
  );
  const raw = useSyncExternalStore(subscribe, () => readCartRaw(storageKey), () => '[]');
  return useMemo(() => safeParseCart(raw), [raw]);
}

function mergeCartItems(base: CartItem[], incoming: CartItem[]) {
  if (incoming.length === 0) return base;

  const merged = [...base];
  const indexById = new Map<string, number>();
  merged.forEach((item, index) => indexById.set(item.id, index));

  for (const item of incoming) {
    const existingIndex = indexById.get(item.id);
    if (existingIndex === undefined) {
      merged.push({ ...item, quantity: normalizeSaleQuantity(item.quantity, item.priceCents) });
      indexById.set(item.id, merged.length - 1);
      continue;
    }

    const existing = merged[existingIndex];
    merged[existingIndex] = {
      ...existing,
      quantity: normalizeSaleQuantity(existing.quantity + item.quantity, existing.priceCents),
    };
  }

  return merged;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const storageKey = useMemo(() => `${STORAGE_KEY_PREFIX}:${userId ?? 'guest'}`, [userId]);
  const items = useCartItems(storageKey);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const guestKey = `${STORAGE_KEY_PREFIX}:guest`;
    const guestItems = readCart(guestKey);
    if (guestItems.length === 0) return;

    const merged = mergeCartItems(readCart(storageKey), guestItems);
    writeCart(storageKey, merged);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(guestKey);
    }
    emitCartChange(guestKey);
  }, [storageKey, userId]);

  const updateItems = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      const next = updater(readCart(storageKey));
      writeCart(storageKey, next);
    },
    [storageKey],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((x) => !x), []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      const q = normalizeSaleQuantity(quantity, item.priceCents);
      const variantValue = typeof item.variantValue === 'string' ? item.variantValue.trim() : '';
      const lineId = buildSparePartCartLineId(item.id, variantValue);
      const lineName = buildSparePartVariantName(item.name, variantValue);

      updateItems((prev) => {
        const existing = prev.find((x) => x.id === lineId);
        if (existing) {
          return prev.map((x) =>
            x.id === lineId
              ? {
                  ...x,
                  name: lineName,
                  variantValue: variantValue || null,
                  quantity: normalizeSaleQuantity(x.quantity + q, x.priceCents),
                }
              : x,
          );
        }
        return [
          ...prev,
          {
            ...item,
            id: lineId,
            name: lineName,
            quantity: q,
            variantValue: variantValue || null,
          },
        ];
      });
    },
    [updateItems],
  );

  const replaceItems = useCallback(
    (nextItems: CartItem[]) => {
      writeCart(storageKey, nextItems.map((item) => ({
        ...item,
        quantity: normalizeSaleQuantity(item.quantity, item.priceCents),
        imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
        variantValue: typeof item.variantValue === 'string' ? item.variantValue : null,
      })));
    },
    [storageKey],
  );

  const removeItem = useCallback(
    (id: string) => {
      updateItems((prev) => prev.filter((x) => x.id !== id));
    },
    [updateItems],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      updateItems((prev) => prev.map((x) => (x.id === id ? { ...x, quantity: normalizeSaleQuantity(quantity, x.priceCents) } : x)));
    },
    [updateItems],
  );

  const clear = useCallback(() => {
    updateItems(() => []);
  }, [updateItems]);

  const itemCount = useMemo(() => items.reduce((sum, x) => sum + x.quantity, 0), [items]);
  const totals = useMemo(() => calculateVatTotals(items), [items]);

  const value: CartContextValue = useMemo(
    () => ({
      items,
      isOpen,
      itemCount,
      subtotalCents: totals.subtotalCents,
      vatCents: totals.vatCents,
      totalCents: totals.totalCents,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      replaceItems,
      removeItem,
      setQuantity,
      clear,
    }),
    [items, isOpen, itemCount, totals, openCart, closeCart, toggleCart, addItem, replaceItems, removeItem, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
