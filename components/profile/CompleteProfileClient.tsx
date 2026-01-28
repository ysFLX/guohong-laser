'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CompleteProfileClient() {
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white/70">
        Yukleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)] opacity-80" />
          <div className="relative">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-400 text-slate-900 flex items-center justify-center font-semibold">
                GL
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Profili tamamla</h2>
              <p className="mt-2 text-sm text-white/70">
                Sepete urun eklemek icin ad, soyad ve telefon bilgilerini eklemelisin.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white/80">
                    Ad
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    placeholder="Adiniz"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white/80">
                    Soyad
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    placeholder="Soyadiniz"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white/80">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                    placeholder="05xx xxx xx xx"
                  />
                </div>
              </div>

              {error && <div className="form-alert form-alert--error">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary w-full"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Profili kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}



