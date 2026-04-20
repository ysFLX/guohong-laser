'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import Reveal from '@/components/home/Reveal';
import { machineProductNames } from '@/lib/machineCatalog';
import { trackEvent } from '@/lib/analytics';

function QuotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
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

  const preselectedProduct = useMemo(() => (searchParams.get('product') ?? '').trim(), [searchParams]);
  const preselectedMessage = useMemo(() => (searchParams.get('message') ?? '').trim(), [searchParams]);

  useEffect(() => {
    if (!preselectedProduct) return;
    setFormData((prev) => (prev.product ? prev : { ...prev, product: preselectedProduct }));
  }, [preselectedProduct]);

  useEffect(() => {
    if (!preselectedMessage) return;
    setFormData((prev) => (prev.message ? prev : { ...prev, message: preselectedMessage }));
  }, [preselectedMessage]);

  useEffect(() => {
    if (!session?.user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || session.user.name || '',
      email: prev.email || session.user.email || '',
      phone: prev.phone || session.user.phone || '',
    }));
  }, [session?.user?.email, session?.user?.name, session?.user?.phone]);

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
        trackEvent('generate_lead', {
          lead_type: 'quote',
          product: formData.product || undefined,
        });
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
    <div className="space-y-14 pb-16 text-white">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#15148c] shadow-[0_40px_120px_-60px_rgba(5,0,92,0.95)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.24),_transparent_30%),linear-gradient(120deg,_rgba(5,0,92,0.2),_rgba(5,0,92,0.92))]" />
        <div className="relative px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.38em] text-[#ff6a0d]">
              Fiyat Teklifi
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">Hızlı teklif formu</h1>
            <p className="max-w-2xl text-base leading-8 text-white/76">
              İlgi duyduğunuz ürünü seçin, detayları gönderin. Ekibimiz en uygun teklifi hazırlayacaktır.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bulk-quote"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/82 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                Toplu teklif formu
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        {submitStatus && (
          <div
            className={`mb-6 form-alert ${
              submitStatus.success ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100' : 'border-rose-300/25 bg-rose-400/10 text-rose-100'
            }`}
          >
            {submitStatus.message}
          </div>
        )}
        {info ? <div className="mb-6 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/80">{info}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/82">
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
                  className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-white/82">
                Firma Adı
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/82">
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
                  className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]"
                />
              </div>
              {emailError && <div className="mt-2 text-sm text-rose-200">{emailError}</div>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/82">
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
                  className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product" className="block text-sm font-medium text-white/82">
                İlgi duyduğunuz ürün <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="product"
                  name="product"
                  required
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#ff6a0d]"
                >
                  <option value="">Ürün seçiniz</option>
                  {formData.product && !machineProductNames.includes(formData.product) ? (
                    <option value={formData.product}>{formData.product}</option>
                  ) : null}
                  {machineProductNames.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className="block text-sm font-medium text-white/82">
                Ek bilgiler
              </label>
              <div className="mt-1">
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-[26px] border border-white/12 bg-white/6 px-4 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]"
                  placeholder="Eklemek istediğiniz notlar veya özel istekleriniz..."
                ></textarea>
              </div>
            </div>
          </div>

          {step === 'verify' && (
            <div className="space-y-3">
              <div className="text-sm text-white/76">
                Doğrulama kodunu e-posta adresine gönderdik. Kodu girip gönderimi tamamla.
              </div>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-white/82">
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
                    className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-center text-sm text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-white/30 hover:bg-white/10"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6a0d] px-6 py-3 text-sm font-semibold text-[#15148c] transition hover:opacity-95 disabled:opacity-70"
            >
              {isSubmitting ? 'Gönderiliyor...' : step === 'verify' ? 'Doğrula ve gönder' : 'Gönder'}
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#15148c]" />}>
      <QuotePageContent />
    </Suspense>
  );
}

