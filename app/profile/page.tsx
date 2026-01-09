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
  twoFactorEnabled: boolean;
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
    smsNotify: false,
    priceDropNotify: true,
    stockNotify: true,
    newsletter: false,
    language: 'TR',
    theme: 'system',
    fontScale: 'md',
    loginAlerts: true,
  });
  const [extras, setExtras] = useState({
    companyName: '',
    taxOffice: '',
    taxNumber: '',
    eInvoice: false,
    deliveryNote: '',
    weekendDelivery: false,
    callBeforeDelivery: true,
    leaveAtDoor: false,
    showProfile: true,
    showOrders: true,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');

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
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('profileExtras');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<typeof extras>;
      setExtras((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore malformed local storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('profileExtras', JSON.stringify(extras));
  }, [extras]);

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
          setTwoFactorEnabled(Boolean(user.twoFactorEnabled));

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

  const handleTwoFactorToggle = async () => {
    if (twoFactorSaving) return;
    setTwoFactorError('');
    setTwoFactorSaving(true);
    const next = !twoFactorEnabled;

    try {
      const res = await fetch('/api/profile/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || 'Iki adimli dogrulama guncellenemedi');
      }

      setTwoFactorEnabled(next);
    } catch (e: unknown) {
      setTwoFactorError(getErrorMessage(e) || 'Iki adimli dogrulama guncellenemedi');
    } finally {
      setTwoFactorSaving(false);
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
          loginAlerts: 'Login alerts',
          notifyTitle: 'Notifications',
          notifyBody: 'Manage order updates and campaign alerts.',
          emailNotify: 'Email',
          inAppNotify: 'In-app',
          promoNotify: 'Promotions',
          smsNotify: 'SMS',
          priceDropNotify: 'Price drop',
          stockNotify: 'Stock alerts',
          newsletter: 'Newsletter',
          prefsTitle: 'Preferences',
          prefsBody: 'Language and account sync settings.',
          language: 'Default language',
          theme: 'Theme',
          themeSystem: 'System',
          themeLight: 'Light',
          themeDark: 'Dark',
          fontScale: 'Text size',
          fontSmall: 'Small',
          fontMedium: 'Medium',
          fontLarge: 'Large',
          sync: 'Account sync',
          on: 'On',
          off: 'Off',
          savedNote: 'Saved on this device',
          securityNote: 'Saved on your account',
          support: 'Support',
          quote: 'Request quote',
          billingTitle: 'Billing details',
          billingBody: 'Keep invoice details up to date.',
          companyName: 'Company name',
          taxOffice: 'Tax office',
          taxNumber: 'Tax number',
          eInvoice: 'E-invoice',
          deliveryTitle: 'Delivery preferences',
          deliveryBody: 'Customize delivery instructions.',
          deliveryNote: 'Delivery note',
          weekendDelivery: 'Weekend delivery',
          callBeforeDelivery: 'Call before delivery',
          leaveAtDoor: 'Leave at door',
          privacyTitle: 'Privacy',
          privacyBody: 'Control profile visibility and data sharing.',
          publicProfile: 'Public profile',
          orderVisibility: 'Order visibility',
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
          loginAlerts: 'Giris bildirimleri',
          notifyTitle: 'Bildirim tercihleri',
          notifyBody: 'Siparis durumlari ve kampanyalar icin bildirim ayarlarini duzenle.',
          emailNotify: 'E-posta',
          inAppNotify: 'Site ici',
          promoNotify: 'Kampanya bildirimi',
          smsNotify: 'SMS',
          priceDropNotify: 'Fiyat dususu',
          stockNotify: 'Stok bildirimi',
          newsletter: 'Bulten',
          prefsTitle: 'Tercihler',
          prefsBody: 'Dil, gorunum ve hesap senkronu ayarlari.',
          language: 'Varsayilan dil',
          theme: 'Tema',
          themeSystem: 'Sistem',
          themeLight: 'Aydinlik',
          themeDark: 'Koyu',
          fontScale: 'Yazi boyutu',
          fontSmall: 'Kucuk',
          fontMedium: 'Orta',
          fontLarge: 'Buyuk',
          sync: 'Hesap senkronu',
          on: 'Acik',
          off: 'Kapali',
          savedNote: 'Bu cihazda kaydedilir',
          securityNote: 'Hesabinda kaydedilir',
          support: 'Destek al',
          quote: 'Teklif iste',
          billingTitle: 'Fatura bilgileri',
          billingBody: 'Fatura ve e-arsiv bilgilerini guncelle.',
          companyName: 'Firma adi',
          taxOffice: 'Vergi dairesi',
          taxNumber: 'Vergi numarasi',
          eInvoice: 'E-fatura',
          deliveryTitle: 'Teslimat tercihleri',
          deliveryBody: 'Teslimat notu ve dagitim tercihleri.',
          deliveryNote: 'Teslimat notu',
          weekendDelivery: 'Hafta sonu teslimat',
          callBeforeDelivery: 'Teslimat once ara',
          leaveAtDoor: 'Kapida birak',
          privacyTitle: 'Gizlilik',
          privacyBody: 'Profil gorunurlugu ve veri paylasimi ayarlari.',
          publicProfile: 'Profil gorunurlugu',
          orderVisibility: 'Siparis gorunurlugu',
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

        <div className="space-y-6">
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

          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
            <div className="text-sm font-semibold text-slate-900">{copy.billingTitle}</div>
            <p className="mt-1 text-sm text-slate-600">{copy.billingBody}</p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pfCompany">
                  {copy.companyName}
                </label>
                <input
                  id="pfCompany"
                  type="text"
                  value={extras.companyName}
                  onChange={(e) => setExtras((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pfTaxOffice">
                  {copy.taxOffice}
                </label>
                <input
                  id="pfTaxOffice"
                  type="text"
                  value={extras.taxOffice}
                  onChange={(e) => setExtras((prev) => ({ ...prev, taxOffice: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pfTaxNumber">
                  {copy.taxNumber}
                </label>
                <input
                  id="pfTaxNumber"
                  type="text"
                  value={extras.taxNumber}
                  onChange={(e) => setExtras((prev) => ({ ...prev, taxNumber: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <button
                type="button"
                onClick={() => setExtras((prev) => ({ ...prev, eInvoice: !prev.eInvoice }))}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                <span>{copy.eInvoice}</span>
                <span className={`text-xs ${extras.eInvoice ? 'text-teal-700' : 'text-slate-500'}`}>
                  {extras.eInvoice ? copy.on : copy.off}
                </span>
              </button>
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">{copy.savedNote}</div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
            <div className="text-sm font-semibold text-slate-900">{copy.deliveryTitle}</div>
            <p className="mt-1 text-sm text-slate-600">{copy.deliveryBody}</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="pfDeliveryNote">
                  {copy.deliveryNote}
                </label>
                <textarea
                  id="pfDeliveryNote"
                  rows={3}
                  value={extras.deliveryNote}
                  onChange={(e) => setExtras((prev) => ({ ...prev, deliveryNote: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setExtras((prev) => ({ ...prev, weekendDelivery: !prev.weekendDelivery }))}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  <span>{copy.weekendDelivery}</span>
                  <span className={extras.weekendDelivery ? 'text-teal-700' : 'text-slate-500'}>
                    {extras.weekendDelivery ? copy.on : copy.off}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtras((prev) => ({ ...prev, callBeforeDelivery: !prev.callBeforeDelivery }))}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  <span>{copy.callBeforeDelivery}</span>
                  <span className={extras.callBeforeDelivery ? 'text-teal-700' : 'text-slate-500'}>
                    {extras.callBeforeDelivery ? copy.on : copy.off}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExtras((prev) => ({ ...prev, leaveAtDoor: !prev.leaveAtDoor }))}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  <span>{copy.leaveAtDoor}</span>
                  <span className={extras.leaveAtDoor ? 'text-teal-700' : 'text-slate-500'}>
                    {extras.leaveAtDoor ? copy.on : copy.off}
                  </span>
                </button>
              </div>
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">{copy.savedNote}</div>
          </div>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-xl">
          <div className="text-sm font-semibold text-slate-900">{copy.securityTitle}</div>
          <p className="mt-2 text-sm text-slate-600">{copy.securityBody}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={handleTwoFactorToggle}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.twoFactor}</span>
              <span className={`font-semibold ${twoFactorEnabled ? 'text-teal-700' : 'text-slate-500'}`}>
                {twoFactorSaving ? '...' : twoFactorEnabled ? copy.on : copy.off}
              </span>
            </button>
            {twoFactorError && <div className="text-xs text-red-600">{twoFactorError}</div>}
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.loginAlerts}</span>
              <span className={`font-semibold ${prefs.loginAlerts ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.loginAlerts ? copy.on : copy.off}
              </span>
            </button>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span>{copy.sessionTracking}</span>
              <span className="font-semibold text-slate-700">{copy.on}</span>
            </div>
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">{copy.securityNote}</div>
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
              onClick={() => setPrefs((prev) => ({ ...prev, smsNotify: !prev.smsNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.smsNotify}</span>
              <span className={`font-semibold ${prefs.smsNotify ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.smsNotify ? copy.on : copy.off}
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
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, priceDropNotify: !prev.priceDropNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.priceDropNotify}</span>
              <span className={`font-semibold ${prefs.priceDropNotify ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.priceDropNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, stockNotify: !prev.stockNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.stockNotify}</span>
              <span className={`font-semibold ${prefs.stockNotify ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.stockNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, newsletter: !prev.newsletter }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.newsletter}</span>
              <span className={`font-semibold ${prefs.newsletter ? 'text-teal-700' : 'text-slate-500'}`}>
                {prefs.newsletter ? copy.on : copy.off}
              </span>
            </button>
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">{copy.savedNote}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-xl">
          <div className="text-sm font-semibold text-slate-900">{copy.privacyTitle}</div>
          <p className="mt-2 text-sm text-slate-600">{copy.privacyBody}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => setExtras((prev) => ({ ...prev, showProfile: !prev.showProfile }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.publicProfile}</span>
              <span className={`font-semibold ${extras.showProfile ? 'text-teal-700' : 'text-slate-500'}`}>
                {extras.showProfile ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setExtras((prev) => ({ ...prev, showOrders: !prev.showOrders }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.orderVisibility}</span>
              <span className={`font-semibold ${extras.showOrders ? 'text-teal-700' : 'text-slate-500'}`}>
                {extras.showOrders ? copy.on : copy.off}
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
              <span>{copy.theme}</span>
              <select
                value={prefs.theme}
                onChange={(e) => setPrefs((prev) => ({ ...prev, theme: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
              >
                <option value="system">{copy.themeSystem}</option>
                <option value="light">{copy.themeLight}</option>
                <option value="dark">{copy.themeDark}</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span>{copy.fontScale}</span>
              <select
                value={prefs.fontScale}
                onChange={(e) => setPrefs((prev) => ({ ...prev, fontScale: e.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
              >
                <option value="sm">{copy.fontSmall}</option>
                <option value="md">{copy.fontMedium}</option>
                <option value="lg">{copy.fontLarge}</option>
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


