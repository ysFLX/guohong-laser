'use client';

import { useMemo, useState } from 'react';

import SparePartImageSlider from '@/components/spare-parts/SparePartImageSlider';
import SparePartPurchaseClient from '@/components/spare-parts/SparePartPurchaseClient';

type ImageItem = {
  id: string;
  url: string;
};

type SizeOptionEntry = {
  value: string;
  priceCents: number;
  imageUrl: string | null;
  imageUrls?: string[];
};

type Props = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  images: ImageItem[];
  inStock: boolean;
  isCritical: boolean;
  stockOnHand: number;
  showPrice: boolean;
  sparePartDirectPurchaseEnabled: boolean;
  sizeOptionEntries: SizeOptionEntry[];
};

export default function SparePartDetailExperience({
  id,
  name,
  priceCents,
  imageUrl,
  images,
  inStock,
  isCritical,
  stockOnHand,
  showPrice,
  sparePartDirectPurchaseEnabled,
  sizeOptionEntries,
}: Props) {
  const [selectedSize, setSelectedSize] = useState(sizeOptionEntries[0]?.value ?? '');

  const selectedEntry = useMemo(
    () => sizeOptionEntries.find((entry) => entry.value === selectedSize) ?? null,
    [selectedSize, sizeOptionEntries],
  );

  const variantImageUrls = selectedEntry?.imageUrls?.length
    ? selectedEntry.imageUrls
    : selectedEntry?.imageUrl
      ? [selectedEntry.imageUrl]
      : [];

  const galleryImages = (() => {
    if (variantImageUrls.length === 0) return images;

    const seen = new Set<string>();
    const next: Array<{ id: string; url: string }> = [];

    for (const [index, url] of variantImageUrls.entries()) {
      const key = url.toLocaleLowerCase('tr-TR');
      if (seen.has(key)) continue;
      seen.add(key);
      next.push({ id: `size-${selectedSize || 'default'}-${index}`, url });
    }

    for (const image of images) {
      const key = image.url.toLocaleLowerCase('tr-TR');
      if (seen.has(key)) continue;
      seen.add(key);
      next.push(image);
    }

    return next;
  })();

  const resolvedFallbackUrl = selectedEntry?.imageUrls?.[0] ?? selectedEntry?.imageUrl ?? imageUrl ?? '/images/1.jpg';

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <SparePartImageSlider images={galleryImages} fallbackUrl={resolvedFallbackUrl} name={name} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
          <span className={`rounded-full px-3 py-1 ${inStock ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
            {inStock ? 'Stokta' : 'Siparişle'}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            {inStock ? '2-3 gün teslim' : '7-10 gün teslim'}
          </span>
          {isCritical && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-3 py-1 text-amber-900">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
              </span>
              Stok azalıyor
            </span>
          )}
        </div>
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 sm:grid-cols-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Güvenli ödeme</div>
            <div className="mt-1 font-semibold text-slate-900">SSL korumalı</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Garanti</div>
            <div className="mt-1 font-semibold text-slate-900">Resmi servis</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">İade</div>
            <div className="mt-1 font-semibold text-slate-900">14 gün</div>
          </div>
        </div>
      </div>

      <SparePartPurchaseClient
        id={id}
        name={name}
        priceCents={priceCents}
        imageUrl={imageUrl}
        inStock={inStock}
        isCritical={isCritical}
        stockOnHand={stockOnHand}
        showPrice={showPrice}
        sparePartDirectPurchaseEnabled={sparePartDirectPurchaseEnabled}
        sizeOptionEntries={sizeOptionEntries}
        selectedSize={selectedSize}
        onSelectedSizeChange={setSelectedSize}
      />
    </>
  );
}
