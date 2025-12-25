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
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Sepet</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{itemCount} ürün</div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Sepeti kapat"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-10">
              <div className="text-gray-900 dark:text-white font-semibold">Sepet boş</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Ürün ekleyince burada görünecek.</div>
              <Link
                href="/spare-parts"
                onClick={closeCart}
                className="mt-6 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
              >
                Ürünlere Git
              </Link>
            </div>
          )}

          {items.map((x) => (
            <div key={x.id} className="flex gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
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
                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{x.name}</div>
                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{formatPriceTry(x.priceCents)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(x.id)}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-800">
                    <button
                      type="button"
                      className="px-3 py-1 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-l-lg"
                      onClick={() => setQuantity(x.id, x.quantity - 1)}
                      aria-label="Azalt"
                    >
                      -
                    </button>
                    <div className="px-3 py-1 text-sm font-semibold text-gray-900 dark:text-white min-w-10 text-center">
                      {x.quantity}
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg"
                      onClick={() => setQuantity(x.id, x.quantity + 1)}
                      aria-label="Arttır"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPriceTry(x.priceCents * x.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">Ara Toplam</div>
            <div className="text-base font-bold text-gray-900 dark:text-white">{subtotal}</div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/cart"
              onClick={closeCart}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
            >
              Sepete Git
            </Link>
            <button
              type="button"
              onClick={clear}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Temizle
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ödeme akışını sonraki adımda bağlayacağız.
          </div>
        </div>
      </aside>
    </div>
  );
}
