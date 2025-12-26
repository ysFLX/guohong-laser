'use client';

import Link from 'next/link';

import ProfileLayout from '@/components/profile/ProfileLayout';

export default function OrdersPage() {
  return (
    <ProfileLayout showSide={false}>
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">SipariÅŸlerim</h1>
            <p className="mt-1 text-sm text-gray-600">TÃ¼m sipariÅŸlerin burada listelenecek.</p>
          </div>
          <Link href="/spare-parts" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            Yeni Ã¼rÃ¼n keÅŸfet
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">HenÃ¼z sipariÅŸ yok</div>
          <p className="mt-2 text-sm text-gray-600">
            Sepetine Ã¼rÃ¼n ekleyip sipariÅŸini tamamladÄ±ÄŸÄ±nda burada gÃ¶rebileceksin.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/spare-parts"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
            >
              Yedek ParÃ§alar
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-900 hover:bg-gray-50"
            >
              Destek Al
            </Link>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}


