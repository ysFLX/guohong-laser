'use client';

import { Suspense, useState } from 'react';
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

const premiumPoints = ['Kurumsal onboarding paneli', 'Dogrulama kodu ile guvenli acilis', 'Operasyon odakli hesap altyapisi'];

function RegisterPageContent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = sanitizeNext(searchParams.get('next')) || '/';
  const loginHref = next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`;
  const isVerifyStep = step === 'verify';

  const parseResponse = async (response: Response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('JSON parse hatasi:', parseError, 'Yanit:', text);
      throw new Error('Sunucudan gecersiz yanit alindi');
    }
  };

  const sendVerificationCode = async () => {
    setError('');
    setInfo('');
    setIsSendingCode(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Kayit sirasinda bir hata olustu');
      }

      setStep('verify');
      setInfo(data.message || 'Dogrulama kodu e-posta adresinize gonderildi');
    } catch (submitError: unknown) {
      console.error('Kayit hatasi:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Kayit sirasinda bir hata olustu');
    } finally {
      setIsSendingCode(false);
    }
  };

  const verifyCode = async () => {
    setError('');
    setInfo('');
    setIsVerifying(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          verificationCode,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Dogrulama sirasinda bir hata olustu');
      }

      router.push(`/login?registered=true&next=${encodeURIComponent(next)}`);
    } catch (verifyError: unknown) {
      console.error('Dogrulama hatasi:', verifyError);
      setError(verifyError instanceof Error ? verifyError.message : 'Dogrulama sirasinda bir hata olustu');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifyStep) {
      await sendVerificationCode();
      return;
    }
    await verifyCode();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070707] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,214,140,0.2),transparent_38%),radial-gradient(circle_at_86%_20%,rgba(188,143,75,0.2),transparent_44%),linear-gradient(130deg,#090909_16%,#141414_48%,#090909_82%)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 rounded-[36px] border border-amber-100/20 bg-black/40 p-3 shadow-[0_40px_140px_rgba(0,0,0,0.85)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr] lg:p-6">
        <section className="relative hidden overflow-hidden rounded-[30px] border border-amber-100/20 bg-[linear-gradient(140deg,rgba(22,18,11,0.96)_0%,rgba(10,10,10,0.94)_46%,rgba(30,22,12,0.95)_100%)] p-9 lg:flex lg:flex-col">
          <span className="inline-flex w-fit items-center rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100">
            Executive Onboarding
          </span>

          <h1 className="mt-6 max-w-md text-[2.3rem] font-semibold leading-[1.08] text-amber-50">
            Kayit deneyimini premium seviyeye tasidik.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-amber-100/80">
            Daha guclu kontrast, daha net adimlar ve daha kaliteli bir yuzey diliyle kayit akisiniz yeniden tasarlandi.
          </p>

          <div className="mt-8 space-y-3">
            {premiumPoints.map((item) => (
              <div key={item} className="rounded-2xl border border-amber-100/20 bg-amber-100/5 px-4 py-3 text-sm text-amber-50">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-amber-200/25 bg-amber-200/10 p-4 text-sm text-amber-100">
            Temel konu: ayni islev, cok daha premium gorunum.
          </div>
        </section>

        <section className="rounded-[30px] border border-amber-100/20 bg-[linear-gradient(160deg,rgba(16,14,10,0.96)_0%,rgba(10,10,10,0.94)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-amber-100/60">Create Account</p>
              <h2 className="mt-2 text-3xl font-semibold text-amber-50">Yeni hesap olustur</h2>
              <p className="mt-2 text-sm text-amber-100/75">Daha ust segment bir onboarding deneyimi.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-300 to-yellow-500 font-bold text-black shadow-[0_14px_30px_rgba(245,158,11,0.35)]">
              GL
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-100/20 bg-black/35 p-3 text-xs text-amber-100/75">
            <div className="flex items-center justify-between">
              <span className={!isVerifyStep ? 'font-semibold text-amber-50' : 'text-amber-100/55'}>1. Bilgiler</span>
              <span className={isVerifyStep ? 'font-semibold text-amber-50' : 'text-amber-100/55'}>2. Dogrulama</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-amber-100/15">
              <div className={`h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 transition-all ${isVerifyStep ? 'w-full' : 'w-1/2'}`} />
            </div>
          </div>

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
              Google ile kayit ol
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-amber-100/45">
            <span className="h-px flex-1 bg-amber-100/20" />
            veya
            <span className="h-px flex-1 bg-amber-100/20" />
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            {!isVerifyStep && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-amber-100">
                      Ad
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full rounded-2xl border border-amber-100/20 bg-black/35 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"
                      placeholder="Adiniz"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-amber-100">
                      Soyad
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full rounded-2xl border border-amber-100/20 bg-black/35 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"
                      placeholder="Soyadiniz"
                    />
                  </div>
                </div>

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
                    className="block w-full rounded-2xl border border-amber-100/20 bg-black/35 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-amber-100">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-2xl border border-amber-100/20 bg-black/35 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"
                    placeholder="05xx xxx xx xx"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-amber-100">
                    Sifre
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border border-amber-100/20 bg-black/35 px-4 py-3 text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"
                    placeholder="********"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {isVerifyStep && (
              <div className="space-y-4 rounded-2xl border border-amber-200/35 bg-amber-200/10 p-4">
                <div className="text-center text-base font-semibold text-amber-50">E-posta dogrulama</div>
                <div className="rounded-xl border border-amber-100/25 bg-black/30 px-4 py-3 text-sm text-amber-100">
                  Kod <span className="font-semibold">{email}</span> adresine gonderildi.
                </div>
                <div>
                  <label htmlFor="verificationCode" className="mb-1.5 block text-sm font-medium text-amber-50">
                    Dogrulama kodu
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="block w-full rounded-xl border border-amber-100/30 bg-black/30 px-4 py-3 text-center text-sm text-amber-50 placeholder:text-amber-100/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {info && <div className="form-alert form-alert--info">{info}</div>}
            {error && <div className="form-alert form-alert--error">{error}</div>}

            <div className="space-y-3">
              <button type="submit" disabled={!isVerifyStep ? isSendingCode : isVerifying} className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-3.5 text-sm font-semibold text-black shadow-[0_18px_36px_rgba(245,158,11,0.3)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
                {!isVerifyStep ? (isSendingCode ? 'Kod gonderiliyor...' : 'Dogrulama kodu gonder') : isVerifying ? 'Kayit tamamlanıyor...' : 'Kaydi tamamla'}
              </button>

              {isVerifyStep && (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={isSendingCode}
                  className="w-full rounded-2xl border border-amber-100/30 bg-amber-100/10 px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-100/20"
                >
                  {isSendingCode ? 'Kod tekrar gonderiliyor...' : 'Kodu tekrar gonder'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 border-t border-amber-100/20 pt-5 text-center text-sm text-amber-100/80">
            Zaten hesabin var mi?{' '}
            <Link href={loginHref} className="font-semibold text-amber-200 hover:text-white">
              Giris yap
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#070707] text-amber-100/70">Yukleniyor...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
