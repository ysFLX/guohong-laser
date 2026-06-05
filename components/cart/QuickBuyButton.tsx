'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trackEvent } from '@/lib/analytics';
import { isPaymentCheckoutEnabled } from '@/lib/checkoutMode';
import { normalizeSaleQuantity } from '@/lib/minimumSaleQuantity';
import { buildSparePartCartLineId } from '@/lib/sparePartSizeOptions';
import { calculateGrossCents } from '@/lib/vat';
import { useCart } from './CartProvider';

type QuickBuyItem = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  variantValue?: string | null;
};

function QuickBuyButtonEnabled({
  item,
  disabled = false,
  label = 'Hizli Al',
}: {
  item: QuickBuyItem;
  disabled?: boolean;
  label?: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const lineId = buildSparePartCartLineId(item.id, item.variantValue);
  const effectiveQuantity = normalizeSaleQuantity(1, item.priceCents);
  const grossPriceCents = calculateGrossCents(item.priceCents);

  const handleQuickBuy = () => {
    if (isLoading || disabled) return;
    setIsLoading(true);

    addItem(
      {
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
        imageUrl: item.imageUrl,
        variantValue: item.variantValue ?? null,
      },
      effectiveQuantity,
    );

    trackEvent('begin_checkout', {
      currency: 'TRY',
      value: (grossPriceCents * effectiveQuantity) / 100,
      items: [
        {
          item_id: lineId,
          item_name: item.name,
          price: grossPriceCents / 100,
          quantity: effectiveQuantity,
        },
      ],
    });

    router.push('/checkout/address');
  };

  return (
    <button
      type="button"
      className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold !text-white hover:bg-gray-800 disabled:opacity-70"
      onClick={handleQuickBuy}
      disabled={isLoading || disabled}
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
      <span className="text-inherit">{isLoading ? 'Yönlendiriliyor...' : label}</span>
    </button>
  );
}

export default function QuickBuyButton({
  item,
  disabled = false,
  label,
}: {
  item: QuickBuyItem;
  disabled?: boolean;
  label?: string;
}) {
  if (!isPaymentCheckoutEnabled()) {
    return null;
  }

  return <QuickBuyButtonEnabled item={item} disabled={disabled} label={label} />;
}
