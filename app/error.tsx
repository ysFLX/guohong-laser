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
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16 text-center">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Bir sorun oldu</div>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Beklenmeyen bir hata olustu</h1>
        <p className="mt-2 text-sm text-gray-600">
          Lutfen sayfayi yenileyin veya biraz sonra tekrar deneyin.
        </p>
        {error?.digest && (
          <div className="mt-3 text-xs text-gray-400">Hata kodu: {error.digest}</div>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
