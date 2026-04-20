'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    const normalizedImages = images.filter(
      (image): image is ImageItem =>
        Boolean(image) && typeof image.id === 'string' && typeof image.url === 'string' && image.url.trim().length > 0,
    );

    if (normalizedImages.length > 0) return normalizedImages;

    const normalizedFallbackUrl = typeof fallbackUrl === 'string' ? fallbackUrl.trim() : '';
    if (normalizedFallbackUrl) {
      return [{ id: 'fallback', url: normalizedFallbackUrl }];
    }

    return [];
  }, [images, fallbackUrl]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < items.length) return;
    setIndex(0);
  }, [index, items.length]);

  useEffect(() => {
    setIndex(0);
  }, [items]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = (next + items.length) % items.length;
      setIndex(clamped);
    },
    [items.length],
  );

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const active = items[index] ?? items[0] ?? null;
  const swipeRef = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false });
  const [isFading, setIsFading] = useState(false);
  const prevActiveUrlRef = useRef('');

  if (!active) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30" />
    );
  }

  useEffect(() => {
    const nextUrl = active.url;
    if (!nextUrl) return;

    if (!prevActiveUrlRef.current) {
      prevActiveUrlRef.current = nextUrl;
      return;
    }

    if (prevActiveUrlRef.current === nextUrl) return;

    prevActiveUrlRef.current = nextUrl;
    setIsFading(true);

    const timer = window.setTimeout(() => {
      setIsFading(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [active.url]);

  return (
    <div>
      <div
        className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/30"
        role="region"
        aria-label="Ürün görselleri"
        tabIndex={items.length > 1 ? 0 : -1}
        onKeyDown={(event) => {
          if (items.length <= 1) return;
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goPrev();
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            goNext();
          }
        }}
        onPointerDown={(event) => {
          if (items.length <= 1) return;
          swipeRef.current = { startX: event.clientX, active: true };
        }}
        onPointerUp={(event) => {
          if (items.length <= 1) return;
          if (!swipeRef.current.active) return;
          swipeRef.current.active = false;
          const delta = event.clientX - swipeRef.current.startX;
          if (Math.abs(delta) < 50) return;
          if (delta > 0) goPrev();
          else goNext();
        }}
        onPointerCancel={() => {
          swipeRef.current.active = false;
        }}
        onPointerLeave={() => {
          swipeRef.current.active = false;
        }}
      >
        <Image
          key={active.url}
          src={active.url}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={`object-cover transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}
          priority
          unoptimized
        />

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/10 text-white backdrop-blur transition hover:bg-black/20"
              aria-label="Önceki görsel"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.78 15.53a.75.75 0 01-1.06 0l-5-5a.75.75 0 010-1.06l5-5a.75.75 0 111.06 1.06L8.31 10l4.47 4.47a.75.75 0 010 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/10 text-white backdrop-blur transition hover:bg-black/20"
              aria-label="Sonraki görsel"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.22 4.47a.75.75 0 011.06 0l5 5a.75.75 0 010 1.06l-5 5a.75.75 0 11-1.06-1.06L11.69 10 7.22 5.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {index + 1} / {items.length}
            </div>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {items.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? 'true' : 'false'}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                i === index
                  ? 'border-indigo-500 ring-1 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800'
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




