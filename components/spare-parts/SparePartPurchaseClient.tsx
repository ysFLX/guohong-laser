'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import { useToast } from '@/components/ui/ToastProvider';
import { getMinimumSaleQuantity } from '@/lib/minimumSaleQuantity';
import { buildSparePartVariantName } from '@/lib/sparePartSizeOptions';
import { VAT_PERCENTAGE, calculateGrossCents, calculateVatCents } from '@/lib/vat';

function formatPrice(priceCents: number, currency: string) {
  const amount = currency === 'TRY' ? Math.floor(priceCents / 100) : priceCents / 100;

  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
  } catch {
    return `${amount.toFixed(currency === 'USD' ? 2 : 0)} ${currency}`;
  }
}

type Props = {
  id: string;
  name: string;
  description: string;
  categoryName: string;
  dimensions: string | null;
  priceCents: number;
  imageUrl: string | null;
  inStock: boolean;
  isCritical: boolean;
  stockOnHand: number;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  showPrice: boolean;
  sizeOptionEntries: Array<{ value: string; priceCents: number; priceCurrency: string; imageUrl: string | null }>;
  selectedSize?: string;
  onSelectedSizeChange?: (value: string) => void;
};

export default function SparePartPurchaseClient({
  id,
  name,
  description,
  categoryName,
  dimensions,
  priceCents,
  imageUrl,
  inStock,
  isCritical,
  stockOnHand,
  isFeatured,
  ratingAverage,
  ratingCount,
  showPrice,
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
  const minimumQuantity = getMinimumSaleQuantity(resolvedPriceCents);
  const showMinimumQuantityNote = minimumQuantity > 1;
  const vatCents = calculateVatCents(resolvedPriceCents);
  const grossPriceCents = calculateGrossCents(resolvedPriceCents);
  const minimumGrossTotalCents = grossPriceCents * minimumQuantity;

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

  const optionButtons = hasSizeOptions ? (
    <div className="border-t border-slate-200 pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-slate-950">Ölçü seçimi</div>
        <div className="text-xs font-semibold text-slate-500">{sizeOptionEntries.length} seçenek</div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sizeOptionEntries.map((entry) => {
          const active = entry.value === resolvedSize;
          return (
            <button
              key={entry.value}
              type="button"
              onClick={() => handleSizeChange(entry.value)}
              className={`min-h-12 rounded-xl border px-3 py-2 text-center text-sm font-bold transition ${
                active
                  ? 'border-[#ff6a0d] bg-orange-50 text-[#d95508] shadow-[0_10px_24px_-20px_rgba(249,115,22,0.8)]'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {entry.value}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  const priceBlock = showPrice ? (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Fiyat</div>
      <div className="mt-2 text-4xl font-extrabold tracking-tight text-[#ff6a0d] sm:text-5xl">
        {formatPrice(grossPriceCents, resolvedPriceCurrency)}
      </div>
      <div className="mt-2 text-sm font-bold text-emerald-700">KDV dahil satış fiyatı</div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">KDV hariç</div>
          <div className="mt-1 text-sm font-bold text-slate-950">{formatPrice(resolvedPriceCents, resolvedPriceCurrency)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="font-semibold uppercase tracking-[0.16em] text-slate-400">{`KDV (%${VAT_PERCENTAGE})`}</div>
          <div className="mt-1 text-sm font-bold text-slate-950">{formatPrice(vatCents, resolvedPriceCurrency)}</div>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Fiyat</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Teklif al</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">Bu ürün için fiyat ve uyumluluk bilgisini teknik ekip netleştirir.</p>
    </div>
  );

  return (
    <>
      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">{categoryName}</span>
            {dimensions ? <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">{dimensions}</span> : null}
            <span
              className={`rounded-lg px-3 py-1.5 ${
                inStock ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              }`}
            >
              {inStock ? `Stok: ${stockOnHand}` : 'Stokta yok'}
            </span>
            {isFeatured ? <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700 ring-1 ring-indigo-200">Vitrin ürün</span> : null}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{name}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          </div>

          {ratingCount > 0 ? (
            <Link href="#reviews" className="inline-flex text-sm font-semibold text-indigo-700 hover:text-indigo-800">
              {ratingAverage.toFixed(1)} puan, {ratingCount} yorum
            </Link>
          ) : null}
        </div>

        <div className="space-y-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          {priceBlock}
          {optionButtons}

          {showMinimumQuantityNote ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Minimum {minimumQuantity} adet sepete eklenir.
              {showPrice ? (
                <span className="font-bold"> Minimum tutar: {formatPrice(minimumGrossTotalCents, resolvedPriceCurrency)} KDV dahil.</span>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-3">
            {inStock ? (
              <AddToCartButton
                id={id}
                name={name}
                priceCents={resolvedPriceCents}
                imageUrl={resolvedImageUrl}
                variantValue={resolvedSize || null}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[#ff6a0d] px-5 py-3 text-base font-extrabold text-white shadow-[0_16px_34px_-20px_rgba(249,115,22,0.9)] transition hover:bg-[#e85f0c] disabled:cursor-not-allowed disabled:opacity-60"
                quantity={1}
                disabled={selectionDisabled}
              />
            ) : (
              <Link
                href={`/stock-request?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`}
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-base font-bold text-amber-800 hover:border-amber-300"
              >
                Stok gelince haber ver
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Teslimat</div>
            <div className="mt-1 font-bold text-slate-950">{inStock ? '2-3 gün içinde sevk' : '7-10 gün planlı teslim'}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Garanti</div>
            <div className="mt-1 font-bold text-slate-950">Resmi servis</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Satıcı</div>
            <div className="mt-1 font-bold text-slate-950">Guohong Lazer</div>
          </div>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Fiyat</div>
            <div className="mt-0.5 text-base font-extrabold text-[#ff6a0d]">
              {showPrice ? formatPrice(grossPriceCents, resolvedPriceCurrency) : 'Teklif al'}
            </div>
            {showPrice ? <div className="text-[11px] font-bold text-emerald-700">KDV dahil</div> : null}
          </div>

          {inStock ? (
            <AddToCartButton
              id={id}
              name={name}
              priceCents={resolvedPriceCents}
              imageUrl={resolvedImageUrl}
              variantValue={resolvedSize || null}
              className="ml-auto inline-flex min-h-12 min-w-[160px] items-center justify-center rounded-xl bg-[#ff6a0d] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#e85f0c] disabled:cursor-not-allowed disabled:opacity-60"
              quantity={1}
              disabled={selectionDisabled}
            />
          ) : (
            <Link
              href={`/stock-request?product=${encodeURIComponent(displayName)}&id=${encodeURIComponent(id)}`}
              className="ml-auto inline-flex min-h-12 min-w-[180px] items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800"
            >
              Haber ver
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
