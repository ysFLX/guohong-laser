'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { useCart } from '@/components/cart/CartProvider';

export default function CheckoutSuccessClient() {
  const { clear } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    clear();
  }, [status, clear]);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/orders/sync?session_id=${encodeURIComponent(sessionId)}`, { method: 'POST' }).catch(() => {});
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">Odeme basarili</div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Siparisin alinmistir. Detaylari "Siparislerim" sayfasindan takip edebilirsin.
        </p>
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Iade veya degisim talebin olursa{' '}
          <Link href="/returns-request" className="font-semibold text-indigo-600 hover:text-indigo-700">
            iade formunu
          </Link>{' '}
          doldurabilirsin. Fatura/irsaliye talepleri icin{' '}
          <Link href="/contact?subject=Fatura+Talebi" className="font-semibold text-indigo-600 hover:text-indigo-700">
            iletisim
          </Link>{' '}
          kurabilirsin.
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/profile/orders"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Siparislerim
          </Link>
          <Link
            href="/spare-parts"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Alisverise devam et
          </Link>
        </div>
      </div>
    </div>
  );
}


