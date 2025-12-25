'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type SessionUserWithRole = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type Address = {
  id: string;
  label: string | null;
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isDefault: boolean;
};

type ProfileUser = {
  id: string;
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  addresses: Address[];
};

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return '';
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Turkiye');
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const load = async () => {
      if (status !== 'authenticated') return;
      setLoadError('');

      try {
        const res = await fetch('/api/profile');
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          throw new Error(data.error || 'Profil bilgileri alinamadi');
        }

        const user: ProfileUser | null = data.user ?? null;
        setProfile(user);

        if (user) {
          setFirstName(user.firstName ?? '');
          setLastName(user.lastName ?? '');
          setPhone(user.phone ?? '');

          const def = user.addresses?.find((a) => a.isDefault) ?? user.addresses?.[0];
          setAddressLine1(def?.line1 ?? '');
          setAddressLine2(def?.line2 ?? '');
          setCity(def?.city ?? '');
          setState(def?.state ?? '');
          setPostalCode(def?.postalCode ?? '');
          setCountry(def?.country ?? 'Turkiye');

          const hasAnyAddress = Boolean(
            def?.line1 || def?.line2 || def?.city || def?.state || def?.postalCode || def?.country
          );
          setShowAddress(hasAnyAddress);
        }
      } catch (e: unknown) {
        setLoadError(getErrorMessage(e) || 'Profil bilgileri alinamadi');
      }
    };

    load();
  }, [status]);

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');
    setIsSaving(true);

    try {
      const addressPayload = showAddress
        ? {
            label: 'Varsayilan',
            fullName: `${firstName} ${lastName}`.trim(),
            phone,
            line1: addressLine1,
            line2: addressLine2,
            city,
            state,
            postalCode,
            country,
          }
        : null;

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address: addressPayload,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || 'Profil guncellenemedi');
      }

      setSaveSuccess('Profil guncellendi');
      if (data.user) {
        setProfile((p) => (p ? { ...p, ...data.user, addresses: data.addresses ?? p.addresses } : data.user));
      }
    } catch (e: unknown) {
      setSaveError(getErrorMessage(e) || 'Profil guncellenemedi');
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

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                  {(profile?.firstName?.[0] || session.user.name?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hesabim</h1>
                  <div className="mt-1 text-sm text-gray-600">
                    {profile?.email ?? session.user.email ?? ''}
                    {(session.user as SessionUserWithRole).role === 'ADMIN' ? ' - Admin' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loadError && (
            <div className="mt-4 text-red-600 text-sm p-2 bg-red-50 rounded-md">{loadError}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Kisisel Bilgiler</div>
                  <div className="mt-1 text-sm text-gray-500">Hesap bilgilerini guncelle</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="pfFirstName">Ad</label>
                  <input
                    id="pfFirstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="pfLastName">Soyad</label>
                  <input
                    id="pfLastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="pfEmail">E-posta</label>
                  <input
                    id="pfEmail"
                    type="email"
                    value={profile?.email ?? session.user.email ?? ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm sm:text-sm text-gray-700 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="pfPhone">Telefon</label>
                  <input
                    id="pfPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="mt-1 text-sm text-gray-500">
                    Adres bilgilerini istersen ekleyebilirsin (siparis asamasinda da alinabilir).
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSaving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
                </button>
              </div>
            </div>

            {/* Addresses moved to /profile/addresses page */}
          </div>

          {saveError && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">{saveError}</div>
          )}
          {saveSuccess && (
            <div className="text-green-700 text-sm p-2 bg-green-50 rounded-md">{saveSuccess}</div>
          )}
        </div>
      </div>
    </div>
  );
}
