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
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)] opacity-80" />
          <div className="relative">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-400 text-slate-900 flex items-center justify-center font-semibold">
                GL
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Yeni hesap oluştur</h2>
              <p className="mt-2 text-sm text-white/70">Bilgilerini gir, hesabini oluştur</p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() =>
                  signIn('google', {
                    callbackUrl: `/complete-profile?next=${encodeURIComponent(next)}`,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Google ile kayıt ol
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-widest text-white/40">
              <span className="h-px flex-1 bg-white/10" />
              veya
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {step === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white/80">
                      Ad
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="Adınız"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white/80">
                      Soyad
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="Soyadınız"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80">
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
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white/80">
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
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="05xx xxx xx xx"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white/80">
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
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="********"
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              {step === 'verify' && (
                <div className="space-y-4">
                  <div className="text-center text-base font-semibold text-white">E-posta doğrulama</div>
                  <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/70">
                    Doğrulama kodunu <span className="font-semibold">{email}</span> adresine gönderdik.
                  </div>
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-white/80">
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
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>
              )}

              {info && <div className="form-alert form-alert--info">{info}</div>}

              {error && <div className="form-alert form-alert--error">{error}</div>}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={step === 'details' ? isSendingCode : isVerifying}
                  className="btn-primary w-full"
                >
                  {step === 'details'
                    ? isSendingCode
                      ? 'Gönderiliyor...'
                      : 'Kayıt ol'
                    : isVerifying
                      ? 'Kontrol ediliyor...'
                      : 'Kaydı tamamla'}
                </button>

                {step === 'verify' && (
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={isSendingCode}
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
                  >
                    {isSendingCode ? 'Tekrar gönderiliyor...' : 'Kodu tekrar gönder'}
                  </button>
                )}
              </div>
            </form>
            <div className="mt-6 text-center">
              <Link href={loginHref} className="text-sm font-medium text-indigo-200 hover:text-indigo-100">
                Zaten hesabın var mı? <span className="underline">Giriş yap</span>
              </Link>
            </div>
          </div>
        </div>
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


