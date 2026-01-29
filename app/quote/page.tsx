'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Reveal from '@/components/home/Reveal';
import { machineProductNames } from '@/lib/machineCatalog';

export default function QuotePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    product: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [info, setInfo] = useState('');

  const isEmailValid = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email' && emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setEmailError('');
    setInfo('');

    if (!isEmailValid(formData.email)) {
      setEmailError('Lütfen doğru bir e-posta adresi giriniz.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          otp: step === 'verify' ? otp : undefined,
          subject: `Fiyat Teklifi Talebi - ${formData.product}`,
          message: `Fiyat Teklifi Talep Formu:\n-------------------------\nAd Soyad: ${formData.name}\nFirma: ${formData.company}\nE-posta: ${formData.email}\nTelefon: ${formData.phone}\nÜrün: ${formData.product}\nMesaj: ${formData.message}`,
        }),
      });

      const data = await response.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Doğrulama kodu e-posta adresinize gönderildi.');
      } else if (response.ok) {
        setSubmitStatus({
          success: true,
          message: 'Talebiniz alındı. En kısa sürede sizinle iletişime geçilecektir.',
        });
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          product: '',
          message: '',
        });
        setOtp('');
        setStep('details');
      } else {
        throw new Error(data.error || 'Form gönderilemedi');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.';
      setSubmitStatus({ success: false, message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-16">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
            Fiyat Teklifi
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Hızlı teklif formu</h1>
          <p className="max-w-2xl text-base text-white/70">
            İlgi duyduğunuz ürünü seçin, detayları gönderin. Ekibimiz en uygun teklifi hazırlayacaktır.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bulk-quote"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/60 hover:text-white"
            >
              Toplu teklif formu
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        {submitStatus && (
          <div
            className={`mb-6 form-alert ${
              submitStatus.success ? 'form-alert--success' : 'form-alert--error'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Firma Adı
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                E-posta <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              {emailError && <div className="mt-2 text-sm text-red-600">{emailError}</div>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Telefon <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                İlgi duyduğunuz ürün <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="product"
                  name="product"
                  required
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Ürün seçiniz</option>
                  {machineProductNames.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Ek bilgiler
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Eklemek istediğiniz notlar veya özel istekleriniz..."
                ></textarea>
              </div>
            </div>
          </div>

          {step === 'verify' && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Doğrulama kodunu e-posta adresine gönderdik. Kodu girip gönderimi tamamla.
              </div>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Doğrulama Kodu
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-center text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}

            {info && <div className="form-alert form-alert--info text-center">{info}</div>}

          <div className="flex items-center justify-end gap-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-2"
            >
              {isSubmitting ? 'Gönderiliyor...' : step === 'verify' ? 'Doğrula ve gönder' : 'Gönder'}
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}



