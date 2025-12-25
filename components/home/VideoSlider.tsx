'use client';

import { useEffect, useRef, useState } from 'react';

type VideoItem = {
  src: string;
  poster?: string;
  title?: string;
};

export default function VideoSlider({
  items,
  autoAdvanceMs,
}: {
  items: VideoItem[];
  autoAdvanceMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [playBlocked, setPlayBlocked] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const goTo = (next: number) => {
    const clamped = (next + items.length) % items.length;
    setIndex(clamped);
  };

  useEffect(() => {
    if (!autoAdvanceMs) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, autoAdvanceMs);

    return () => clearInterval(id);
  }, [autoAdvanceMs, items.length]);

  useEffect(() => {
    setPlayBlocked(false);

    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index) {
        video.currentTime = 0;
      } else {
        video.pause();
      }
    });
  }, [index]);

  const handleUserPlay = () => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.play().catch(() => setPlayBlocked(true));
  };

  return (
    <div className="relative">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
        {items.map((item, i) => (
          <div
            key={item.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none'
            }`}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={item.src}
              poster={item.poster}
              className="h-full w-full object-cover"
              muted={false}
              controls
              playsInline
              preload="none"
              onEnded={undefined}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40 pointer-events-none" />

        <div className="absolute top-5 left-5 right-5 z-20 flex items-start justify-between gap-4">
          <div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {items[index]?.title ?? `Video ${index + 1}`}
            </div>
            {playBlocked && (
              <button
                type="button"
                onClick={handleUserPlay}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Sesi ac ve oynat
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 h-11 w-11 rounded-full border border-white/30 text-white backdrop-blur hover:bg-white/10"
          aria-label="Onceki video"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 h-11 w-11 rounded-full border border-white/30 text-white backdrop-blur hover:bg-white/10"
          aria-label="Sonraki video"
        >
          ›
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={`${item.src}-dot`}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
            aria-label={`Video ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
