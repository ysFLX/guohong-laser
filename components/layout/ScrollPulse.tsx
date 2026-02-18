'use client';

import { useEffect, useMemo, useState } from 'react';

function getScrollProgress() {
  const top = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  if (height <= 0) return 0;
  return Math.min(100, Math.max(0, (top / height) * 100));
}

export default function ScrollPulse() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const update = () => {
      setProgress(getScrollProgress());
      frameId = 0;
    };

    const onScrollOrResize = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const progressRounded = Math.round(progress);
  const showElevator = progressRounded > 12;
  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference - (progress / 100) * circumference;

  const label = useMemo(() => {
    if (progressRounded > 95) return 'Bitti';
    if (progressRounded > 60) return 'Akışta';
    if (progressRounded > 30) return 'İlerliyor';
    return 'Başla';
  }, [progressRounded]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] bg-amber-100/10"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_14px_rgba(251,191,36,0.6)] transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`group fixed bottom-6 left-4 z-[80] inline-flex items-center gap-3 rounded-full border border-amber-200/35 bg-[#0d0d0d]/90 px-3 py-2 text-amber-100 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur transition-all duration-300 sm:left-6 ${
          showElevator ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
        }`}
        aria-label="Sayfanın en üstüne çık"
      >
        <span className="relative grid h-10 w-10 place-items-center">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="4" />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="rgba(251,191,36,0.95)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold tracking-wide text-amber-100">
            {progressRounded}
          </span>
        </span>
        <span className="pr-1 text-left">
          <span className="block text-[10px] uppercase tracking-[0.24em] text-amber-200/70">Scroll</span>
          <span className="block text-sm font-semibold text-amber-50">{label}</span>
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-400/15 text-amber-100 transition group-hover:bg-amber-300/20">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M12 5l6 6-1.5 1.5-3.5-3.5V19h-2V9l-3.5 3.5L6 11z" fill="currentColor" />
          </svg>
        </span>
      </button>
    </>
  );
}
