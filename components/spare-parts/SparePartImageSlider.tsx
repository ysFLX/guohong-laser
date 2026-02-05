'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type ImageItem = {
  id: string;
  url: string;
};

export default function SparePartImageSlider({
  images,
  fallbackUrl,
  name,
}: {
  images: ImageItem[];
  fallbackUrl: string;
  name: string;
}) {
  const items = useMemo(() => {
    if (images.length > 0) return images;
    return [{ id: 'fallback', url: fallbackUrl }];
  }, [images, fallbackUrl]);

  const [index, setIndex] = useState(0);

  const goTo = (next: number) => {
    const clamped = (next + items.length) % items.length;
    setIndex(clamped);
  };

  const active = items[index];

  return (
    <div>
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Image
          src={active.url}
          alt={name}
          fill
          sizes="(max-width: 1024px) 1000vw, 50vw"
          className="object-cover"
          priority
          unoptimized
        />

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-white/40 text-white backdrop-blur hover:bg-white/10"
              aria-label="Önceki görsel"
            >
              {'<'}
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-white/40 text-white backdrop-blur hover:bg-white/10"
              aria-label="Sonraki görsel"
            >
              {'>'}
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {items.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border ${
                i === index ? 'border-indigo-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Image
                src={img.url}
                alt={`${name} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}






