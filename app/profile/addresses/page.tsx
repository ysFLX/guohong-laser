'use client';

import Link from 'next/link';

import AddressesManager from '@/components/profile/AddressesManager';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function AddressesPage() {
  return (
    <ProfileLayout showSide={false}>
      <div>
        <Link href="/profile" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          ← Hesap Yönetimine Dön
        </Link>
        <h1 className="text-2xl text-black font-bold mb-4">Adreslerim</h1>
        <p className="text-sm text-gray-600 mb-6">Adreslerini burada yonetebilirsin. Hem profil sayfasindan hem buradan erisilebilir.</p>
        <AddressesManager />
      </div>
    </ProfileLayout>
  );
}
