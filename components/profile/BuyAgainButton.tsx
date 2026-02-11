'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCart } from '@/components/cart/CartProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { trackEvent } from '@/lib/analytics';

export type BuyAgainItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl: string | null;
};

type Props = {
  items: BuyAgainItem[];
  label?: string;
  className?: string;
};

export default function BuyAgainButton({ items, label = 'Tekrar satın al', className }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const { show, dismiss } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const normalizedItems = useMemo(
    () =>
      items
        .filter((item) => typeof item?.id === 'string' && item.id.trim().length > 0)
        .map((item) => ({
          id: item.id,
          name: item.name,
          priceCents: Number.isFinite(item.priceCents) ? item.priceCents : 0,
          quantity: Number.isFinite(item.quantity) ? item.quantity : 1,
          imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
        })),
    [items],
  );

  const isEmpty = normalizedItems.length === 0;
  const isDisabled = isAdding;

  const totalCents = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [normalizedItems],
  );

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (isEmpty) {
          show('Bu siparişte sepete eklenebilir ürün bulunamadı.', undefined, 'error');
          return;
        }

        setIsAdding(true);

        for (const item of normalizedItems) {
          addItem(
            {
              id: item.id,
              name: item.name,
              priceCents: item.priceCents,
              imageUrl: item.imageUrl,
            },
            item.quantity,
          );
        }

        trackEvent('add_to_cart', {
          currency: 'TRY',
          value: totalCents / 100,
          items: normalizedItems.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: item.priceCents / 100,
            quantity: item.quantity,
          })),
        });

        const kinds = normalizedItems.length;
        const units = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
        let toastId = '';
        toastId = show(`Sepete eklendi (${kinds} ürün, ${units} adet)`, [
          {
            label: 'Ödemeye geç',
            onClick: () => {
              dismiss(toastId);
              trackEvent('begin_checkout', {
                currency: 'TRY',
                value: totalCents / 100,
                items: normalizedItems.map((item) => ({
                  item_id: item.id,
                  item_name: item.name,
                  price: item.priceCents / 100,
                  quantity: item.quantity,
                })),
              });
              router.push('/checkout/address');
            },
          },
          {
            label: 'Sepete git',
            onClick: () => {
              dismiss(toastId);
              router.push('/cart');
            },
          },
          {
            label: 'Devam et',
            onClick: () => dismiss(toastId),
          },
        ]);

        window.setTimeout(() => setIsAdding(false), 350);
      }}
      className={
        `${className || 'inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'}${isEmpty ? ' cursor-not-allowed opacity-60' : ''}`
      }
    >
      {isAdding ? 'Ekleniyor...' : label}
    </button>
  );
}
