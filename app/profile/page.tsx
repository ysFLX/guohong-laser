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
  const [prefs, setPrefs] = useState({
    emailNotify: true,
    inAppNotify: true,
    promoNotify: false,
    twoFactor: false,
    language: 'TR',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('profilePrefs');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<typeof prefs>;
      setPrefs((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore malformed local storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('profilePrefs', JSON.stringify(prefs));
  }, [prefs]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white/70">
        Yukleniyor...
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  const profileComplete = (session.user as SessionUserWithRole).profileComplete;
  const avatarUrl = profile?.image ?? session.user.image ?? null;
  const copy =
    prefs.language === 'EN'
      ? {
          summaryTitle: 'Account summary',
          profileStatus: 'Profile status',
          addressStatus: 'Address status',
          membership: 'Membership',
          statusReady: 'Ready',
          statusMissing: 'Missing',
          addressReady: 'Saved',
          addressMissing: 'None',
          securityTitle: 'Security',
          securityBody: 'Change your password regularly, avoid unknown devices.',
          twoFactor: 'Two-factor auth',
          sessionTracking: 'Session tracking',
          notifyTitle: 'Notifications',
          notifyBody: 'Manage order updates and campaign alerts.',
          emailNotify: 'Email',
          inAppNotify: 'In-app',
          promoNotify: 'Promotions',
          prefsTitle: 'Preferences',
          prefsBody: 'Language and account sync settings.',
          language: 'Default language',
          sync: 'Account sync',
          on: 'On',
          off: 'Off',
          savedNote: 'Saved on this device',
          support: 'Support',
          quote: 'Request quote',
        }
      : {
          summaryTitle: 'Durum ozeti',
          profileStatus: 'Profil tamamlama',
          addressStatus: 'Adres durumu',
          membership: 'Uyeligi',
          statusReady: 'Hazir',
          statusMissing: 'Eksik',
          addressReady: 'Kayitli',
          addressMissing: 'Yok',
          securityTitle: 'Hesap guvenligi',
          securityBody: 'Sifreni duzenli degistir, taninmayan cihazlarda oturum acma.',
          twoFactor: 'Iki adimli dogrulama',
          sessionTracking: 'Oturum takibi',
          notifyTitle: 'Bildirim tercihleri',
          notifyBody: 'Siparis durumlari ve kampanyalar icin bildirim ayarlarini duzenle.',
          emailNotify: 'E-posta',
          inAppNotify: 'Site ici',
          promoNotify: 'Kampanya bildirimi',
          prefsTitle: 'Tercihler',
          prefsBody: 'Dil, gorunum ve hesap senkronu ayarlari.',
          language: 'Varsayilan dil',
          sync: 'Hesap senkronu',
          on: 'Acik',
          off: 'Kapali',
          savedNote: 'Bu cihazda kaydedilir',
          support: 'Destek al',
          quote: 'Teklif iste',
        };
  const roleLabel = (session.user as SessionUserWithRole).role === 'ADMIN'
    ? 'Admin'
    : prefs.language === 'EN'
      ? 'Customer'
      : 'Musteri';
  const hasAddress = showAddress;

  return (
    <div className="min-h-screen space-y-10">
      <div className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.35),_transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.3))]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 text-white flex items-center justify-center font-semibold text-lg overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Profil fotografi" className="h-full w-full object-cover" />
              ) : (
                (profile?.firstName?.[0] || session.user.name?.[0] || 'U').toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{userName || 'Hesabim'}</h1>
              <div className="mt-1 text-sm text-white/70">
                {profile?.email ?? session.user.email ?? ''} • {roleLabel}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                profileComplete ? 'bg-teal-400/20 text-teal-200' : 'bg-yellow-400/20 text-yellow-100'
              }`}
            >
              {profileComplete ? 'Profil tamam' : 'Profil eksik'}
            </span>
            <Link
              href="/profile/addresses"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/60"
            >
              Adreslerim
            </Link>
            <Link
              href="/profile/orders"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/60"
            >
              Siparislerim
            </Link>
          </div>
        </div>
        <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            <div className="text-[10px] uppercase tracking-[0.2em] text-teal-200">Profil durumu</div>
            <div className="mt-2 text-sm font-semibold text-white">{profileComplete ? 'Hazir' : 'Eksik bilgiler var'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            <div className="text-[10px] uppercase tracking-[0.2em] text-teal-200">Adres durumu</div>
            <div className="mt-2 text-sm font-semibold text-white">{hasAddress ? 'Kayitli adres var' : 'Adres eklenmedi'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            <div className="text-[10px] uppercase tracking-[0.2em] text-teal-200">Uyeligi</div>
            <div className="mt-2 text-sm font-semibold text-white">{roleLabel}</div>
          </div>
        </div>
      </div>

      {loadError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <ProfileAvatarUploader
            imageUrl={avatarUrl}
            onUpdated={(url) => setProfile((p) => (p ? { ...p, image: url } : p))}
          />
          <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-xl">
            <div className="text-sm font-semibold text-slate-900">Hizli erisim</div>
            <div className="mt-3 grid gap-2">
              <Link
                href="/profile/favorites"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Favorilerim
              </Link>
              <Link
                href="/profile/orders"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Siparislerim
              </Link>
              <Link
                href="/profile/addresses"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Adreslerim
              </Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-xl">
            <div className="text-sm font-semibold text-slate-900">{copy.summaryTitle}</div>
            <div className="mt-3 grid gap-3 text-xs text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span>{copy.profileStatus}</span>
                <span className="font-semibold text-slate-900">{profileComplete ? copy.statusReady : copy.statusMissing}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span>{copy.addressStatus}</span>
                <span className="font-semibold text-slate-900">{hasAddress ? copy.addressReady : copy.addressMissing}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span>{copy.membership}</span>
                <span className="font-semibold text-slate-900">{roleLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div>
            <div className="text-sm font-semibold text-slate-900">Kisisel bilgiler</div>
            <div className="mt-1 text-sm text-slate-600">Hesap bilgilerini guncelle</div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="pfFirstName">
                Ad
              </label>
              <input
                id="pfFirstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="pfLastName">
                Soyad
              </label>
              <input
                id="pfLastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="pfEmail">
                E-posta
              </label>
              <input
                id="pfEmail"
                type="email"
                value={profile?.email ?? session.user.email ?? ''}
                disabled
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="pfPhone">
                Telefon
              </label>
              <input
                id="pfPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                isSaving ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isSaving ? 'Kaydediliyor...' : 'Degisiklikleri kaydet'}
            </button>
          </div>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-xl">
          <div className="text-sm font-semibold text-slate-900">{copy.securityTitle}</div>
          <p className="mt-2 text-sm text-slate-600">{copy.securityBody}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, twoFactor: !prev.twoFactor }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.twoFactor}</span>
              <span className={`font-semibold ${prefs.twoFactor ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.twoFactor ? copy.on : copy.off}
              </span>
            </button>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span>{copy.sessionTracking}</span>
              <span className="font-semibold text-slate-700">{copy.on}</span>
            </div>
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">{copy.savedNote}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-xl">
          <div className="text-sm font-semibold text-slate-900">{copy.notifyTitle}</div>
          <p className="mt-2 text-sm text-slate-600">{copy.notifyBody}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, emailNotify: !prev.emailNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.emailNotify}</span>
              <span className={`font-semibold ${prefs.emailNotify ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.emailNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, inAppNotify: !prev.inAppNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.inAppNotify}</span>
              <span className={`font-semibold ${prefs.inAppNotify ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.inAppNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, promoNotify: !prev.promoNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.promoNotify}</span>
              <span className={`font-semibold ${prefs.promoNotify ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.promoNotify ? copy.on : copy.off}
              </span>
            </button>
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">{copy.savedNote}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-xl">
          <div className="text-sm font-semibold text-slate-900">{copy.prefsTitle}</div>
          <p className="mt-2 text-sm text-slate-600">{copy.prefsBody}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span>{copy.language}</span>
              <select
                value={prefs.language}
                onChange={(e) => setPrefs((prev) => ({ ...prev, language: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
              >
                <option value="TR">TR</option>
                <option value="EN">EN</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span>{copy.sync}</span>
              <span className="font-semibold text-slate-700">{copy.on}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link href="/contact" className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-slate-300">
              {copy.support}
            </Link>
            <Link href="/quote" className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-slate-300">
              {copy.quote}
            </Link>
          </div>
        </div>
      </div>

      {saveError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>}
      {saveSuccess && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700">
          {saveSuccess}
        </div>
      )}
    </div>
  );
}


