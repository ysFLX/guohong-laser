'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
        router.push('/');
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
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)] opacity-80" />
          <div className="relative">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-400 text-slate-900 flex items-center justify-center font-semibold">
                GL
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Giriş yap</h2>
              <p className="mt-2 text-sm text-white/70">Hesabınıza giriş yaparak devam edin.</p>
            </div>

            {registered && (
              <div className="mt-6 form-alert form-alert--success">
                Kayıt başarılı. Simdi giriş yapabilirsiniz.
              </div>
            )}
            {resetDone && (
              <div className="mt-4 form-alert form-alert--success">
                Parola güncellendi. Şimdi giriş yapabilirsiniz.
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/complete-profile?next=/' })}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Google ile giriş yap
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-widest text-white/40">
              <span className="h-px flex-1 bg-white/10" />
              veya
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                    disabled={step === 'otp'}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-60"
                    placeholder="ornek@email.com"
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={step === 'otp'}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-60"
                    placeholder="********"
                  />
                </div>
                {step === 'otp' && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-white/80">
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
                      className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      placeholder="6 haneli kod"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-white/60">
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
                      <button
                        type="button"
                        onClick={handleResend}
                        className="font-semibold text-indigo-200 hover:text-indigo-100"
                      >
                        Kodu tekrar gönder
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {info && <div className="form-alert form-alert--info">{info}</div>}
              {error && (
                <div className="form-alert form-alert--error">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading
                    ? 'Giriş yapılıyor...'
                    : step === 'otp'
                      ? 'Kodu doğrula'
                      : 'Giriş yap'}
                </button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm font-medium text-indigo-200 hover:text-indigo-100">
                Parolamı unuttum
              </Link>
            </div>
            <div className="mt-6 text-center">
              <Link href="/register" className="text-sm font-medium text-indigo-200 hover:text-indigo-100">
                Hesabın yok mu? <span className="underline">Kayıt ol</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



