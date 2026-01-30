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
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index) {
        video.currentTime = 0;
      } else {
        video.pause();
      }
    });
    setIsPlaying(false);
  }, [index]);

  useEffect(() => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = muted;
    video.volume = volume;
  }, [index, muted, volume]);

  const handleUserPlay = () => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.play().catch(() => setPlayBlocked(true));
  };

  const handleToggle = () => {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setPlayBlocked(true));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    if (nextVolume > 0 && muted) setMuted(false);
    if (nextVolume === 0 && !muted) setMuted(true);
  };

  const handleToggleMute = () => {
    setMuted((prev) => !prev);
  };

  const handleFullscreen = async () => {
    const target = containerRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (target.requestFullscreen) {
        await target.requestFullscreen();
      }
    } catch {
      // ignore if fullscreen is blocked
    }
  };

  return (
    <div className="relative">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
        ref={containerRef}
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
          }
        }}
      >
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
              playsInline
              preload="metadata"
              onLoadedMetadata={() => {
                const video = videoRefs.current[i];
                if (!video) return;
                if (i === index) {
                  video.muted = muted;
                  video.volume = volume;
                  try {
                    video.currentTime = 0.1;
                  } catch {
                    // ignore if the browser blocks seeking
                  }
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40 pointer-events-none" />

        {!isPlaying && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white shadow-lg backdrop-blur">
              ▶
            </div>
          </div>
        )}

        <div
          className="absolute bottom-4 right-4 z-30 flex items-center gap-3 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs text-white backdrop-blur"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleToggleMute}
            className="rounded-full border border-white/20 px-3 py-1 font-semibold uppercase tracking-[0.2em] hover:bg-white/10"
          >
            {muted ? 'Sessiz' : 'Ses'}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(event) => handleVolumeChange(Number(event.target.value))}
            className="h-1 w-24 accent-indigo-300"
            aria-label="Ses seviyesi"
          />
          <button
            type="button"
            onClick={handleFullscreen}
            className="rounded-full border border-white/20 px-3 py-1 font-semibold uppercase tracking-[0.2em] hover:bg-white/10"
          >
            Tam ekran
          </button>
        </div>

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
                Sesi aç ve oynat
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 h-11 w-11 rounded-full border border-white/30 text-white backdrop-blur hover:bg-white/10"
          aria-label="Önceki video"
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

