'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import QuickBuyButton from '@/components/cart/QuickBuyButton';
import { useToast } from '@/components/ui/ToastProvider';
import { buildSparePartVariantName } from '@/lib/sparePartSizeOptions';
import { getMinimumSaleQuantity } from '@/lib/minimumSaleQuantity';

function formatPrice(priceCents: number, currency: string) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(currency === 'USD' ? 2 : 2)} ${currency}`;
  }
}

type Props = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  inStock: boolean;
  isCritical: boolean;
  stockOnHand: number;
  showPrice: boolean;
  sparePartDirectPurchaseEnabled: boolean;
  sizeOptionEntries: Array<{ value: string; priceCents: number; priceCurrency: string; imageUrl: string | null }>;
  selectedSize?: string;
  onSelectedSizeChange?: (value: string) => void;
};

export default function SparePartPurchaseClient({
  id,
  name,
  priceCents,
  imageUrl,
  inStock,
  isCritical,
  stockOnHand,
  showPrice,
  sparePartDirectPurchaseEnabled,
  sizeOptionEntries,
  selectedSize: controlledSelectedSize,
  onSelectedSizeChange,
}: Props) {
  const { show } = useToast();
  const lowStockToastShown = useRef(false);
  const hasSizeOptions = sizeOptionEntries.length > 0;
  const [uncontrolledSelectedSize, setUncontrolledSelectedSize] = useState<string>(sizeOptionEntries[0]?.value ?? '');
  const selectedSize = controlledSelectedSize ?? uncontrolledSelectedSize;

  const resolvedSize = hasSizeOptions ? selectedSize : '';
  const selectedEntry = useMemo(
    () => sizeOptionEntries.find((entry) => entry.value === resolvedSize) ?? null,
    [resolvedSize, sizeOptionEntries],
  );
  const resolvedPriceCents = selectedEntry?.priceCents ?? priceCents;
  const resolvedPriceCurrency = selectedEntry?.priceCurrency ?? 'TRY';
  const resolvedImageUrl = selectedEntry?.imageUrl ?? imageUrl;
  const displayName = useMemo(() => buildSparePartVariantName(name, resolvedSize), [name, resolvedSize]);
  const selectionDisabled = hasSizeOptions && !resolvedSize;
  const canQuickBuy = showPrice && sparePartDirectPurchaseEnabled;
  const canAddToCart = inStock;
  const minimumQuantity = getMinimumSaleQuantity(resolvedPriceCents);
  const showMinimumQuantityNote = minimumQuantity > 1;

  const handleSizeChange = (value: string) => {
    if (onSelectedSizeChange) {
      onSelectedSizeChange(value);
      return;
    }
    setUncontrolledSelectedSize(value);
  };

  useEffect(() => {
    if (!isCritical || lowStockToastShown.current) return;

    lowStockToastShown.current = true;
    show(`Stok hizla azalıyor: ${name} icin son ${stockOnHand} adet`, undefined, 'error');
  }, [isCritical, name, show, stockOnHand]);

  const selector = hasSizeOptions ? (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Ölçü sec
      </label>
      <select
        value={resolvedSize}
        onChange={(event) => handleSizeChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400"
      >
        <option value="" disabled>
          Ölçü seciniz
        </option>
        {sizeOptionEntries.map((entry) => (
          <option key={entry.value} value={entry.value}>
            {entry.value}
          </option>
        ))}
      </select>
    </div>
  ) : null;

  const actionButtons = (
    <div className="mt-4 flex flex-col gap-3">
      {canQuickBuy && (
        <QuickBuyButton
          item={{
            id,
            name: displayName,
            priceCents: resolvedPriceCents,
            imageUrl: resolvedImageUrl,
            variantValue: resolvedSize || null,
          }}
          disabled={selectionDisabled}
        />
      )}
      {canAddToCart ? (
        <AddToCartButton
          id={id}
          name={name}
          priceCents={resolvedPriceCents}
          imageUrl={resolvedImageUrl}
          variantValue={resolvedSize || null}
          className="inline-flex items-center justify-center rounded-xl bg-[#f59e0b] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#e58d07] disabled:cursor-not-allowed disabled:opacity-60"
          quantity={1}
          disabled={selectionDisabled}
        />
      ) : (
        <div className="grid gap-2">
          <Link
            href={
              inStock
                ? `/quote?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`
                : `/stock-request?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`
            }
            className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 hover:border-amber-300"
          >
            {inStock ? 'Fiyat teklifi iste' : 'Stok gelince haber ver'}
          </Link>
        </div>
      )}
      <Link
        href="/cart"
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Sepete git
      </Link>
    </div>
  );

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Hizli ozet
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {showPrice ? formatPrice(resolvedPriceCents, resolvedPriceCurrency) : 'Fiyat icin teklif al'}
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inStock ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
            {inStock ? 'Stokta' : 'Stokta yok'}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="rounded-xl border border-[#15327f]/15 bg-[#15327f]/10 px-3 py-2 text-[#15327f]">
            Teslim: {inStock ? '2-3 gun' : '7-10 gun'}
          </div>
          <div className="rounded-xl border border-[#15327f]/15 bg-[#15327f]/10 px-3 py-2 text-[#15327f]">
            Garanti: Resmi servis
          </div>
        </div>
        {selector}
      </div>

      <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:block">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Satin alma
        </div>
        <div className="mt-2 text-3xl font-semibold text-slate-900">
          {showPrice ? formatPrice(resolvedPriceCents, resolvedPriceCurrency) : 'Fiyat icin teklif al'}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
          <span className={`rounded-full px-3 py-1 ${inStock ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
            {inStock ? 'Stokta' : 'Siparisle'}
          </span>
          <span className="rounded-full border border-[#15327f]/15 bg-[#15327f]/10 px-3 py-1 text-[#15327f]">
            {inStock ? '2-3 gun teslim' : '7-10 gun teslim'}
          </span>
          {isCritical ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-3 py-1 text-amber-900">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
              </span>
              Stok azaliyor
            </span>
          ) : null}
        </div>
        {showMinimumQuantityNote ? (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Bu üründen minimum alabileceğiniz miktar {minimumQuantity}. Sepete eklerken bu kural otomatik uygulanır.
          </div>
        ) : null}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Gönderen</span>
            <span className="font-semibold text-slate-900">Guohong Lazer</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Garanti</span>
            <span className="font-semibold text-slate-900">Resmi servis</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Iade</span>
            <span className="font-semibold text-slate-900">14 gun</span>
          </div>
        </div>
        {selector}
        {actionButtons}
        <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <ul className="space-y-2">
            <li>Guvenli odeme</li>
            <li>Fatura destekli satis</li>
            <li>Teknik destek hattı</li>
          </ul>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-3">
          {hasSizeOptions ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Ölçü sec
              </label>
              <select
                value={resolvedSize}
                onChange={(event) => handleSizeChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400"
              >
                <option value="" disabled>
                  Ölçü seciniz
                </option>
                {sizeOptionEntries.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.value}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                {inStock ? 'Toplam' : 'Stok durumu'}
              </div>
              <div className="mt-1 text-base font-semibold text-slate-900">
                {inStock ? formatPrice(resolvedPriceCents, resolvedPriceCurrency) : 'Stokta yok'}
              </div>
            </div>

            {inStock ? (
              <div
                className={`ml-auto grid w-full max-w-[360px] gap-2 ${
                  canQuickBuy ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                <AddToCartButton
                  id={id}
                  name={name}
                  priceCents={resolvedPriceCents}
                  imageUrl={resolvedImageUrl}
                  variantValue={resolvedSize || null}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  quantity={1}
                  disabled={selectionDisabled}
                />
                {canQuickBuy ? (
                  <QuickBuyButton
                    item={{
                      id,
                      name: displayName,
                      priceCents: resolvedPriceCents,
                      imageUrl: resolvedImageUrl,
                      variantValue: resolvedSize || null,
                    }}
                    disabled={selectionDisabled}
                  />
                ) : null}
              </div>
            ) : (
              <div className="ml-auto w-full max-w-[360px]">
                <Link
                  href={
                    inStock
                      ? `/quote?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`
                      : `/stock-request?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`
                  }
                  className="inline-flex w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:border-amber-300"
                >
                  {inStock ? 'Fiyat teklifi iste' : 'Stok gelince haber ver'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


