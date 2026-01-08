'use client';

import { useEffect, useMemo, useState } from 'react';

import Reveal from '@/components/home/Reveal';

type GalleryImage = {
  src: string;
  alt: string;
  tag: string;
};

export default function GalleryPage() {
  const tagPool = ['Kurulum', 'Uretim', 'Detay', 'Makine'];

  const galleryImages = [
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/1.jpg',
      alt: 'Lazer kesim atelye',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/2.jpg',
      alt: 'Uretim hatti detay',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/3.jpg',
      alt: 'Metal isleme',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/4.jpg',
      alt: 'Makine detay',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/5.jpg',
      alt: 'Atolye gorunumu',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/6.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/7.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/8.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/9.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/10.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/11.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/12.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/13.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/14.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/15.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/16.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/17.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/18.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/19.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/20.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/21.jpg',
      alt: 'Calisma alani',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/22.jpg',
      alt: 'Calisma alani',
    },
  ].map((item, index) => ({ ...item, tag: tagPool[index % tagPool.length] })) as GalleryImage[];

  const [activeTag, setActiveTag] = useState('Tumu');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredImages = useMemo(
    () => (activeTag === 'Tumu' ? galleryImages : galleryImages.filter((item) => item.tag === activeTag)),
    [activeTag, galleryImages],
  );

  const activeImage = activeIndex !== null ? filteredImages[activeIndex] : null;

  useEffect(() => {
    setActiveIndex(null);
  }, [activeTag]);

  const goPrev = () => {
    if (activeIndex === null || filteredImages.length === 0) return;
    setActiveIndex((prev) => (prev === null ? prev : (prev - 1 + filteredImages.length) % filteredImages.length));
  };

  const goNext = () => {
    if (activeIndex === null || filteredImages.length === 0) return;
    setActiveIndex((prev) => (prev === null ? prev : (prev + 1) % filteredImages.length));
  };

  return (
    <div className="min-h-screen space-y-16">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
            Galeri
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Saha kurulumlari ve uretim</h1>
          <p className="max-w-2xl text-base text-white/70">
            Lazer kesim hatlarindan gercek kurulum fotograflari ve calisma sahalarindan kareler.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {['Tumu', ...tagPool].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                activeTag === tag
                  ? 'bg-teal-500 text-slate-900'
                  : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredImages.map((item, index) => (
            <Reveal key={item.src} as="div" delay={120 + index * 40}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group relative w-full overflow-hidden rounded-[26px] border border-slate-200/70 bg-white/90 p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 w-full rounded-[20px] border border-slate-100 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="h-full w-full rounded-[14px] object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-2 rounded-[14px] bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {item.tag}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute inset-0 cursor-default"
            aria-label="Kapat"
          />
          <div className="relative z-10 w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute -top-10 right-0 text-white text-sm font-semibold"
            >
              Kapat
            </button>
            <div className="rounded-[28px] bg-white p-3 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage.src} alt={activeImage.alt} className="max-h-[75vh] w-full object-contain" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/70">
              <span>{activeImage.tag}</span>
              <span>
                {(activeIndex ?? 0) + 1} / {filteredImages.length}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/50"
              >
                Onceki
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/50"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
