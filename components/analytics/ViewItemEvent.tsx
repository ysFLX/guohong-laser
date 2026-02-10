'use client';

import { useEffect } from 'react';

import { trackEvent } from '@/lib/analytics';

type Props = {
  id: string;
  name: string;
  priceCents: number;
  currency?: string;
};

export default function ViewItemEvent({ id, name, priceCents, currency = 'TRY' }: Props) {
  useEffect(() => {
    trackEvent('view_item', {
      currency,
      value: priceCents / 100,
      items: [
        {
          item_id: id,
          item_name: name,
          price: priceCents / 100,
          quantity: 1,
        },
      ],
    });
  }, [currency, id, name, priceCents]);

  return null;
}

