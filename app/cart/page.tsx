﻿﻿'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCart } from '@/components/cart/CartProvider';

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

export default function CartPage() {
  const { items, subtotalCents, removeItem, setQuantity, clear } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Sepet</h1>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Sepeti Temizle
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
            <div className="text-gray-900 dark:text-white font-semibold">Sepet boş</div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Yedek parçalara gidip ürün ekleyebilirsin.</div>
            <Link
              href="/spare-parts"
              className="mt-6 inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
            >
              Yedek Parçalar
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2 space-y-4">
              {items.map((x) => (
                <div
                  key={x.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex gap-4"
                >
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
                    <Image
                      src={x.imageUrl || '/images/1.jpg'}
                      alt={x.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="lazy"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">{x.name}</div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{formatPriceTry(x.priceCents)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(x.id)}
                        className="text-sm font-semibold text-red-600 hover:underline"
                      >
                        Sil
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          className="px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 rounded-l-xl"
                          onClick={() => setQuantity(x.id, x.quantity - 1)}
                        >
                          -
                        </button>
                        <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white min-w-12 text-center">
                          {x.quantity}
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 rounded-r-xl"
                          onClick={() => setQuantity(x.id, x.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {formatPriceTry(x.priceCents * x.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-fit">
              <div className="text-lg font-bold text-gray-900 dark:text-white">Özet</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">Ara Toplam</div>
                <div className="text-base font-bold text-gray-900 dark:text-white">{formatPriceTry(subtotalCents)}</div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => {
                    // Checkout sonraki adım
                    window.alert('Ödeme akışını sonraki adımda bağlayacağız.');
                  }}
                >
                  Satın Almaya Devam Et
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Bu ekran MVP. Ödeme, sipariş ve stok düşümü sonraki adım.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



