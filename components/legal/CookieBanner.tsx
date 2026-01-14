'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'cookie_consent';
const ONE_YEAR = 60 * 60 * 24 * 365;

const readCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
};

export default function CookieBanner() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    const stored = readCookie() || (typeof window !== 'undefined' ? window.localStorage.getItem(COOKIE_KEY) : null);
    if (stored) setConsent(stored);
  }, []);

  const handleChoice = (value: 'accepted' | 'rejected') => {
    writeCookie(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COOKIE_KEY, value);
    }
    setConsent(value);
  };

  if (consent) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[min(92vw,960px)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-200">
          Cerezleri deneyimi iyilestirmek ve analiz icin kullaniyoruz. Detaylar icin{' '}
          <Link href="/cookies" className="font-semibold text-teal-600 hover:text-teal-700">
            cerez politikasi
          </Link>{' '}
          sayfasini inceleyebilirsin.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleChoice('rejected')}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
