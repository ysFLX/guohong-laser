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
        ...(step === 'otp' ? { otp } : {}),
      });

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          setStep('otp');
          setInfo('E-postana doğrulama kodu gönderdik. Kodun 10 dakika geçerlidir.');
        } else if (result.error === '2FA_INVALID') {
          setError('Doğrulama kodu hatalı. Lütfen daha sonra tekrar dene.');
        } else if (result.error === '2FA_EXPIRED') {
          setError('Kodun süresi doldu. Yeniden kod gönder.');
        } else if (result.error === '2FA_SEND_FAILED') {
          setError('Kod gönderilemedi. Lütfen e-posta ayarlarını kontrol et.');
        } else {
          setError('Geçersiz e-posta veya şifre');
        }
      } else {
        router.replace(next);
        router.refresh();
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError('Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar dene.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !password) {
      setError('E-posta ve şifre girmen gerekiyor');
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
        setInfo('Yeni kod e-posta adresine gönderildi.');
      } else if (result?.error) {
        setError('Kod gönderilemedi. Lütfen daha sonra tekrar dene.');
      }
    } catch (error) {
      console.error('Kod gönderme hatası:', error);
      setError('Kod gönderilemedi. Lütfen daha sonra tekrar dene.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] lg:p-7">
        <section className="hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 p-8 lg:flex lg:flex-col">
          <span className="inline-flex w-fit items-center rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-100">
            Guohong Lazer
          </span>
          <h1 className="mt-6 max-w-sm text-4xl font-semibold leading-tight text-white">
            Endüstriyel güce tek adımda, güvenli giriş.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Siparişlerinizi, teklif süreçlerinizi ve teknik destek kayıtlarınızı tek panelden yönetmek için hesabınıza giriş yapın.
          </p>

          <div className="mt-10 space-y-3">
            {['İki adımlı kimlik doğrulama', 'Kurumsal veri gizliliği standartları', 'Hızlı teklif ve sipariş takibi'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-auto rounded-2xl border border-indigo-300/20 bg-indigo-400/10 p-4 text-sm text-indigo-100">
            “Üretim süreçleriniz kadar hızlı bir deneyim için tasarlandı.”
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-slate-900/70 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-indigo-400 font-bold text-slate-900 shadow-lg shadow-cyan-500/20">
              GL
            </div>
            <h2 className="mt-5 text-3xl font-semibold">Giriş yap</h2>
            <p className="mt-2 text-sm text-slate-300">Hesabınıza giriş yaparak profesyonel panele devam edin.</p>
          </div>

          {registered && <div className="mt-6 form-alert form-alert--success">Kayıt başarılı. Şimdi giriş yapabilirsiniz.</div>}
          {resetDone && <div className="mt-4 form-alert form-alert--success">Parola güncellendi. Şimdi giriş yapabilirsiniz.</div>}

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
              Google ile giriş yap
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-white/10" />
            veya
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  disabled={step === 'otp'}
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:opacity-60"
                  placeholder="ornek@email.com"
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={step === 'otp'}
                  className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:opacity-60"
                  placeholder="********"
                />
              </div>
              {step === 'otp' && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-200">
                    Doğrulama Kodu
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="6 haneli kod"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('credentials');
                        setOtp('');
                      }}
                      className="hover:text-white"
                    >
                      Geri dön
                    </button>
                    <button type="button" onClick={handleResend} className="font-semibold text-cyan-200 hover:text-cyan-100">
                      Kodu tekrar gönder
                    </button>
                  </div>
                </div>
              )}
            </div>

            {info && <div className="form-alert form-alert--info">{info}</div>}
            {error && <div className="form-alert form-alert--error">{error}</div>}

            <div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Giriş yapılıyor...' : step === 'otp' ? 'Kodu doğrula' : 'Giriş yap'}
              </button>
            </div>
          </form>
          <div className="mt-5 text-center">
            <Link href="/forgot-password" className="text-sm font-medium text-cyan-200 hover:text-cyan-100">
              Parolamı unuttum
            </Link>
          </div>
          <div className="mt-5 text-center">
            <Link href={registerHref} className="text-sm font-medium text-cyan-200 hover:text-cyan-100">
              Hesabın yok mu? <span className="underline">Kayıt ol</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
