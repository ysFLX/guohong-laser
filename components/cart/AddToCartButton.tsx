'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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
  const { items, addItem, setQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const isDisabled = disabled || isAdding;
  const lineId = buildSparePartCartLineId(id, variantValue);
  const displayName = buildSparePartVariantName(name, variantValue);
  const effectiveQuantity = normalizeSaleQuantity(quantity, priceCents);
  const grossPriceCents = calculateGrossCents(priceCents);
  const cartItem = useMemo(() => items.find((item) => item.id === lineId), [items, lineId]);
  const modalQuantity = cartItem?.quantity ?? effectiveQuantity;

  const updateModalQuantity = (nextQuantity: number) => {
    setQuantity(lineId, normalizeSaleQuantity(nextQuantity, priceCents));
  };

  const closeModal = () => setModalOpen(false);

  return (
    <>
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
          setModalOpen(true);
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

      {modalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-md">
          <button
            type="button"
            aria-label="Kapat"
            className="absolute inset-0 cursor-default"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/20 bg-white text-slate-950 shadow-2xl dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                    Sepet
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                    Ürününüz başarıyla sepete eklendi
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Modalı kapat"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                      Ürün
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-base font-semibold text-slate-950 dark:text-white">{displayName}</div>
                  <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Sepete eklenen adet: <span className="font-semibold text-slate-800 dark:text-slate-100">{modalQuantity}</span>
                  </div>
                  <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => updateModalQuantity(modalQuantity - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                      aria-label="Adeti azalt"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={modalQuantity}
                      onChange={(event) => updateModalQuantity(Number(event.target.value || 1))}
                      className="h-9 w-14 bg-transparent text-center text-sm font-semibold text-slate-950 outline-none dark:text-white"
                      aria-label="Sepet adedi"
                    />
                    <button
                      type="button"
                      onClick={() => updateModalQuantity(modalQuantity + 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                      aria-label="Adeti artır"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    trackEvent('begin_checkout', {
                      currency: 'TRY',
                      value: (grossPriceCents * modalQuantity) / 100,
                      items: [
                        {
                          item_id: lineId,
                          item_name: displayName,
                          price: grossPriceCents / 100,
                          quantity: modalQuantity,
                        },
                      ],
                    });
                    router.push('/checkout/address');
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Sepete git
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Alışverişe devam et
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
