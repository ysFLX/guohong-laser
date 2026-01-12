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
        {isLoading ? 'Hizli odeme hazirlaniyor...' : 'Hizli Al'}
      </button>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
}
