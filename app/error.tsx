'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-16 text-center">
      <section className="relative w-full overflow-hidden rounded-[36px] border border-slate-900/10 bg-slate-950 px-6 py-12 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.35),_transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.35))]" />

        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Bir sorun oldu
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Beklenmeyen bir hata oluştu</h1>
          <p className="mx-auto max-w-2xl text-sm text-white/70 sm:text-base">
            Lütfen tekrar dene. Devam ederse ana sayfaya dönüp işlemi yeniden başlatabilir veya destek ekibine yazabilirsin.
          </p>
          {error?.digest ? (
            <div className="mx-auto mt-3 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
              Hata kodu: <span className="font-semibold text-white/90">{error.digest}</span>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="btn-primary rounded-full px-6 py-2.5 text-sm">
              Tekrar dene
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/50"
            >
              Ana sayfaya dön
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/50"
            >
              İletişim
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

