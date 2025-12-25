'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (session?.user) {
      if (session.user.profileComplete) {
        const next = searchParams.get('next') || '/';
        router.replace(next);
        return;
      }
      setFirstName(session.user.firstName ?? '');
      setLastName(session.user.lastName ?? '');
      setPhone(session.user.phone ?? '');
    }
  }, [status, session, router, searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError('Ad, soyad ve telefon zorunludur.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || 'Profil guncellenemedi');
      }

      await update();

      const next = searchParams.get('next') || '/';
      router.replace(next);
      router.refresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Profil guncellenemedi';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700">Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-semibold">
              GL
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Profili Tamamla</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sepete urun eklemek icin ad, soyad ve telefon bilgilerini eklemelisin.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ad
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                  placeholder="Adiniz"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Soyad
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                  placeholder="Soyadiniz"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                  placeholder="05xx xxx xx xx"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-700 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white ${
                  isSaving ? 'bg-gray-400' : 'bg-gray-900 hover:bg-gray-800'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900/30`}
              >
                {isSaving ? 'Kaydediliyor...' : 'Profili Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
