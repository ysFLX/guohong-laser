'use client';

import Image from 'next/image';
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
      alt: 'Lazer kesim atölye',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/2.jpg',
      alt: 'Üretim hattı detay',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/3.jpg',
      alt: 'Metal işleme',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/4.jpg',
      alt: 'Makine detay',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/5.jpg',
      alt: 'Atölye görünümü',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/6.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/7.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/8.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/9.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/10.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/11.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/12.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/13.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/14.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/15.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/16.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/17.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/18.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/19.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/20.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/21.jpg',
      alt: 'Çalışma alanı',
    },
    {
      src: 'https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/22.jpg',
      alt: 'Çalışma alanı',
    },
  ].map((item, index) => ({ ...item, tag: tagPool[index % tagPool.length] })) as GalleryImage[];

  const [activeTag, setActiveTag] = useState('Tumu');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredImages = useMemo(
    () => (activeTag === 'Tümü' ? galleryImages : galleryImages.filter((item) => item.tag === activeTag)),
    [activeTag, galleryImages],
  );

  const activeImage = activeIndex !== null ? filteredImages[activeIndex] : null;
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const image of galleryImages) {
      counts[image.tag] = (counts[image.tag] ?? 0) + 1;
    }
    return counts;
  }, [galleryImages]);

  useEffect(() => {
    setActiveIndex(null);
  }, [activeTag]);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, filteredImages.length]);

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
          <h1 className="text-3xl font-semibold sm:text-4xl">Saha kurulumları ve üretim</h1>
          <p className="max-w-2xl text-base text-white/70">
            Lazer kesim hatlarından gerçek kurulum fotoğrafları ve çalışma sahalarından kareler.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Filtreler</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Gerçek galeri akışı</h2>
            <p className="mt-1 text-sm text-slate-600">
              {filteredImages.length} görsel gösteriliyor / {galleryImages.length} toplam.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            {activeTag === 'Tümü' ? 'Tüm kategoriler' : activeTag}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {['Tumu', ...tagPool].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                activeTag === tag
                  ? 'bg-indigo-500 text-slate-900'
                  : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {tag}
              <span className="ml-2 text-[10px] text-slate-400">
                {tag === 'Tumu' ? galleryImages.length : tagCounts[tag] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="space-y-6">
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {filteredImages.map((item, index) => (
            <Reveal key={item.src} as="div" delay={120 + index * 30} className="mb-6 break-inside-avoid">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group relative w-full overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full rounded-[28px] object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {item.tag}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 transition group-hover:opacity-100">
                    <div className="text-sm font-semibold text-white">{item.alt}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/70">Detay gör</div>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative z-10 w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Galeri detayı</p>
                <h3 className="mt-1 text-2xl font-semibold">{activeImage.alt}</h3>
                <p className="mt-1 text-sm text-white/70">{activeImage.tag}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/60"
              >
                Kapat
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] bg-white p-3 shadow-2xl">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                width={1600}
                height={1200}
                sizes="100vw"
                className="max-h-[70vh] w-full object-contain"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
              <span>
                {(activeIndex ?? 0) + 1} / {filteredImages.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/60"
                >
                  Önceki
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/60"
                >
                  Sonraki
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {filteredImages.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-2xl border transition ${
                    index === activeIndex
                      ? 'border-indigo-300 shadow-lg'
                      : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={112}
                    height={80}
                    sizes="112px"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
