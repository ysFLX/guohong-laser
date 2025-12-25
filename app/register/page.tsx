'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
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

  const parseResponse = async (response: Response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('JSON parse hatasi:', e, 'Yanit:', text);
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
    } catch (error: any) {
      console.error('Kayit hatasi:', error);
      setError(error.message || 'Kayit sirasinda bir hata olustu');
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
        throw new Error(data.error || 'Kayit sirasinda bir hata olustu');
      }

      router.push('/login?registered=true');
    } catch (error: any) {
      console.error('Dogrulama hatasi:', error);
      setError(error.message || 'Dogrulama sirasinda bir hata olustu');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-semibold">
              GL
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Yeni Hesap Olustur</h2>
            <p className="mt-2 text-sm text-gray-600">Bilgilerini gir ve hesabini olustur</p>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/complete-profile?next=/' })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700">
                G
              </span>
              Google ile kayit ol
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-widest text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            veya
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {step === 'details' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Ad
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                    placeholder="Adiniz"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Soyad
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                    placeholder="Soyadiniz"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                    placeholder="05xx xxx xx xx"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                    placeholder="********"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-4">
                <div className="text-center text-base font-semibold text-gray-900">
                  E-posta dogrulama
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  Dogrulama kodunu <span className="font-semibold">{email}</span> adresine gonderdik.
                </div>
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                    Dogrulama Kodu
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white tracking-widest text-center"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {info && (
              <div className="text-green-700 text-sm text-center p-3 bg-green-50 rounded-lg border border-green-100">
                {info}
              </div>
            )}

            {error && (
              <div className="text-red-700 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={step === 'details' ? isSendingCode : isVerifying}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white ${
                  step === 'details'
                    ? isSendingCode
                      ? 'bg-gray-400'
                      : 'bg-gray-900 hover:bg-gray-800'
                    : isVerifying
                      ? 'bg-gray-400'
                      : 'bg-gray-900 hover:bg-gray-800'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900/30`}
              >
                {step === 'details'
                  ? isSendingCode
                    ? 'Gonderiliyor...'
                    : 'Kayit Ol'
                  : isVerifying
                    ? 'Kontrol ediliyor...'
                    : 'Kaydi Tamamla'}
              </button>

              {step === 'verify' && (
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={isSendingCode}
                  className="w-full flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-60"
                >
                  {isSendingCode ? 'Tekrar gonderiliyor...' : 'Kodu Tekrar Gonder'}
                </button>
              )}
            </div>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Zaten hesabin var mi? <span className="underline">Giris yap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
