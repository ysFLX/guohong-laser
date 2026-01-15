'use client';

import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    q: 'Teslimat ne kadar suruyor?',
    a: 'Stoklu urunlerde 2-3 is gunu, ozel siparislerde 7-10 gun.',
  },
  {
    q: 'Garanti nasil isliyor?',
    a: 'Resmi servis garantisi ve fatura ile destek saglaniyor.',
  },
  {
    q: 'Uyumluluk teyidi alabilir miyim?',
    a: 'Model bilgisi paylasirsan teknik ekip teyit eder.',
  },
];

export default function SupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-slate-900 px-5 py-4 text-white">
            <div className="text-xs uppercase tracking-[0.3em] text-teal-300">Destek</div>
            <div className="mt-1 text-lg font-semibold">Hizli yardim</div>
            <p className="mt-1 text-xs text-slate-300">Sana en hizli sekilde yardimci olalim.</p>
          </div>
          <div className="space-y-4 px-5 py-4 text-sm text-slate-700">
            <div className="space-y-3">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.q}</div>
                  <div className="mt-1 text-xs text-slate-600">{item.a}</div>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Destek talebi ac
              </Link>
              <a
                href="https://wa.me/905368316787"
                className="inline-flex items-center justify-center rounded-full border border-teal-200 px-4 py-2 text-xs font-semibold text-teal-700"
              >
                WhatsApp hatti
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl transition hover:scale-[1.03]"
        aria-label="Destek widgetini ac"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M2 12a10 10 0 1118.22 5.56L22 22l-4.7-1.57A10 10 0 012 12zm6.5-1.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3.5 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" />
        </svg>
      </button>
    </div>
  );
}
