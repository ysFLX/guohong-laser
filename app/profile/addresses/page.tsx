'use client';

import Link from 'next/link';

import AddressesManager from '@/components/profile/AddressesManager';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function AddressesPage() {
  return (
    <ProfileLayout showSide={false}>
      <div>
        <Link href="/profile" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Hesap yonetimine don
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Adreslerim</h1>
        <p className="mt-2 text-sm text-slate-600">
          Adreslerini burada yonetebilirsin. Profil sayfasindan da erisebilirsin.
        </p>
        <div className="mt-6">
          <AddressesManager />
        </div>
      </div>
    </ProfileLayout>
  );
}



