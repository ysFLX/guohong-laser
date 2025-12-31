'use client';

import dynamic from 'next/dynamic';

const OrdersClient = dynamic(() => import('./OrdersClient'), {
  ssr: false,
  loading: () => (
    <div className="mt-8 rounded-[24px] border border-slate-200 bg-white/90 p-6 text-sm text-slate-600">
      Yukleniyor...
    </div>
  ),
});

export default function OrdersPage() {
  return <OrdersClient />;
}

