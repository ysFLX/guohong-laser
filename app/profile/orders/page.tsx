'use client';

import Link from 'next/link';

import ProfileLayout from '@/components/profile/ProfileLayout';

export default function OrdersPage() {
  return (
    <ProfileLayout showSide={false}>
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/profile" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              Hesap yonetimine don
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Siparislerim</h1>
            <p className="mt-1 text-sm text-slate-600">Tum siparislerin burada listelenecek.</p>
          </div>
          <Link href="/spare-parts" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Yeni urun kesfet
          </Link>
        </div>

        <div className="mt-8 rounded-[24px] border border-dashed border-slate-200 bg-white/90 p-6">
          <div className="text-sm font-semibold text-slate-900">Henuz siparis yok</div>
          <p className="mt-2 text-sm text-slate-600">
            Sepetine urun ekleyip siparisini tamamladiginda burada gorebilirsin.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/spare-parts"
              className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Yedek parcalar
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Destek al
            </Link>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}

