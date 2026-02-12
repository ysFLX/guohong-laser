import { Suspense } from 'react';

import StockRequestClient from './StockRequestClient';

export const dynamic = 'force-dynamic';

export default function StockRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
          <div className="card-surface mx-auto max-w-6xl p-6 text-sm text-[var(--gray-500)]">
            Yükleniyor...
          </div>
        </div>
      }
    >
      <StockRequestClient />
    </Suspense>
  );
}
