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
  priceCurrency: string;
  imageUrl: string | null;
  imageUrls?: string[];
};

type Props = {
  id: string;
  name: string;
  description: string;
  categoryName: string;
  dimensions: string | null;
  priceCents: number;
  imageUrl: string | null;
  images: ImageItem[];
  inStock: boolean;
  isCritical: boolean;
  stockOnHand: number;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  showPrice: boolean;
  sizeOptionEntries: SizeOptionEntry[];
};

export default function SparePartDetailExperience({
  id,
  name,
  description,
  categoryName,
  dimensions,
  priceCents,
  imageUrl,
  images,
  inStock,
  isCritical,
  stockOnHand,
  isFeatured,
  ratingAverage,
  ratingCount,
  showPrice,
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
    <section className="grid gap-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.35)] lg:grid-cols-[minmax(0,1.02fr)_minmax(390px,0.78fr)] lg:p-6">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3">
          <SparePartImageSlider images={galleryImages} fallbackUrl={resolvedFallbackUrl} name={name} />
        </div>
        <div className="grid gap-3 text-xs text-slate-700 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-semibold text-slate-950">SSL ödeme</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-semibold text-slate-950">Resmi servis</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="font-semibold text-slate-950">14 gün iade</div>
          </div>
        </div>
      </div>

      <SparePartPurchaseClient
        id={id}
        name={name}
        description={description}
        categoryName={categoryName}
        dimensions={dimensions}
        priceCents={priceCents}
        imageUrl={imageUrl}
        inStock={inStock}
        isCritical={isCritical}
        stockOnHand={stockOnHand}
        isFeatured={isFeatured}
        ratingAverage={ratingAverage}
        ratingCount={ratingCount}
        showPrice={showPrice}
        sizeOptionEntries={sizeOptionEntries}
        selectedSize={selectedSize}
        onSelectedSizeChange={setSelectedSize}
      />
    </section>
  );
}

