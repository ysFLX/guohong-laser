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

  const parseResponse = async (response: Response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('JSON parse hatası:', e, 'Yanıt:', text);
      throw new Error('Sunucudan geçersiz yanıt alındı');
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
        throw new Error(data.error || 'Kayıt sırasında bir hata oluştu');
      }

      setStep('verify');
      setInfo(data.message || 'Doğrulama kodu e-posta adresinize gönderildi');
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      setError(error.message || 'Kayıt sırasında bir hata oluştu');
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
        throw new Error(data.error || 'Kayıt sırasında bir hata oluştu');
      }

      router.push(`/login?registered=true&next=${encodeURIComponent(next)}`);
    } catch (error: any) {
      console.error('Doğrulama hatası:', error);
      setError(error.message || 'Doğrulama sırasında bir hata oluştu');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      await sendVerificationCode();
      return;
    }
    await verifyCode();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-fuchsia-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] lg:p-7">
        <section className="hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 p-8 lg:flex lg:flex-col">
          <span className="inline-flex w-fit items-center rounded-full border border-indigo-200/20 bg-indigo-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-indigo-100">
            Kurumsal Üyelik
          </span>
          <h1 className="mt-6 max-w-sm text-4xl font-semibold leading-tight text-white">Dakikalar içinde profesyonel hesabını aç.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Yeni hesabınızla stok taleplerini, sipariş durumlarını ve teknik süreçleri tek merkezden yönetebilir, daha hızlı operasyon
            sağlayabilirsiniz.
          </p>

          <div className="mt-10 grid gap-3">
            {['Tek seferlik e-posta doğrulama', 'Kurumsal profil tamamlama akışı', 'Sipariş geçmişine anlık erişim'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">
            “Ekibinize özel panel deneyimi için şimdi hesabınızı oluşturun.”
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-300 to-cyan-400 font-bold text-slate-900 shadow-lg shadow-indigo-500/20">
              GL
            </div>
            <h2 className="mt-5 text-3xl font-semibold">Yeni hesap oluştur</h2>
            <p className="mt-2 text-sm text-slate-300">Bilgilerini gir, doğrulamanı tamamla ve hemen kullanmaya başla.</p>
          </div>

          <div className="mt-7">
            <button
              type="button"
              onClick={() =>
                signIn('google', {
                  callbackUrl: `/complete-profile?next=${encodeURIComponent(next)}`,
                })
              }
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Google ile kayıt ol
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-white/10" />
            veya
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            {step === 'details' && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-200">
                      Ad
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      placeholder="Adınız"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-200">
                      Soyad
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200">
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
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-200">
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
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="05xx xxx xx xx"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                    Şifre
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="********"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-4">
                <div className="text-center text-base font-semibold text-white">E-posta doğrulama</div>
                <div className="rounded-xl border border-cyan-100/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
                  Doğrulama kodunu <span className="font-semibold">{email}</span> adresine gönderdik.
                </div>
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-200">
                    Doğrulama Kodu
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {info && <div className="form-alert form-alert--info">{info}</div>}
            {error && <div className="form-alert form-alert--error">{error}</div>}

            <div className="space-y-3">
              <button type="submit" disabled={step === 'details' ? isSendingCode : isVerifying} className="btn-primary w-full">
                {step === 'details' ? isSendingCode ? 'Gönderiliyor...' : 'Kayıt ol' : isVerifying ? 'Kontrol ediliyor...' : 'Kaydı tamamla'}
              </button>

              {step === 'verify' && (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={isSendingCode}
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
                >
                  {isSendingCode ? 'Tekrar gönderiliyor...' : 'Kodu tekrar gönder'}
                </button>
              )}
            </div>
          </form>
          <div className="mt-6 text-center">
            <Link href={loginHref} className="text-sm font-medium text-cyan-200 hover:text-cyan-100">
              Zaten hesabın var mı? <span className="underline">Giriş yap</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white/70">Yükleniyor...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
