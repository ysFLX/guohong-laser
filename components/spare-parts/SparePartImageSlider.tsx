'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ImageItem = {
  id: string;
  url: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.6;
const ZOOM_STEP = 0.3;

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
  const [isFading, setIsFading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const swipeRef = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false });
  const prevActiveUrlRef = useRef('');

  useEffect(() => {
    if (index < items.length) return;
    setIndex(0);
  }, [index, items.length]);

  useEffect(() => {
    setIndex(0);
  }, [items]);

  const goTo = useCallback(
    (next: number) => {
      if (items.length === 0) return;
      const clamped = (next + items.length) % items.length;
      setIndex(clamped);
    },
    [items.length],
  );

  const goPrev = useCallback(() => {
    if (items.length === 0) return;
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    if (items.length === 0) return;
    setIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const active = items[index] ?? items[0] ?? null;

  useEffect(() => {
    const nextUrl = active?.url;
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
  }, [active?.url]);

  useEffect(() => {
    if (!isLightboxOpen) {
      setZoom(1);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
      }
      if (event.key === 'ArrowLeft' && items.length > 1) {
        goPrev();
      }
      if (event.key === 'ArrowRight' && items.length > 1) {
        goNext();
      }
      if ((event.key === '+' || event.key === '=') && active) {
        event.preventDefault();
        setZoom((current) => Math.min(MAX_ZOOM, Number((current + ZOOM_STEP).toFixed(1))));
      }
      if ((event.key === '-' || event.key === '_') && active) {
        event.preventDefault();
        setZoom((current) => Math.max(MIN_ZOOM, Number((current - ZOOM_STEP).toFixed(1))));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, goNext, goPrev, isLightboxOpen, items.length]);

  const updateZoom = useCallback((direction: 'in' | 'out') => {
    setZoom((current) => {
      const nextValue = direction === 'in' ? current + ZOOM_STEP : current - ZOOM_STEP;
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(nextValue.toFixed(1))));
    });
  }, []);

  if (!active) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm" />
    );
  }

  return (
    <>
      <div>
        <div
          className="group relative aspect-square w-full touch-pan-y overflow-hidden rounded-[20px] border border-slate-200 bg-white"
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
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute inset-0 z-10 cursor-zoom-in"
            aria-label="Görseli büyüt"
          />

          <Image
            key={active.url}
            src={active.url}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-contain p-6 transition duration-300 ${isFading ? 'scale-[0.985] opacity-0' : 'scale-100 opacity-100'} group-hover:scale-[1.01]`}
            priority
            unoptimized
          />

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            aria-label="Tam ekran aç"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M3.75 7a.75.75 0 01-.75-.75V3.5A1.5 1.5 0 014.5 2h2.75a.75.75 0 010 1.5H4.5v2.75A.75.75 0 013.75 7zm12.5 0a.75.75 0 01-.75-.75V3.5h-2.75a.75.75 0 010-1.5h2.75A1.5 1.5 0 0117 3.5v2.75a.75.75 0 01-.75.75zm-8.5 11a.75.75 0 010-1.5H4.5A1.5 1.5 0 013 15v-2.75a.75.75 0 011.5 0V15h2.75a.75.75 0 010 1.5zm8.75 0h-2.75a.75.75 0 010-1.5h2.75v-2.75a.75.75 0 011.5 0V15a1.5 1.5 0 01-1.5 1.5z" />
            </svg>
            Büyüt
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-sm transition hover:bg-slate-50"
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
                className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-sm transition hover:bg-slate-50"
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
              <div className="absolute bottom-4 right-4 z-20 rounded-lg border border-slate-200 bg-white/95 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                {index + 1} / {items.length}
              </div>
            </>
          )}
        </div>

        {items.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {items.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? 'true' : 'false'}
                className={`relative aspect-square overflow-hidden rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6a0d]/35 ${
                  i === index
                    ? 'border-[#ff6a0d] bg-white ring-2 ring-orange-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Image
                  src={img.url}
                  alt={`${name} ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  loading="lazy"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-white/96 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} büyük önizleme`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-slate-950">
              <div>
                <div className="text-sm font-semibold">{name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  `ESC` ile kapat, `+` ve `-` ile yakınlaştır.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateZoom('out')}
                  disabled={zoom <= MIN_ZOOM}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Uzaklaştır"
                >
                  -
                </button>
                <div className="min-w-[72px] rounded-full border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-900 shadow-sm">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  type="button"
                  onClick={() => updateZoom('in')}
                  disabled={zoom >= MAX_ZOOM}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Yakınlaştır"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setIsLightboxOpen(false);
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50"
                  aria-label="Kapat"
                >
                  <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M4.47 4.47a.75.75 0 011.06 0L10 8.94l4.47-4.47a.75.75 0 111.06 1.06L11.06 10l4.47 4.47a.75.75 0 11-1.06 1.06L10 11.06l-4.47 4.47a.75.75 0 11-1.06-1.06L8.94 10 4.47 5.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <div className="relative flex h-[70vh] min-h-[420px] items-center justify-center overflow-auto">
                <div
                  className="relative h-full w-full transition-transform duration-200"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                >
                  <Image
                    src={active.url}
                    alt={name}
                    fill
                    sizes="100vw"
                    className="object-contain p-6"
                    priority
                    unoptimized
                  />
                </div>
              </div>

              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goPrev()}
                    className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur transition hover:bg-slate-50"
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
                    onClick={() => goNext()}
                    className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur transition hover:bg-slate-50"
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
