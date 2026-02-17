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

const trustItems = [
  '2 adimli kimlik dogrulama',
  'Kurumsal veri gizliligi standartlari',
  '7/24 siparis ve teklif takibi',
];

const metricCards = [
  { value: '< 2 sn', label: 'Oturum acilis ortalamasi' },
  { value: '%99.9', label: 'Servis ulasilabilirligi' },
  { value: 'SSL', label: 'Guvenli veri katmani' },
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
          setInfo('E-posta adresinize dogrulama kodu gonderildi. Kod 10 dakika gecerlidir.');
        } else if (result.error === '2FA_INVALID') {
          setError('Dogrulama kodu hatali. Lutfen tekrar deneyin.');
        } else if (result.error === '2FA_EXPIRED') {
          setError('Kodun suresi doldu. Yeni kod talep edin.');
        } else if (result.error === '2FA_SEND_FAILED') {
          setError('Kod gonderilemedi. E-posta ayarlarinizi kontrol edin.');
        } else {
          setError('Gecersiz e-posta veya sifre');
        }
      } else {
        router.replace(next);
        router.refresh();
      }
    } catch (submitError) {
      console.error('Giris hatasi:', submitError);
      setError('Giris sirasinda bir hata olustu. Lutfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !password) {
      setError('Kodu tekrar gondermek icin e-posta ve sifre gerekli.');
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
        setInfo('Yeni kod e-posta adresinize gonderildi.');
      } else if (result?.error) {
        setError('Kod tekrar gonderilemedi. Lutfen daha sonra deneyin.');
      }
    } catch (resendError) {
      console.error('Kod gonderme hatasi:', resendError);
      setError('Kod gonderilemedi. Lutfen daha sonra deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_42%),radial-gradient(circle_at_86%_20%,rgba(99,102,241,0.2),transparent_48%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.14),transparent_46%)]" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />
        <div className="absolute -right-28 top-20 h-96 w-96 rounded-full border border-white/10 bg-white/[0.03] blur-2xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 rounded-[34px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_30px_120px_rgba(4,9,20,0.75)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] lg:gap-7 lg:p-6">
        <section className="relative hidden overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(12,23,44,0.94)_0%,rgba(11,17,32,0.92)_46%,rgba(9,16,36,0.9)_100%)] p-9 lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-indigo-500/30 blur-3xl" />

          <span className="inline-flex w-fit items-center rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
            Enterprise Access
          </span>

          <h1 className="mt-6 max-w-md text-[2.25rem] font-semibold leading-[1.12] text-white">
            Uretim operasyonuna premium hizda, tek noktadan erisim.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
            Siparisler, teklifler ve teknik operasyonlariniz icin olusturulan profesyonel panelinize guvenli sekilde giris yapin.
          </p>

          <div className="mt-9 grid gap-3">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-slate-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.2)]" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {metricCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                <div className="text-xl font-semibold text-white">{card.value}</div>
                <div className="mt-1 text-[11px] leading-4 text-slate-300">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-indigo-200/20 bg-indigo-400/10 p-4 text-sm leading-6 text-indigo-100">
            Tasarim dili, karar alma anlarini hizlandiracak sekilde sade ve net kurgulandi.
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(175deg,rgba(10,18,34,0.95)_0%,rgba(9,16,28,0.92)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Sign In</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Hesabina giris yap</h2>
              <p className="mt-2 text-sm text-slate-300">Kurumsal paneline devam etmek icin bilgilerini kullan.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-cyan-300 to-indigo-400 font-bold text-slate-900 shadow-[0_12px_30px_rgba(34,211,238,0.3)]">
              GL
            </div>
          </div>

          {(registered || resetDone) && (
            <div className="mt-6 space-y-3">
              {registered && <div className="form-alert form-alert--success">Kayit tamamlandi. Simdi giris yapabilirsiniz.</div>}
              {resetDone && <div className="form-alert form-alert--success">Parolaniz guncellendi. Simdi giris yapabilirsiniz.</div>}
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
              className="w-full rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.14]"
            >
              Google ile devam et
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            veya
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-200">
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
                  className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-200">
                  Sifre
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
                  className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="********"
                />
              </div>

              {isOtpStep && (
                <div className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-4">
                  <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-cyan-100">
                    Dogrulama kodu
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="6 haneli kod"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-cyan-100/85">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('credentials');
                        setOtp('');
                      }}
                      className="font-medium hover:text-white"
                    >
                      Bilgileri duzenle
                    </button>
                    <button type="button" onClick={handleResend} className="font-semibold hover:text-white">
                      Kodu tekrar gonder
                    </button>
                  </div>
                </div>
              )}
            </div>

            {info && <div className="form-alert form-alert--info">{info}</div>}
            {error && <div className="form-alert form-alert--error">{error}</div>}

            <div className="space-y-3">
              <button type="submit" disabled={isLoading} className="btn-primary w-full rounded-2xl py-3.5">
                {isLoading ? 'Islem suruyor...' : isOtpStep ? 'Kodu dogrula' : 'Giris yap'}
              </button>
              <Link href="/forgot-password" className="block text-center text-sm font-medium text-cyan-200 transition hover:text-cyan-100">
                Parolami unuttum
              </Link>
            </div>
          </form>

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-300">
            Hesabin yok mu?{' '}
            <Link href={registerHref} className="font-semibold text-cyan-200 hover:text-cyan-100">
              Kayit ol
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
