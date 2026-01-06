'use client';

import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">Odeme iptal edildi</div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Odeme islemi tamamlanmadi. Sepetine geri donup tekrar deneyebilirsin.
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
        </div>
      </div>
    </div>
  );
}

