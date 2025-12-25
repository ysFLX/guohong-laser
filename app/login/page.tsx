'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const resetDone = searchParams.get('reset') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Gecersiz e-posta veya sifre');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-semibold">
              GL
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Giris Yap</h2>
            <p className="mt-2 text-sm text-gray-600">Hesabina giris yaparak devam et</p>
          </div>

          {registered && (
            <div className="mt-6 text-green-700 text-sm text-center p-3 bg-green-50 rounded-lg border border-green-100">
              Kayit basarili. Simdi giris yapabilirsiniz.
            </div>
          )}
          {resetDone && (
            <div className="mt-4 text-green-700 text-sm text-center p-3 bg-green-50 rounded-lg border border-green-100">
              Parola guncellendi. Simdi giris yapabilirsiniz.
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/complete-profile?next=/' })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700">
                G
              </span>
              Google ile giris yap
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-widest text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            veya
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 sm:text-sm text-gray-900 bg-white"
                  placeholder="********"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-700 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white ${
                  isLoading ? 'bg-gray-400' : 'bg-gray-900 hover:bg-gray-800'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900/30`}
              >
                {isLoading ? 'Giris yapiliyor...' : 'Giris Yap'}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Parolami unuttum
            </Link>
          </div>
          <div className="mt-6 text-center">
            <Link href="/register" className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Hesabin yok mu? <span className="underline">Kayit ol</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
