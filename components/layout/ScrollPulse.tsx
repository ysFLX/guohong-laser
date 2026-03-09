'use client';

import { useEffect, useState } from 'react';

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

  const showElevator = progress > 2;

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
        className={`group fixed bottom-[calc(env(safe-area-inset-bottom)+14px)] left-3 z-[120] grid h-12 w-12 place-items-center rounded-full border border-amber-200/35 bg-[#0d0d0d]/90 text-amber-100 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur transition-all duration-300 sm:bottom-6 sm:left-6 ${
          showElevator ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
        }`}
        aria-label="Sayfanin en ustune cik"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 transition group-hover:-translate-y-0.5" aria-hidden="true">
          <path d="M12 5l6 6-1.5 1.5-3.5-3.5V19h-2V9l-3.5 3.5L6 11z" fill="currentColor" />
        </svg>
      </button>
    </>
  );
}
