'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { useCart } from './CartProvider';

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

export default function CartDrawer() {
  const { isOpen, closeCart, items, itemCount, subtotalCents, removeItem, setQuantity, clear } = useCart();

  const subtotal = useMemo(() => formatPriceTry(subtotalCents), [subtotalCents]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur dark:bg-slate-950/95 shadow-[0_24px_80px_rgba(15,23,42,0.28)] border-l border-slate-200/70 dark:border-slate-800/70 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Sepet
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{itemCount} Ürün</div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
            aria-label="Sepeti kapat"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-10">
              <div className="text-slate-900 dark:text-white font-semibold">Sepet boş</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ürün ekleyince burada görünecek.</div>
              <Link
                href="/spare-parts"
                onClick={closeCart}
                className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Ürünlere Git
              </Link>
            </div>
          )}

          {items.map((x) => (
            <div
              key={x.id}
              className="flex gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40"
            >
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white shrink-0">
                <Image
                  src={x.imageUrl || '/images/1.jpg'}
                  alt={x.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  loading="lazy"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{x.name}</div>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formatPriceTry(x.priceCents)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(x.id)}
                    className="text-sm font-semibold text-rose-600 hover:underline"
                  >
                    Sil
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      className="px-3 py-1 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-l-xl"
                      onClick={() => setQuantity(x.id, x.quantity - 1)}
                      aria-label="Azalt"
                    >
                      -
                    </button>
                    <div className="px-3 py-1 text-sm font-semibold text-slate-900 dark:text-white min-w-10 text-center">
                      {x.quantity}
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-r-xl"
                      onClick={() => setQuantity(x.id, x.quantity + 1)}
                      aria-label="Arttır"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatPriceTry(x.priceCents * x.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200/70 dark:border-slate-800/70 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-300">Ara Toplam</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">{subtotal}</div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/cart"
              onClick={closeCart}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Sepete Git
            </Link>
            <button
              type="button"
              onClick={clear}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60"
            >
              Temizle
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
