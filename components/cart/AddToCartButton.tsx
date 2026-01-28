'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

import { useCart } from './CartProvider';
import { useToast } from '@/components/ui/ToastProvider';
import { trackEvent } from '@/lib/analytics';

type Props = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  className?: string;
  quantity?: number;
  disabled?: boolean;
};

export default function AddToCartButton({
  id,
  name,
  priceCents,
  imageUrl,
  className,
  quantity = 1,
  disabled = false,
}: Props) {
  const { addItem } = useCart();
  const { show, dismiss } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isDisabled = disabled || isAdding || status === 'loading';

  return (
    <button
      type="button"
      onClick={() => {
        if (status === 'loading') {
          return;
        }
        if (status === 'unauthenticated') {
          router.push('/login');
          return;
        }
        if (!session?.user?.profileComplete) {
          const next = encodeURIComponent(pathname || '/');
          router.push(`/complete-profile?next=${next}`);
          return;
        }
        setIsAdding(true);
        addItem({ id, name, priceCents, imageUrl }, quantity);
        trackEvent('add_to_cart', {
          currency: 'TRY',
          value: (priceCents * quantity) / 100,
          items: [
            {
              item_id: id,
              item_name: name,
              price: priceCents / 100,
              quantity,
            },
          ],
        });
        let toastId = '';
        toastId = show('Sepetinize eklendi', [
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
        'inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60'
      }
    >
      {isAdding ? 'Ekleniyor...' : 'Sepete Ekle'}
    </button>
  );
}





