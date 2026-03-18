'use client';

import { useEffect, useRef, useState } from 'react';

type VideoItem = {
  src: string;
  poster?: string;
  title?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeVideo = videoRefs.current[index];

  const goTo = (next: number) => {
    const clamped = (next + items.length) % items.length;
    setIndex(clamped);
  };

  useEffect(() => {
    if (!autoAdvanceMs || isPlaying) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, autoAdvanceMs);

    return () => clearInterval(id);
  }, [autoAdvanceMs, isPlaying, items.length]);

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
    setPlayBlocked(false);
    setCurrentTime(0);
    setDuration(videoRefs.current[index]?.duration ?? 0);
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
    video.play().then(() => setIsPlaying(true)).catch(() => setPlayBlocked(true));
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

  const handleSeek = (nextTime: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleFullscreen = async () => {
    const video = videoRefs.current[index];
    const target = video ?? containerRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if ('requestFullscreen' in target && typeof target.requestFullscreen === 'function') {
        await target.requestFullscreen();
        return;
      }
      if (
        video &&
        'webkitEnterFullscreen' in video &&
        typeof (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen === 'function'
      ) {
        (video as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
      }
    } catch {
      // ignore if fullscreen is blocked
    }
  };

  return (
    <div className="relative">
      <div
        className="relative h-[260px] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl sm:h-[340px] lg:h-[430px] xl:h-[480px]"
        ref={containerRef}
      >
        {items.map((item, i) => (
          <div
            key={item.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'pointer-events-auto z-10 opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-black/70 via-black/20 to-transparent sm:w-28" />
            <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-black/70 via-black/20 to-transparent sm:w-28" />
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={item.src}
              poster={item.poster}
              className="h-full w-full bg-black object-cover"
              muted={false}
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                video.muted = muted;
                video.volume = volume;
                if (i === index) {
                  setDuration(video.duration || 0);
                }
              }}
              onTimeUpdate={(event) => {
                if (i !== index) return;
                setCurrentTime(event.currentTarget.currentTime);
              }}
              onDurationChange={(event) => {
                if (i !== index) return;
                setDuration(event.currentTarget.duration || 0);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 via-black/20 to-transparent sm:h-28" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent sm:h-32" />

        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleToggle();
              }}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-black/55"
              aria-label={isPlaying ? 'Videoyu duraklat' : 'Videoyu oynat'}
            >
              <span className="ml-0.5 text-lg">{'>'}</span>
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute left-5 right-5 top-5 z-20 flex items-start justify-between gap-4">
          <div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {items[index]?.title ?? `Video ${index + 1}`}
            </div>
            {playBlocked && (
              <button
                type="button"
                onClick={handleUserPlay}
                className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                Sesi ac ve oynat
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full border border-white/30 text-white backdrop-blur hover:bg-white/10"
          aria-label="Onceki video"
        >
          {'<'}
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="absolute right-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full border border-white/30 text-white backdrop-blur hover:bg-white/10"
          aria-label="Sonraki video"
        >
          {'>'}
        </button>

        <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-4">
          <div
            className="rounded-[22px] border border-white/15 bg-black/55 px-4 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggle}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/20 px-3 text-sm font-semibold hover:bg-white/10"
                aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
              >
                {isPlaying ? '||' : '>'}
              </button>
              <div className="min-w-[88px] text-sm font-medium tabular-nums text-white/85">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(duration, 0)}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => handleSeek(Number(event.target.value))}
                className="h-1.5 flex-1 cursor-pointer accent-amber-300"
                aria-label="Video ilerleme cubugu"
              />
              <button
                type="button"
                onClick={handleToggleMute}
                className="hidden rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/10 sm:inline-flex"
              >
                {muted || volume === 0 ? 'Sessiz' : 'Ses'}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                className="hidden h-1.5 w-24 cursor-pointer accent-white sm:block"
                aria-label="Ses seviyesi"
              />
              <button
                type="button"
                onClick={handleFullscreen}
                className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/10"
              >
                Tam ekran
              </button>
            </div>
          </div>
        </div>
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
