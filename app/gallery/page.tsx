"use client";

import { useState } from "react";

type GalleryImage = {
  src: string;
  alt: string;
};

export default function GalleryPage() {
  const galleryImages = [
    {
      src: "https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/1.jpg",
      alt: "Lazer kesim atelye",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
      alt: "Uretim hatti detay",
    },
    {
      src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80&sat=-25",
      alt: "Metal isleme",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80&sat=-20",
      alt: "Makine detay",
    },
    {
      src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1400&q=80&sat=-15",
      alt: "Atolye gorunumu",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80&sat=-10",
      alt: "Calisma alani",
    },
  ] as GalleryImage[];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex !== null ? galleryImages[activeIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Galeri</h1>
          <p className="mt-3 text-lg text-gray-500">Lazer kesim ve uretimden sahneler</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-md transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-white via-gray-50 to-gray-100 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="h-64 w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

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
            <div className="rounded-3xl bg-white p-3 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage.src} alt={activeImage.alt} className="w-full max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
