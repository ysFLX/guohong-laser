'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import QuickBuyButton from '@/components/cart/QuickBuyButton';
import { useToast } from '@/components/ui/ToastProvider';
import { getMinimumSaleQuantity } from '@/lib/minimumSaleQuantity';
import { buildSparePartVariantName } from '@/lib/sparePartSizeOptions';
import { VAT_PERCENTAGE, calculateGrossCents, calculateVatCents } from '@/lib/vat';

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
  const canQuickBuy = showPrice && sparePartDirectPurchaseEnabled && inStock;
  const canAddToCart = inStock;
  const minimumQuantity = getMinimumSaleQuantity(resolvedPriceCents);
  const showMinimumQuantityNote = minimumQuantity > 1;
  const vatCents = calculateVatCents(resolvedPriceCents);
  const grossPriceCents = calculateGrossCents(resolvedPriceCents);
  const minimumGrossTotalCents = grossPriceCents * minimumQuantity;
  const deliveryLabel = inStock ? '2-3 gün teslim' : '7-10 gün planlı teslim';

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
    show(`Stok hızla azalıyor: ${name} için son ${stockOnHand} adet`, undefined, 'error');
  }, [isCritical, name, show, stockOnHand]);

  const selector = hasSizeOptions ? (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Ölçü seç
        </label>
        <span className="text-xs font-semibold text-slate-500">{sizeOptionEntries.length} seçenek</span>
      </div>
      <select
        value={resolvedSize}
        onChange={(event) => handleSizeChange(event.target.value)}
        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      >
        <option value="" disabled>
          Ölçü seçiniz
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
    <div className="grid gap-3">
      {canAddToCart ? (
        <AddToCartButton
          id={id}
          name={name}
          priceCents={resolvedPriceCents}
          imageUrl={resolvedImageUrl}
          variantValue={resolvedSize || null}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ff6a0d] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_-18px_rgba(249,115,22,0.9)] transition hover:bg-[#e85f0c] disabled:cursor-not-allowed disabled:opacity-60"
          quantity={1}
          disabled={selectionDisabled}
        />
      ) : (
        <Link
          href={`/stock-request?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 hover:border-amber-300"
        >
          Stok gelince haber ver
        </Link>
      )}

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

      <Link
        href="/cart"
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Sepete git
      </Link>
    </div>
  );

  const priceBlock = showPrice ? (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Birim fiyat</div>
      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
        <div className="text-4xl font-bold tracking-tight text-slate-950">
          {formatPrice(grossPriceCents, resolvedPriceCurrency)}
        </div>
        <div className="pb-1 text-sm font-semibold text-emerald-700">KDV dahil</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">KDV hariç</div>
          <div className="mt-1 font-bold text-slate-900">{formatPrice(resolvedPriceCents, resolvedPriceCurrency)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {`KDV (%${VAT_PERCENTAGE})`}
          </div>
          <div className="mt-1 font-bold text-slate-900">{formatPrice(vatCents, resolvedPriceCurrency)}</div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Fiyat</div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Fiyat için teklif al</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">Bu ürün için teknik ekip fiyat ve uyumluluk bilgisini hızlıca netleştirir.</p>
    </>
  );

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Satın alma</div>
            <div className="mt-1 text-sm font-medium text-slate-600">{deliveryLabel}</div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              inStock ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            }`}
          >
            {inStock ? 'Stokta' : 'Stokta yok'}
          </span>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          {priceBlock}
        </div>
        {showMinimumQuantityNote ? (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Minimum {minimumQuantity} adet sepete eklenir.
            {showPrice ? ` Minimum tutar: ${formatPrice(minimumGrossTotalCents, resolvedPriceCurrency)} KDV dahil.` : ''}
          </div>
        ) : null}
        {selector ? <div className="mt-3">{selector}</div> : null}
      </div>

      <aside className="hidden h-fit overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_26px_80px_-46px_rgba(15,23,42,0.45)] lg:sticky lg:top-24 lg:block">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Satın alma</div>
              <div className="mt-2 text-sm font-medium text-slate-600">{deliveryLabel}</div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                inStock ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              }`}
            >
              {inStock ? 'Hazır sevk' : 'Ön sipariş'}
            </span>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]">
            {priceBlock}
          </div>

          {showMinimumQuantityNote ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Bu üründe minimum {minimumQuantity} adet uygulanır.
              {showPrice ? (
                <span className="font-semibold"> Minimum sepet tutarı: {formatPrice(minimumGrossTotalCents, resolvedPriceCurrency)} KDV dahil.</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 border-t border-slate-200 bg-slate-50/60 p-6">
          {selector}

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Hızlı bilgi</div>
            <div className="mt-3 divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-4 py-2">
                <span className="text-slate-500">Gönderen</span>
                <span className="font-semibold text-slate-950">Guohong Lazer</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-2">
                <span className="text-slate-500">Garanti</span>
                <span className="font-semibold text-slate-950">Resmi servis</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-2">
                <span className="text-slate-500">İade</span>
                <span className="font-semibold text-slate-950">14 gün</span>
              </div>
            </div>
          </div>

          {actionButtons}

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-600">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Güvenli alışveriş</div>
            <div className="mt-3 grid gap-2">
              <div>SSL korumalı ödeme</div>
              <div>Faturalı satış</div>
              <div>Teknik destek hattı</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-3">
          {hasSizeOptions ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Ölçü seç
              </label>
              <select
                value={resolvedSize}
                onChange={(event) => handleSizeChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-500"
              >
                <option value="" disabled>
                  Ölçü seçiniz
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
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {inStock ? 'Birim fiyat' : 'Stok durumu'}
              </div>
              <div className="mt-0.5 text-base font-bold text-slate-950">
                {inStock && showPrice ? formatPrice(grossPriceCents, resolvedPriceCurrency) : inStock ? 'Teklif al' : 'Stokta yok'}
              </div>
              {inStock && showPrice ? <div className="text-[11px] font-semibold text-emerald-700">KDV dahil</div> : null}
            </div>

            {inStock ? (
              <div className={`ml-auto grid w-full max-w-[360px] gap-2 ${canQuickBuy ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <AddToCartButton
                  id={id}
                  name={name}
                  priceCents={resolvedPriceCents}
                  imageUrl={resolvedImageUrl}
                  variantValue={resolvedSize || null}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#ff6a0d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e85f0c] disabled:cursor-not-allowed disabled:opacity-60"
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
                  href={`/stock-request?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:border-amber-300"
                >
                  Stok gelince haber ver
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
