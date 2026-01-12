'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
        setError('Hizli odeme icin kayitli adres gerekli.');
        router.push('/checkout/address');
        return;
      }

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
    </div>
  );
}
