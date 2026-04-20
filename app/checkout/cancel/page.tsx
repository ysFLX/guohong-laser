'use client';

import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Checkout</div>
        <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Ödeme tamamlanamadı
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Ödeme işlemi iptal edildi veya başarısız oldu. Sepetindeki ürünler korunuyor.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Sepete dön
          </Link>
          <Link
            href="/spare-parts"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/60"
          >
            Yedek parçalar
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/60"
          >
            Destek al
          </Link>
        </div>
        <div className="mt-8 rounded-[28px] border border-slate-200/70 bg-white/90 p-5 text-left text-sm text-slate-600 shadow-xl dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-300">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Yardım</div>
          <div className="mt-3">
            Ödeme işlemini tekrar denemek isterseniz sepetten devam edebilirsiniz. Sorun devam ederse ekibimizle iletişim kürün.
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950/40">
              Telefon: +90 536 831 67 87
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950/40">
              Mail: guohonglazerinfo@gmail.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



