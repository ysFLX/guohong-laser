'use client';

import ProfileLayout from '@/components/profile/ProfileLayout';

export default function OrdersPage() {
  return (
    <ProfileLayout showSide={false}>
      <div>
        <h1 className="text-2xl font-bold mb-4">Siparişlerim</h1>
        <p className="text-sm text-gray-600">Henüz sipariş yok. Siparişlerin burada listelenecek.</p>
      </div>
    </ProfileLayout>
  );
}
