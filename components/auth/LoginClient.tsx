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
          setInfo('E-postana dogrulama kodu gonderdik. Kodun 10 dakika gecerlidir.');
        } else if (result.error === '2FA_INVALID') {
          setError('Dogrulama kodu hatali. Tekrar dene.');
        } else if (result.error === '2FA_EXPIRED') {
          setError('Kodun suresi doldu. Yeniden kod gonder.');
        } else if (result.error === '2FA_SEND_FAILED') {
          setError('Kod gonderilemedi. Lutfen e-posta ayarlarini kontrol et.');
        } else {
          setError('Gecersiz e-posta veya sifre');
        }
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Giris hatasi:', error);
      setError('Giris sirasinda bir hata olustu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !password) {
      setError('E-posta ve sifre girmen gerekiyor');
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
        setInfo('Yeni kodu e-postana gonderdik.');
      } else if (result?.error) {
        setError('Kod gonderilemedi. Tekrar dene.');
      }
    } catch (error) {
      console.error('Kod gonderme hatasi:', error);
      setError('Kod gonderilemedi');
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
              <h2 className="mt-4 text-3xl font-semibold">Giris yap</h2>
              <p className="mt-2 text-sm text-white/70">Hesabiniza giris yaparak devam edin.</p>
            </div>

            {registered && (
              <div className="mt-6 form-alert form-alert--success">
                Kayit basarili. Simdi giris yapabilirsiniz.
              </div>
            )}
            {resetDone && (
              <div className="mt-4 form-alert form-alert--success">
                Parola guncellendi. Simdi giris yapabilirsiniz.
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/complete-profile?next=/' })}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Google ile giris yap
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
                    disabled={step === 'otp'}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-60"
                    placeholder="********"
                  />
                </div>
                {step === 'otp' && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-white/80">
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
                        Geri don
                      </button>
                      <button
                        type="button"
                        onClick={handleResend}
                        className="font-semibold text-indigo-200 hover:text-indigo-100"
                      >
                        Kodu tekrar gonder
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
                    ? 'Giris yapiliyor...'
                    : step === 'otp'
                      ? 'Kodu dogrula'
                      : 'Giris yap'}
                </button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm font-medium text-indigo-200 hover:text-indigo-100">
                Parolami unuttum
              </Link>
            </div>
            <div className="mt-6 text-center">
              <Link href="/register" className="text-sm font-medium text-indigo-200 hover:text-indigo-100">
                Hesabin yok mu? <span className="underline">Kayit ol</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



