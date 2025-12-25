'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Sifirlama baglantisi gecersiz.');
      return;
    }

    if (password.length < 6) {
      setError('Sifre en az 6 karakter olmalidir.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Sifreler eslesmiyor.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || 'Parola sifirlama basarisiz');
      }

      router.replace('/login?reset=true');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Parola sifirlama basarisiz';
      setError(message);
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
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Yeni Parola</h2>
            <p className="mt-2 text-sm text-gray-600">Yeni sifreni belirle.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Yeni Sifre
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
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Yeni Sifre (Tekrar)
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Kaydediliyor...' : 'Parolayi Guncelle'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Giris ekranina don
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
