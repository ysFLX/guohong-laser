import { Suspense } from 'react';

import StockRequestClient from './StockRequestClient';

export const dynamic = 'force-dynamic';

export default function StockRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/80 px-4 py-10 sm:px-8">
          <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200/70 bg-white p-6 text-sm text-slate-600">
            Yükleniyor...
          </div>
        </div>
      }
    >
      <StockRequestClient />
    </Suspense>
  );
}
