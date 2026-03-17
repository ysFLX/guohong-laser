'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import AddToCartButton from '@/components/cart/AddToCartButton';
import QuickBuyButton from '@/components/cart/QuickBuyButton';
import { buildSparePartVariantName } from '@/lib/sparePartSizeOptions';

type Props = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  inStock: boolean;
  isCritical: boolean;
  showPrice: boolean;
  sparePartDirectPurchaseEnabled: boolean;
  sizeOptions: string[];
};

export default function SparePartPurchaseClient({
  id,
  name,
  priceCents,
  imageUrl,
  inStock,
  isCritical,
  showPrice,
  sparePartDirectPurchaseEnabled,
  sizeOptions,
}: Props) {
  const hasSizeOptions = sizeOptions.length > 0;
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] ?? '');

  const resolvedSize = hasSizeOptions ? selectedSize : '';
  const displayName = useMemo(() => buildSparePartVariantName(name, resolvedSize), [name, resolvedSize]);
  const selectionDisabled = hasSizeOptions && !resolvedSize;
  const canDirectPurchase = showPrice && sparePartDirectPurchaseEnabled;

  const selector = hasSizeOptions ? (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Olcu sec
      </label>
      <select
        value={resolvedSize}
        onChange={(event) => setSelectedSize(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400"
      >
        <option value="" disabled>
          Olcu seciniz
        </option>
        {sizeOptions.map((sizeOption) => (
          <option key={sizeOption} value={sizeOption}>
            {sizeOption}
          </option>
        ))}
      </select>
    </div>
  ) : null;

  const actionButtons = (
    <div className="mt-4 flex flex-col gap-3">
      {inStock && canDirectPurchase && (
        <QuickBuyButton
          item={{
            id,
            name: displayName,
            priceCents,
            imageUrl,
            variantValue: resolvedSize || null,
          }}
          disabled={selectionDisabled}
        />
      )}
      {inStock && canDirectPurchase ? (
        <AddToCartButton
          id={id}
          name={name}
          priceCents={priceCents}
          imageUrl={imageUrl}
          variantValue={resolvedSize || null}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
              {showPrice
                ? `${(priceCents / 100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 })}`
                : 'Fiyat icin teklif al'}
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inStock ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
            {inStock ? 'Stokta' : 'Stokta yok'}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            Teslim: {inStock ? '2-3 gun' : '7-10 gun'}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            Garanti: Resmi servis
          </div>
        </div>
        {selector}
      </div>

      <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)] lg:sticky lg:top-24 lg:block">
        <div className="text-3xl font-semibold text-slate-900">
          {showPrice
            ? `${(priceCents / 100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 })}`
            : 'Fiyat icin teklif al'}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
          <span className={`rounded-full px-3 py-1 ${inStock ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
            {inStock ? 'Stokta' : 'Siparisle'}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
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
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Gonderen</span>
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
            <li>Guvenli odeme altyapisi</li>
            <li>Fatura ve garanti destegi</li>
            <li>Teknik ekipten hizli destek</li>
          </ul>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-3">
          {hasSizeOptions ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Olcu sec
              </label>
              <select
                value={resolvedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400"
              >
                <option value="" disabled>
                  Olcu seciniz
                </option>
                {sizeOptions.map((sizeOption) => (
                  <option key={sizeOption} value={sizeOption}>
                    {sizeOption}
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
                {inStock
                  ? `${(priceCents / 100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 })}`
                  : 'Stokta yok'}
              </div>
            </div>

            {inStock && canDirectPurchase ? (
              <div className="ml-auto grid w-full max-w-[360px] grid-cols-2 gap-2">
                <AddToCartButton
                  id={id}
                  name={name}
                  priceCents={priceCents}
                  imageUrl={imageUrl}
                  variantValue={resolvedSize || null}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  quantity={1}
                  disabled={selectionDisabled}
                />
                <QuickBuyButton
                  item={{
                    id,
                    name: displayName,
                    priceCents,
                    imageUrl,
                    variantValue: resolvedSize || null,
                  }}
                  disabled={selectionDisabled}
                />
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
