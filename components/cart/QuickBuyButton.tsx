'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trackEvent } from '@/lib/analytics';

type QuickBuyItem = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
};

export default function QuickBuyButton({ item }: { item: QuickBuyItem }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  const handleQuickBuy = async () => {
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const profileRes = await fetch('/api/profile');
      if (profileRes.status === 401) {
        router.push('/login');
        return;
      }
      const profile = await profileRes.json();
      const addresses = (profile.user?.addresses || []) as Array<{ id: string; isDefault: boolean }>;
      const selected = addresses.find((addr) => addr.isDefault) ?? addresses[0];

      if (!selected?.id) {
        setError('');
        setShowPrompt(true);
        return;
      }

      trackEvent('begin_checkout', {
        currency: 'TRY',
        value: item.priceCents / 100,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            price: item.priceCents / 100,
            quantity: 1,
          },
        ],
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selected.id,
          billingAddressId: selected.id,
          items: [
            {
              id: item.id,
              name: item.name,
              priceCents: item.priceCents,
              quantity: 1,
              imageUrl: item.imageUrl,
            },
          ],
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Odeme baslatilamadi');
      }

      window.location.href = data.url as string;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Odeme baslatilamadi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-70"
        onClick={handleQuickBuy}
        disabled={isLoading}
      >
        <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          {isLoading ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
              <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 7h11v10H4zM15 10h4l3 3v4h-7z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        {isLoading ? 'Hizli odeme hazirlaniyor...' : 'Hizli Al'}
      </button>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Hizli Al icin adres gerekli
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Kayitli adresin yoksa hizli odeme baslatilamaz. Simdi adres ekleyelim mi?
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300 dark:border-gray-800 dark:text-gray-300"
              >
                Vazgec
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrompt(false);
                  router.push('/checkout/address');
                }}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
              >
                Adres ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
