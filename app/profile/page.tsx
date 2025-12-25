'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import ProfileAvatarUploader from '@/components/profile/ProfileAvatarUploader';
type SessionUserWithRole = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  profileComplete?: boolean;
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
  image: string | null;
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

  const userName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  const profileComplete = (session.user as SessionUserWithRole).profileComplete;
  const avatarUrl = profile?.image ?? session.user.image ?? null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-lg overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Profil fotografi" className="h-full w-full object-cover" />
                  ) : (
                    (profile?.firstName?.[0] || session.user.name?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{userName || 'Hesabim'}</h1>
                  <div className="mt-1 text-sm text-gray-600">
                    {profile?.email ?? session.user.email ?? ''}
                    {(session.user as SessionUserWithRole).role === 'ADMIN' ? ' · Admin' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    profileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {profileComplete ? 'Profil tamam' : 'Profil eksik'}
                </span>
                <Link
                  href="/profile/addresses"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-900 hover:bg-gray-50"
                >
                  Adreslerim
                </Link>
              </div>
            </div>
          </div>

          {loadError && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded-md">{loadError}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Kisisel Bilgiler</div>
                  <div className="mt-1 text-sm text-gray-500">Hesap bilgilerini guncelle</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-4">
              <ProfileAvatarUploader
                imageUrl={avatarUrl}
                onUpdated={(url) => setProfile((p) => (p ? { ...p, image: url } : p))}
              />
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-900">Hizli Erisim</div>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <Link
                    href="/profile/favorites"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Favorilerim
                  </Link>
                  <Link
                    href="/profile/orders"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Siparislerim
                  </Link>
                  <Link
                    href="/profile/addresses"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Adreslerim
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-900">Profil Durumu</div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <div>Ad: {firstName || '-'}</div>
                  <div>Soyad: {lastName || '-'}</div>
                  <div>Telefon: {phone || '-'}</div>
                </div>
              </div>
            </div>
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
