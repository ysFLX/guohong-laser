'use client';

import { useState } from 'react';

import Reveal from '@/components/home/Reveal';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Genel Soru',
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setEmailError('Lutfen dogru bir e-posta adresi giriniz.');
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
        }),
      });

      const data = await response.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Dogrulama kodu e-posta adresinize gonderildi.');
      } else if (data.success) {
        setSubmitStatus({
          success: true,
          message: 'Mesajiniz alindi. En kisa surede size geri donecegiz.',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Genel Soru',
          message: '',
        });
        setOtp('');
        setStep('details');
      } else {
        throw new Error(data.error || data.message || 'Form gonderilemedi');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata olustu. Lutfen tekrar deneyin.';
      setSubmitStatus({
        success: false,
        message,
      });
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
            Iletisim
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Sorulariniz icin buradayiz</h1>
          <p className="max-w-2xl text-base text-white/70">
            Teklif, servis veya urun detaylari icin formu doldurun. Ekibimiz size hizla geri donsun.
          </p>
        </div>
      </Reveal>

      <div className="space-y-6">
        <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          {submitStatus && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm ${
                submitStatus.success
                  ? 'border-orange-200 bg-orange-50 text-orange-800'
                  : 'border-red-200 bg-red-50 text-red-700'
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
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                {emailError && <div className="mt-2 text-sm text-red-600">{emailError}</div>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Telefon
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Konu <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="Genel Soru">Genel Soru</option>
                    <option value="Teknik Destek">Teknik Destek</option>
                    <option value="Satis Bilgisi">Satis Bilgisi</option>
                    <option value="Diger">Diger</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Mesajiniz <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="Mesajinizi buraya yazin..."
                  ></textarea>
                </div>
              </div>
            </div>

            {step === 'verify' && (
              <div className="space-y-3">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Dogrulama kodunu e-posta adresine gonderdik. Kodu girip gonderimi tamamla.
                </div>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Dogrulama Kodu
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
                      className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-center text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {info && (
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-center text-sm text-orange-700">
                {info}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-500 disabled:opacity-60"
              >
                {isSubmitting ? 'Gonderiliyor...' : step === 'verify' ? 'Dogrula ve gonder' : 'Gonder'}
              </button>
            </div>
          </form>
        </Reveal>

        <Reveal as="section" delay={150} className="space-y-4">
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Iletisim bilgilerimiz</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Adres</p>
                <p>Fevzicakmak Mah. Aksaray Cevreyolu Caddesi Akasya Sitesi</p>
                <p>A Blok No:18T 42210 Konya, Turkiye</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">E-posta</p>
                <p>guohonglazerinfo@gmail.com</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Telefon</p>
                <p>+90 536 831 67 87</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Calisma saatleri</p>
                <p>Pazartesi - Cuma: 09:00 - 17:30</p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            <h3 className="text-sm uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">Hizli not</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Teknik sorular ve kurulum talepleri icin formu doldururken konu secimini net belirtin.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

