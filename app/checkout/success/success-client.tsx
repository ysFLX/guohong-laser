'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { useCart } from '@/components/cart/CartProvider';
import { trackEvent } from '@/lib/analytics';

export default function CheckoutSuccessClient() {
  const { clear } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { status } = useSession();
  const trackedPurchase = useRef(false);

  useEffect(() => {
    if (status === 'loading') return;
    clear();
  }, [status, clear]);

  useEffect(() => {
    if (!sessionId) return;
    if (trackedPurchase.current) return;

    const storageKey = `laser-market:purchase:${sessionId}`;
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey) === '1') {
      trackedPurchase.current = true;
      return;
    }

    const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      try {
        await fetch(`/api/orders/sync?session_id=${encodeURIComponent(sessionId)}`, { method: 'POST' });
      } catch {
        // no-op
      }

      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const res = await fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`);
          if (res.status === 401 || res.status === 403) return;
          const data = (await res.json().catch(() => ({}))) as {
            order?: {
              id?: string;
              totalCents?: number;
              currency?: string;
              items?: Array<{
                sparePartId?: string | null;
                name?: string;
                quantity?: number;
                priceCents?: number;
              }>;
            };
          };

          if (!res.ok) throw new Error('order fetch failed');
          const order = data.order;
          if (!order?.id || typeof order.totalCents !== 'number' || !Array.isArray(order.items)) return;

          const analyticsItems = order.items
            .filter((item) => item && typeof item.name === 'string' && typeof item.priceCents === 'number')
            .map((item) => {
              const itemName = item.name as string;
              const itemId =
                typeof item.sparePartId === 'string' && item.sparePartId ? item.sparePartId : itemName;
              return {
                item_id: itemId,
                item_name: itemName,
                price: (item.priceCents as number) / 100,
                quantity: typeof item.quantity === 'number' ? item.quantity : 1,
              };
            });

          trackEvent('purchase', {
            transaction_id: order.id,
            currency: order.currency || 'TRY',
            value: order.totalCents / 100,
            items: analyticsItems,
          });

          trackedPurchase.current = true;
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(storageKey, '1');
          }
          return;
        } catch {
          await delay(350);
        }
      }
    };

    run();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">Ödeme başarılı</div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Siparişiniz alınmıştır. Detayları ´Siparişlerim´ sayfasından takip edebilirsiniz.
        </p>
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          İade veya değişim talebiniz olursa{' '}
          <Link href="/returns-request" className="font-semibold text-indigo-600 hover:text-indigo-700">
            iade formunu
          </Link>{' '}
          doldurabilirsiniz. Fatura/irsaliye talepleri için{' '}
          <Link href="/contact?subject=Fatura+Talebi" className="font-semibold text-indigo-600 hover:text-indigo-700">
            iletişim
          </Link>{' '}
          kurabilirsiniz.
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/profile/orders"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Siparişlerim
          </Link>
          <Link
            href="/spare-parts"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Alışverişe devam et
          </Link>
        </div>
      </div>
    </div>
  );
}
