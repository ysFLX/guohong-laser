'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import Reveal from '@/components/home/Reveal';

type GalleryImage = {
  src: string;
  alt: string;
};

const galleryImages: GalleryImage[] = Array.from({ length: 22 }, (_, index) => ({
  src: `https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/${index + 1}.jpg`,
  alt: `Guohong saha uygulaması ${String(index + 1).padStart(2, '0')}`,
}));

export default function GalleryPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex !== null ? galleryImages[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') setActiveIndex((prev) => (prev === null ? prev : (prev - 1 + galleryImages.length) % galleryImages.length));
      if (event.key === 'ArrowRight') setActiveIndex((prev) => (prev === null ? prev : (prev + 1) % galleryImages.length));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex]);

  return (
    <div className="space-y-14 pb-16 text-white">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#15148c] shadow-[0_40px_120px_-60px_rgba(5,0,92,0.95)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.24),_transparent_30%),linear-gradient(120deg,_rgba(5,0,92,0.2),_rgba(5,0,92,0.92))]" />
        <div className="relative px-6 py-12 lg:px-14 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#ff6a0d]">Galeri</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">Saha kurulumları ve üretim</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/76">
            Referans sitenin galeri ve müşteri davası mantığına yakın biçimde, gerçek saha karelerini büyük görsel bloklar halinde sunuyoruz.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Fotoğraf galerisi</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{galleryImages.length} görsel gösteriliyor</h2>
          </div>
        </div>

        <div className="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {galleryImages.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group mb-6 block w-full break-inside-avoid overflow-hidden rounded-[28px] border border-white/10 bg-white/6 text-left transition hover:-translate-y-1 hover:border-[#ff6a0d]/55"
            >
              <div className="relative">
                <Image src={item.src} alt={item.alt} width={1200} height={900} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15148c]/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 transition group-hover:opacity-100">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a0d]">{String(index + 1).padStart(2, '0')}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{item.alt}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Reveal>

      {activeImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050038]/88 px-4 py-6" onClick={() => setActiveIndex(null)}>
          <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ff6a0d]">Galeri detayı</div>
                <div className="mt-2 text-2xl font-semibold text-white">{activeImage.alt}</div>
              </div>
              <button type="button" onClick={() => setActiveIndex(null)} className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white">
                Kapat
              </button>
            </div>
            <div className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-white/6 p-3">
              <Image src={activeImage.src} alt={activeImage.alt} width={1600} height={1200} sizes="100vw" className="max-h-[72vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
