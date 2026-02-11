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
  notificationPrefs?: {
    emailNotify: boolean;
    inAppNotify: boolean;
    promoNotify: boolean;
    priceDropNotify: boolean;
    stockNotify: boolean;
    newsletter: boolean;
  } | null;
  addresses: Address[];
};

type ReturnRequestItem = {
  id: string;
  orderId: string;
  itemName: string | null;
  status: 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return '';
}

const returnStatusLabel: Record<ReturnRequestItem['status'], string> = {
  NEW: 'Talep alındı',
  UNDER_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  REFUNDED: 'İade tamamlandı',
};

const returnStatusTone: Record<ReturnRequestItem['status'], string> = {
  NEW: 'bg-slate-100 text-slate-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-indigo-100 text-indigo-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  REFUNDED: 'bg-indigo-100 text-indigo-800',
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

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
    priceDropNotify: true,
    stockNotify: true,
    newsletter: false,
    language: 'TR',
    theme: 'system',
    fontScale: 'md',
    loginAlerts: true,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [prefsReady, setPrefsReady] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsError, setPrefsError] = useState('');
  const [returnRequests, setReturnRequests] = useState<ReturnRequestItem[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnsError, setReturnsError] = useState('');

  useEffect(() => {
    if (!prefsReady) return;
    setPrefsSaving(true);
    setPrefsError('');
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/profile/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prefs: {
            emailNotify: prefs.emailNotify,
            inAppNotify: prefs.inAppNotify,
            promoNotify: prefs.promoNotify,
            priceDropNotify: prefs.priceDropNotify,
            stockNotify: prefs.stockNotify,
            newsletter: prefs.newsletter,
            },
          }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) {
          throw new Error(data.error || 'Bildirim tercihleri kaydedilemedi');
        }
      } catch (e: unknown) {
        setPrefsError(getErrorMessage(e) || 'Bildirim tercihleri kaydedilemedi');
      } finally {
        setPrefsSaving(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [prefs, prefsReady]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?next=${encodeURIComponent('/profile')}`);
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
          throw new Error(data.error || 'Profil bilgileri alınamadı');
        }

        const user: ProfileUser | null = data.user ?? null;
        setProfile(user);

        if (user) {
          setFirstName(user.firstName ?? '');
          setLastName(user.lastName ?? '');
          setPhone(user.phone ?? '');
          setTwoFactorEnabled(Boolean(user.twoFactorEnabled));
          if (user.notificationPrefs) {
            setPrefs((prev) => ({
              ...prev,
              ...user.notificationPrefs,
            }));
          }
          setPrefsReady(true);

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
        setLoadError(getErrorMessage(e) || 'Profil bilgileri alınamadı');
      }
    };

    load();
  }, [status]);

  useEffect(() => {
    const loadReturns = async () => {
      if (status !== 'authenticated') return;
      setReturnsLoading(true);
      setReturnsError('');
      try {
        const res = await fetch('/api/profile/returns');
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) {
          throw new Error(data.error || 'İade talepleri alınamadı');
        }
        setReturnRequests(data.items ?? []);
      } catch (e: unknown) {
        setReturnsError(getErrorMessage(e) || 'İade talepleri alınamadı');
      } finally {
        setReturnsLoading(false);
      }
    };

    loadReturns();
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
        throw new Error(data.error || 'Profil güncellenemedi');
      }

      setSaveSuccess('Profil güncellendi');
      if (data.user) {
        setProfile((p) => (p ? { ...p, ...data.user, addresses: data.addresses ?? p.addresses } : data.user));
      }
    } catch (e: unknown) {
      setSaveError(getErrorMessage(e) || 'Profil güncellenemedi');
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
        throw new Error(data.error || 'İki adımlı doğrulama güncellenemedi');
      }

      setTwoFactorEnabled(next);
    } catch (e: unknown) {
      setTwoFactorError(getErrorMessage(e) || 'İki adımlı doğrulama güncellenemedi');
    } finally {
      setTwoFactorSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white/70">
        Yükleniyor...
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
          savedNote: 'Saved to your account',
          securityNote: 'Saved on your account',
          support: 'Support',
          quote: 'Request quote',
          billingTitle: 'Billing details',
          billingBody: 'Keep invoice details up to date.',
          companyName: 'Company name',
          taxOffice: 'Tax office',
          taxNumber: 'Tax number',
          eInvoice: 'E-invoice',
          privacyTitle: 'Privacy',
          privacyBody: 'Control profile visibility and data sharing.',
          publicProfile: 'Public profile',
          orderVisibility: 'Order visibility',
        }
      : {
          summaryTitle: 'Durum Özeti',
          profileStatus: 'Profil tamamlama',
          addressStatus: 'Adres durumu',
          membership: 'Üyeliği',
          statusReady: 'Hazır',
          statusMissing: 'Eksik',
          addressReady: 'Kayıtlı',
          addressMissing: 'Yok',
          securityTitle: 'Hesap güvenliği',
          securityBody: 'Şifreni düzenli değiştir, tanınmayan cihazlarda oturum açma.',
          twoFactor: 'İki adımlı doğrulama',
          sessionTracking: 'Oturum takibi',
          loginAlerts: 'Giriş bildirimleri',
          notifyTitle: 'Bildirim tercihleri',
          notifyBody: 'Sipariş durumlari ve kampanyalar icin bildirim ayarlarını düzenle.',
          emailNotify: 'E-posta',
          inAppNotify: 'Site içi',
          promoNotify: 'Kampanya bildirimi',
          priceDropNotify: 'Fiyat düşüşü',
          stockNotify: 'Stok bildirimi',
          newsletter: 'Bülten',
          prefsTitle: 'Tercihler',
          prefsBody: 'Dil, görünüm ve hesap senkronu ayarları.',
          language: 'Varsayılan dil',
          theme: 'Tema',
          themeSystem: 'Sistem',
          themeLight: 'Aydınlık',
          themeDark: 'Koyu',
          fontScale: 'Yazı boyutu',
          fontSmall: 'Küçük',
          fontMedium: 'Orta',
          fontLarge: 'Büyük',
          sync: 'Hesap senkronu',
          on: 'Açık',
          off: 'Kapalı',
          savedNote: 'Hesabında kaydedilir',
          securityNote: 'Hesabında kaydedilir',
          support: 'Destek al',
          quote: 'Teklif iste',
          billingTitle: 'Fatura bilgileri',
          billingBody: 'Fatura ve e-arşiv bilgilerini güncelle.',
          companyName: 'Firma adi',
          taxOffice: 'Vergi dairesi',
          taxNumber: 'Vergi numarasi',
          eInvoice: 'E-fatura',
          privacyTitle: 'Gizlilik',
          privacyBody: 'Profil görünurluğu ve veri paylaşımı ayarları.',
          publicProfile: 'Profil görünürlüğü',
          orderVisibility: 'Sipariş görünürlüğü',
        };
  const roleLabel = (session.user as SessionUserWithRole).role === 'ADMIN'
    ? 'Admin'
    : prefs.language === 'EN'
      ? 'Customer'
      : 'Müşteri';
  const hasAddress = showAddress;

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-10 sm:px-8 dark:bg-slate-950 dark:text-slate-200 dark:[&_.bg-white]:bg-slate-900/70 dark:[&_[class*='border-slate-200/70']]:border-white/10 dark:[&_.text-slate-900]:text-white dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400">
      <div className="mx-auto max-w-6xl space-y-10">
      <div className="relative overflow-hidden rounded-[36px] border border-slate-900/10 bg-slate-950 px-6 py-8 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
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
              <h1 className="text-2xl font-semibold">{userName || 'Hesabım'}</h1>
              <div className="mt-1 text-sm text-white/70">
                {profile?.email ?? session.user.email ?? ''} • {roleLabel}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                profileComplete ? 'bg-indigo-400/20 text-indigo-200' : 'bg-yellow-400/20 text-yellow-100'
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
              Siparişlerim
            </Link>
          </div>
        </div>
        <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-200">Profil durumu</div>
            <div className="mt-2 text-sm font-semibold text-white">{profileComplete ? 'Hazır' : 'Eksik bilgiler var'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-200">Adres durumu</div>
            <div className="mt-2 text-sm font-semibold text-white">{hasAddress ? 'Kayıtlı adres var' : 'Adres eklenmedi'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
            <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-200">Üyeliği</div>
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
          <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="text-sm font-semibold text-slate-900">Hızlı erişim</div>
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
                Siparişlerim
              </Link>
              <Link
                href="/profile/addresses"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Adreslerim
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-white/5">
            <div>
              <div className="text-sm font-semibold text-slate-900">Kişisel bilgiler</div>
              <div className="mt-1 text-sm text-slate-600">Hesap bilgilerini güncelle</div>
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
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  isSaving ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isSaving ? 'Kaydediliyor...' : 'Degisiklikleri kaydet'}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">İade taleplerim</div>
                <div className="mt-1 text-sm text-slate-600">Güncel iade durumlarını buradan izle.</div>
              </div>
              <Link
                href="/returns-request"
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 hover:border-slate-300 hover:text-slate-900"
              >
                Yeni talep
              </Link>
            </div>

            {returnsError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {returnsError}
              </div>
            ) : null}

            {returnsLoading ? (
              <div className="mt-4 text-sm text-slate-500">Yükleniyor...</div>
            ) : returnRequests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                Henüz iade talebiniz yok.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {returnRequests.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Talep #{item.id.slice(0, 8)}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">
                          {item.itemName || 'Ürün bilgisi bulunamadı'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">Siparis: {item.orderId}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${returnStatusTone[item.status]}`}>
                        {returnStatusLabel[item.status]}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Son guncelleme: {formatShortDate(item.updatedAt)}
                    </div>
                    {item.adminNote ? (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Not:</span> {item.adminNote}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="text-sm font-semibold text-slate-900">{copy.securityTitle}</div>
          <p className="mt-2 text-sm text-slate-600">{copy.securityBody}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={handleTwoFactorToggle}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.twoFactor}</span>
              <span className={`font-semibold ${twoFactorEnabled ? 'text-indigo-700' : 'text-slate-500'}`}>
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
              <span className={`font-semibold ${prefs.loginAlerts ? 'text-indigo-700' : 'text-slate-500'}`}>
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
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="text-sm font-semibold text-slate-900">{copy.notifyTitle}</div>
          <p className="mt-2 text-sm text-slate-600">{copy.notifyBody}</p>
          {prefsError && <div className="mt-2 text-xs text-red-600">{prefsError}</div>}
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, emailNotify: !prev.emailNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.emailNotify}</span>
              <span className={`font-semibold ${prefs.emailNotify ? 'text-indigo-700' : 'text-slate-500'}`}>
                {prefs.emailNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, inAppNotify: !prev.inAppNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.inAppNotify}</span>
              <span className={`font-semibold ${prefs.inAppNotify ? 'text-indigo-700' : 'text-slate-500'}`}>
                {prefs.inAppNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, promoNotify: !prev.promoNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.promoNotify}</span>
              <span className={`font-semibold ${prefs.promoNotify ? 'text-indigo-700' : 'text-slate-500'}`}>
                {prefs.promoNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, priceDropNotify: !prev.priceDropNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.priceDropNotify}</span>
              <span className={`font-semibold ${prefs.priceDropNotify ? 'text-indigo-700' : 'text-slate-500'}`}>
                {prefs.priceDropNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, stockNotify: !prev.stockNotify }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.stockNotify}</span>
              <span className={`font-semibold ${prefs.stockNotify ? 'text-indigo-700' : 'text-slate-500'}`}>
                {prefs.stockNotify ? copy.on : copy.off}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPrefs((prev) => ({ ...prev, newsletter: !prev.newsletter }))}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span>{copy.newsletter}</span>
              <span className={`font-semibold ${prefs.newsletter ? 'text-indigo-700' : 'text-slate-500'}`}>
                {prefs.newsletter ? copy.on : copy.off}
              </span>
            </button>
          </div>
          <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            {prefsSaving ? 'Kaydediliyor...' : copy.savedNote}
          </div>
        </div>
      </div>

      {saveError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>}
      {saveSuccess && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">
          {saveSuccess}
        </div>
      )}
      </div>
    </div>
  );
}



