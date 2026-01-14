'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global app error:', error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="min-h-screen bg-gray-50 px-4 py-16 text-center">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Kritik hata</div>
          <h1 className="mt-3 text-2xl font-semibold text-gray-900">Uygulama gecici olarak kullanilamiyor</h1>
          <p className="mt-2 text-sm text-gray-600">
            Lutfen daha sonra tekrar deneyin.
          </p>
          {error?.digest && (
            <div className="mt-3 text-xs text-gray-400">Hata kodu: {error.digest}</div>
          )}
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Yeniden yukle
          </button>
        </div>
      </body>
    </html>
  );
}
