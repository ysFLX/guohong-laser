'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'cookie_consent';
const ONE_YEAR = 60 * 60 * 24 * 365;

type ConsentState = {
  analytics: boolean;
  updatedAt?: string;
};

const readCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const parseConsent = (raw: string | null): ConsentState | null => {
  if (!raw) return null;
  if (raw === 'accepted') return { analytics: true };
  if (raw === 'rejected') return { analytics: false };
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (typeof parsed.analytics === 'boolean') {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
};

const writeCookie = (value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
};

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const stored = readCookie() || (typeof window !== 'undefined' ? window.localStorage.getItem(COOKIE_KEY) : null);
    const parsed = parseConsent(stored);
    if (parsed) {
      setConsent(parsed);
      setAnalyticsEnabled(parsed.analytics);
    }
  }, []);

  const persistConsent = (nextState: ConsentState) => {
    const payload = JSON.stringify({ ...nextState, updatedAt: new Date().toISOString() });
    writeCookie(payload);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COOKIE_KEY, payload);
    }
    setConsent(nextState);
  };

  const handleChoice = (value: 'accepted' | 'rejected') => {
    persistConsent({ analytics: value === 'accepted' });
  };

  const handleSavePreferences = () => {
    persistConsent({ analytics: analyticsEnabled });
    setShowPreferences(false);
  };

  if (consent) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[min(92vw,960px)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-200">
          Cerezleri deneyimi iyilestirmek ve analiz icin kullaniyoruz. Detaylar icin{' '}
          <Link href="/cookies" className="font-semibold text-indigo-600 hover:text-indigo-700">
            cerez politikasi
          </Link>{' '}
          sayfasini inceleyebilirsin.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
          >
            Tercihleri ayarla
          </button>
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
      {showPreferences ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cerez tercihleri</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                  Hangi cerezleri kullanabiliriz?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                Kapat
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Zorunlu cerezler</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Guvenlik ve oturum icin gerekli.
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Her zaman acik
                  </span>
                </div>
              </div>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Analitik cerezler</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Trafik ve performansi olcer.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  className="h-5 w-5 accent-indigo-500"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => handleChoice('rejected')}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
              >
                Hepsini kapat
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Tercihleri kaydet
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

