'use client';

import { useState } from 'react';

import Reveal from '@/components/home/Reveal';

type GalleryImage = {
  src: string;
  alt: string;
};

export default function GalleryPage() {
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
  ] as GalleryImage[];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex !== null ? galleryImages[activeIndex] : null;

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

      <Reveal as="section" className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {galleryImages.map((item, index) => (
          <Reveal key={item.src} as="div" delay={120 + index * 40}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/90 p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="rounded-[18px] border border-slate-100 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="h-64 w-full rounded-[14px] object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
            </button>
          </Reveal>
        ))}
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
          </div>
        </div>
      )}
    </div>
  );
}
