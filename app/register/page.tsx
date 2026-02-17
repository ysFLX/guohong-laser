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

const valueCards = [
  { value: '1 panel', label: 'Tum operasyonlar tek noktada' },
  { value: '2 adim', label: 'E-posta ile guvenli dogrulama' },
  { value: 'Anlik', label: 'Siparis ve teklif gorunurlugu' },
];

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
    <div className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(99,102,241,0.2),transparent_42%),radial-gradient(circle_at_84%_22%,rgba(6,182,212,0.2),transparent_48%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.15),transparent_48%)]" />
        <div className="absolute -left-20 top-12 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-0 top-28 h-96 w-96 rounded-full border border-white/10 bg-white/[0.03] blur-2xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 rounded-[34px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_30px_120px_rgba(4,9,20,0.75)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] lg:gap-7 lg:p-6">
        <section className="relative hidden overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(13,23,45,0.95)_0%,rgba(10,18,34,0.92)_46%,rgba(8,15,31,0.9)_100%)] p-9 lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -left-12 top-10 h-44 w-44 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-500/30 blur-3xl" />

          <span className="inline-flex w-fit items-center rounded-full border border-indigo-200/30 bg-indigo-300/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100">
            Professional Onboarding
          </span>

          <h1 className="mt-6 max-w-md text-[2.2rem] font-semibold leading-[1.12] text-white">
            Hesabini dakikalar icinde ac, tum surecleri tek panelden yonet.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
            Yeni kayitla birlikte teklif, siparis ve teknik destek operasyonlarinizi daha duzenli bir deneyime tasiyin.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {valueCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                <div className="text-lg font-semibold text-white">{card.value}</div>
                <div className="mt-1 text-[11px] leading-4 text-slate-300">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            {['Kurumsal profil yapisi', 'E-posta dogrulama guvencesi', 'Anlik siparis gorunurlugu'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-slate-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(103,232,249,0.2)]" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
            Kayit adimlari sadelestirildi: once bilgiler, sonra hizli kod dogrulama.
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(175deg,rgba(10,18,34,0.95)_0%,rgba(9,16,28,0.92)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Create Account</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Yeni hesap olustur</h2>
              <p className="mt-2 text-sm text-slate-300">Bilgilerini gir, kodu dogrula ve panele hemen basla.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-indigo-300 to-cyan-400 font-bold text-slate-900 shadow-[0_12px_30px_rgba(129,140,248,0.3)]">
              GL
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className={!isVerifyStep ? 'font-semibold text-white' : 'text-slate-400'}>1. Bilgiler</span>
              <span className={isVerifyStep ? 'font-semibold text-white' : 'text-slate-400'}>2. Dogrulama</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/10">
              <div className={`h-full rounded-full bg-gradient-to-r from-indigo-300 to-cyan-300 transition-all ${isVerifyStep ? 'w-full' : 'w-1/2'}`} />
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
              className="w-full rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.14]"
            >
              Google ile kayit ol
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            veya
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            {!isVerifyStep && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-200">
                      Ad
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                      placeholder="Adiniz"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-200">
                      Soyad
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                      placeholder="Soyadiniz"
                    />
                  </div>
                </div>

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
                    className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-200">
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
                    className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="05xx xxx xx xx"
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="********"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {isVerifyStep && (
              <div className="space-y-4 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-4">
                <div className="text-center text-base font-semibold text-white">E-posta dogrulama</div>
                <div className="rounded-xl border border-cyan-100/20 bg-black/20 px-4 py-3 text-sm text-cyan-100">
                  Kod <span className="font-semibold">{email}</span> adresine gonderildi.
                </div>
                <div>
                  <label htmlFor="verificationCode" className="mb-1.5 block text-sm font-medium text-cyan-100">
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
                    className="block w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-center text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300/30"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {info && <div className="form-alert form-alert--info">{info}</div>}
            {error && <div className="form-alert form-alert--error">{error}</div>}

            <div className="space-y-3">
              <button type="submit" disabled={!isVerifyStep ? isSendingCode : isVerifying} className="btn-primary w-full rounded-2xl py-3.5">
                {!isVerifyStep ? (isSendingCode ? 'Kod gonderiliyor...' : 'Dogrulama kodu gonder') : isVerifying ? 'Kayit tamamlanıyor...' : 'Kaydi tamamla'}
              </button>

              {isVerifyStep && (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={isSendingCode}
                  className="w-full rounded-2xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.14]"
                >
                  {isSendingCode ? 'Kod tekrar gonderiliyor...' : 'Kodu tekrar gonder'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-300">
            Zaten hesabin var mi?{' '}
            <Link href={loginHref} className="font-semibold text-cyan-200 hover:text-cyan-100">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050914] text-white/70">Yukleniyor...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
