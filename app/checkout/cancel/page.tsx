'use client';

import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">Odeme tamamlanamadi</div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Odeme islemi iptal edildi veya basarisiz oldu. Sepetindeki urunler korunuyor.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Sepete don
          </Link>
          <Link
            href="/spare-parts"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Yedek parcalar
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Destek al
          </Link>
        </div>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 text-left text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Yardim</div>
          <div className="mt-3">
            Odeme tekrar denemek isterseniz sepetten devam edebilirsiniz. Sorun devam ederse ekibimizle iletisim kurun.
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-700 dark:bg-gray-900">
              Telefon: +90 536 831 67 87
            </span>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 dark:border-gray-700 dark:bg-gray-900">
              Mail: guohonglazerinfo@gmail.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

