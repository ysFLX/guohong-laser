'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function sanitizeNext(value: string | null) {
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  if (value.includes('://')) return null;
  return value;
}

const highlights = [
  'Kurumsal erişim katmanı',
  'Canlı sipariş ritmi takibi',
  '2FA + kurumsal güvenlik duvarı',
];

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const resetDone = searchParams.get('reset') === 'true';
  const next = sanitizeNext(searchParams.get('next')) || '/';
  const registerHref = next === '/' ? '/register' : `/register?next=${encodeURIComponent(next)}`;
  const isOtpStep = step === 'otp';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        ...(isOtpStep ? { otp } : {}),
      });

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          setStep('otp');
          setInfo('Doğrulama kodu e-posta adresinize gönderildi. Kod 10 dakika geçerlidir.');
        } else if (result.error === '2FA_INVALID') {
          setError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
        } else if (result.error === '2FA_EXPIRED') {
          setError('Kodun süresi doldu. Yeni kod talep edin.');
        } else if (result.error === '2FA_SEND_FAILED') {
          setError('Kod gönderilemedi. E-posta ayarlarınızı kontrol edin.');
        } else {
          setError('Geçersiz e-posta veya şifre');
        }
      } else {
        router.replace(next);
        router.refresh();
      }
    } catch (submitError) {
      console.error('Giriş hatası:', submitError);
      setError('Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !password) {
      setError('Kodu tekrar göndermek için e-posta ve şifre gerekli.');
      return;
    }

    setError('');
    setInfo('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error === '2FA_REQUIRED') {
        setInfo('Yeni kod e-posta adresinize gönderildi.');
      } else if (result?.error) {
        setError('Kod tekrar gönderilemedi. Lütfen daha sonra deneyin.');
      }
    } catch (resendError) {
      console.error('Kod gönderme hatası:', resendError);
      setError('Kod gönderilemedi. Lütfen daha sonra deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070707] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,210,120,0.2),transparent_38%),radial-gradient(circle_at_85%_16%,rgba(175,140,86,0.22),transparent_42%),linear-gradient(130deg,#080808_18%,#111111_46%,#080808_84%)]" />
        <div className="absolute left-1/2 top-0 h-[540px] w-[540px] -translate-x-1/2 rounded-full border border-amber-100/10 bg-amber-200/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 rounded-[36px] border border-amber-100/20 bg-black/40 p-3 shadow-[0_40px_140px_rgba(0,0,0,0.85)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr] lg:p-6">
        <div className="lg:col-span-2 rounded-2xl border border-amber-200/40 bg-amber-300/20 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-50">
          Premium giriş paneli - 2026-02-17
        </div>
        <section className="relative hidden overflow-hidden rounded-[30px] border border-amber-100/20 bg-[linear-gradient(140deg,rgba(20,18,13,0.96)_0%,rgba(10,10,10,0.94)_45%,rgba(30,24,15,0.95)_100%)] p-9 lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full bg-amber-200/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl" />

          <span className="inline-flex w-fit items-center rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100">
            Özel kontrol paneli
          </span>

          <h1 className="mt-6 max-w-md text-[2.35rem] font-semibold leading-[1.08] text-amber-50">
            Giriş deneyimi artık net şekilde premium.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-amber-100/80">
            Sipariş, teklif ve teknik süreçleri yönettiğiniz panel için daha üst segment bir kurumsal arayüz oluşturuldu.
          </p>

          <div className="mt-9 grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-amber-100/20 bg-amber-100/5 px-4 py-3 text-sm text-amber-50">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-100/20 bg-black/30 p-4">
              <p className="text-2xl font-semibold text-amber-50">Kurum</p>
              <p className="mt-1 text-xs text-amber-100/70">Yeni kurumsal tema dili</p>
            </div>
            <div className="rounded-2xl border border-amber-100/20 bg-black/30 p-4">
              <p className="text-2xl font-semibold text-amber-50">2 Adım</p>
              <p className="mt-1 text-xs text-amber-100/70">Doğrulama akışı aktif</p>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-amber-200/25 bg-amber-200/10 p-4 text-sm text-amber-100">
            Tasarım dili: obsidyen yüzey + altın vurgu + yüksek kontrast.
          </div>
        </section>

        <section className="rounded-[30px] border border-amber-100/20 bg-[linear-gradient(160deg,rgba(16,14,10,0.96)_0%,rgba(10,10,10,0.94)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-amber-100/60">Kurumsal giriş</p>
              <h2 className="mt-2 text-3xl font-semibold text-amber-50">Hesabına giriş yap</h2>
              <p className="mt-2 text-sm text-amber-100/75">Yeni kurumsal panel deneyimi ile devam et.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-300 to-yellow-500 font-bold text-black shadow-[0_14px_30px_rgba(245,158,11,0.35)]">
              GL
            </div>
          </div>

          {(registered || resetDone) && (
            <div className="mt-6 space-y-3">
              {registered && <div className="form-alert form-alert--success">Kayıt tamamlandı. Şimdi giriş yapabilirsiniz.</div>}
              {resetDone && <div className="form-alert form-alert--success">Parolanız güncellendi. Şimdi giriş yapabilirsiniz.</div>}
            </div>
          )}

          <div className="mt-7">
            <button
              type="button"
              onClick={() =>
                signIn('google', {
                  callbackUrl: `/complete-profile?next=${encodeURIComponent(next)}`,
                })
              }
              className="w-full rounded-2xl border border-amber-100/30 bg-amber-100/10 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-100/20"
            >
              Google ile devam et
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-amber-100/45">
            <span className="h-px flex-1 bg-amber-100/20" />
            veya
            <span className="h-px flex-1 bg-amber-100/20" />
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-amber-100">
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isOtpStep}
                  className="block w-full rounded-2xl border border-amber-100/20 bg-black/35 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-amber-100">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isOtpStep}
                  className="block w-full rounded-2xl border border-amber-100/20 bg-black/35 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="********"
                />
              </div>

              {isOtpStep && (
                <div className="rounded-2xl border border-amber-200/35 bg-amber-200/10 p-4">
                  <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-amber-50">
                    Doğrulama kodu
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full rounded-xl border border-amber-100/30 bg-black/30 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"
                    placeholder="6 haneli kod"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-amber-100/90">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('credentials');
                        setOtp('');
                      }}
                      className="font-medium hover:text-white"
                    >
                      Bilgileri düzenle
                    </button>
                    <button type="button" onClick={handleResend} className="font-semibold hover:text-white">
                      Kodu tekrar gönder
                    </button>
                  </div>
                </div>
              )}
            </div>

            {info && <div className="form-alert form-alert--info">{info}</div>}
            {error && <div className="form-alert form-alert--error">{error}</div>}

            <div className="space-y-3">
              <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-3.5 text-sm font-semibold text-black shadow-[0_18px_36px_rgba(245,158,11,0.3)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? 'İşlem sürüyor...' : isOtpStep ? 'Kodu doğrula' : 'Giriş yap'}
              </button>
              <Link href="/forgot-password" className="block text-center text-sm font-medium text-amber-100 transition hover:text-white">
                Parolamı unuttum
              </Link>
            </div>
          </form>

          <div className="mt-6 border-t border-amber-100/20 pt-5 text-center text-sm text-amber-100/80">
            Hesabın yok mu?{' '}
            <Link href={registerHref} className="font-semibold text-amber-200 hover:text-white">
              Kayıt ol
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
