'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '@/components/ui/ToastProvider';
import { trackEvent } from '@/lib/analytics';
import { normalizeSaleQuantity } from '@/lib/minimumSaleQuantity';
import { buildSparePartCartLineId, buildSparePartVariantName } from '@/lib/sparePartSizeOptions';
import { calculateGrossCents } from '@/lib/vat';
import { useCart } from './CartProvider';

type Props = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  className?: string;
  quantity?: number;
  disabled?: boolean;
  variantValue?: string | null;
};

export default function AddToCartButton({
  id,
  name,
  priceCents,
  imageUrl,
  className,
  quantity = 1,
  disabled = false,
  variantValue = null,
}: Props) {
  const { addItem } = useCart();
  const { show, dismiss } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const isDisabled = disabled || isAdding;
  const lineId = buildSparePartCartLineId(id, variantValue);
  const displayName = buildSparePartVariantName(name, variantValue);
  const effectiveQuantity = normalizeSaleQuantity(quantity, priceCents);
  const grossPriceCents = calculateGrossCents(priceCents);

  return (
    <button
      type="button"
      onClick={() => {
        setIsAdding(true);
        addItem({ id, name, priceCents, imageUrl, variantValue }, effectiveQuantity);
        trackEvent('add_to_cart', {
          currency: 'TRY',
          value: (grossPriceCents * effectiveQuantity) / 100,
          items: [
            {
              item_id: lineId,
              item_name: displayName,
              price: grossPriceCents / 100,
              quantity: effectiveQuantity,
            },
          ],
        });

        let toastId = '';
        toastId = show('Sepetinize eklendi', [
          {
            label: 'Adres secmeye devam et',
            onClick: () => {
              dismiss(toastId);
              trackEvent('begin_checkout', {
                currency: 'TRY',
                value: (grossPriceCents * effectiveQuantity) / 100,
                items: [
                  {
                    item_id: lineId,
                    item_name: displayName,
                    price: grossPriceCents / 100,
                    quantity: effectiveQuantity,
                  },
                ],
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
            label: 'Alisverise devam et',
            onClick: () => {
              dismiss(toastId);
            },
          },
        ]);

        window.setTimeout(() => setIsAdding(false), 350);
      }}
      disabled={isDisabled}
      className={
        className ||
        'inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60'
      }
    >
      {isAdding ? 'Ekleniyor...' : 'Sepete Ekle'}
    </button>
  );
}
