'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || 'Parola sifirlama istegi gonderilemedi');
      }

      setSuccess('Eger bu e-posta kayitliysa parola sifirlama baglantisi gonderildi.');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Parola sifirlama istegi gonderilemedi';
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
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Parola Sifirla</h2>
            <p className="mt-2 text-sm text-gray-600">E-posta adresini gir, sifirlama linki gonderelim.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            {success && (
              <div className="text-green-700 text-sm text-center p-3 bg-green-50 rounded-lg border border-green-100">
                {success}
              </div>
            )}

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
                {isLoading ? 'Gonderiliyor...' : 'Sifirlama Linki Gonder'}
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
