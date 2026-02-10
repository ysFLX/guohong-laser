'use client';

import { useState } from 'react';

import Reveal from '@/components/home/Reveal';
import { trackEvent } from '@/lib/analytics';

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
        }),
      });

      const data = await response.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Doğrulama kodu e-posta adresinize gönderildi.');
      } else if (data.success) {
        trackEvent('generate_lead', {
          lead_type: 'contact',
          subject: formData.subject,
        });
        setSubmitStatus({
          success: true,
          message: 'Mesajınız alındı. En kısa sürede size geri döneceğiz.',
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
        throw new Error(data.error || data.message || 'Form gönderilemedi');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      setSubmitStatus({
        success: false,
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-10 sm:px-8 dark:bg-slate-950 dark:text-slate-200 dark:[&_.bg-white]:bg-slate-900/70 dark:[&_.border-slate-200\\/70]:border-white/10 dark:[&_.text-slate-900]:text-white dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400">
      <div className="mx-auto max-w-6xl space-y-10">
        <Reveal as="section" className="relative overflow-hidden rounded-[36px] border border-slate-900/10 bg-slate-950 px-6 py-12 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.4),_transparent_55%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
                Iletisim
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl">Sorularınız için buradayız</h1>
              <p className="max-w-2xl text-base text-white/70">
                Teklif, servis veya ürün detayları için formu doldurun. Ekibimiz size hızla geri dönecektir.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-white/70">
                <span className="rounded-full border border-white/20 px-3 py-1">Ortalama 2 saatte geri dönüş</span>
                <span className="rounded-full border border-white/20 px-3 py-1">7/24 teknik destek takibi</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Kurumsal SLA</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.3em] text-white/60">Destek</div>
                <div className="mt-2 text-lg font-semibold">Teknik kayıt aç</div>
                <p className="mt-1 text-xs text-white/60">Kurulum, arıza, servis planlama.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.3em] text-white/60">Teklif</div>
                <div className="mt-2 text-lg font-semibold">Hızlı teklif iste</div>
                <p className="mt-1 text-xs text-white/60">Uygun konfigurasyon için.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.3em] text-white/60">Satış</div>
                <div className="mt-2 text-lg font-semibold">Satın alma danışmanlığı</div>
                <p className="mt-1 text-xs text-white/60">Tedarik ve teslim planlaması.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.3em] text-white/60">Kurumsal</div>
                <div className="mt-2 text-lg font-semibold">Proje görüşmesi</div>
                <p className="mt-1 text-xs text-white/60">Büyük ölçekli işler için.</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal
            as="section"
            className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]"
          >
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
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  {emailError && <div className="mt-2 text-sm text-red-600">{emailError}</div>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    Telefon
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
                    Konu <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="Genel Soru">Genel Soru</option>
                      <option value="Teknik Destek">Teknik Destek</option>
                      <option value="Satis Bilgisi">Satış Bilgisi</option>
                      <option value="Diger">Diğer Konular</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                    Mesajınız <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Mesajınızı buraya yazınız..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {step === 'verify' && (
                <div className="space-y-3">
                  <div className="text-sm text-slate-600">
                    Doğrulama kodunu e-posta adresine gönderdik. Kodu girip gönderimi tamamla.
                  </div>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
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
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              )}

            {info && <div className="form-alert form-alert--info text-center">{info}</div>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? 'Gönderiliyor...' : step === 'verify' ? 'Doğrula ve Gönder' : 'Gönder'}
              </button>
            </div>
            </form>
          </Reveal>

          <Reveal as="section" delay={150} className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <h2 className="text-lg font-semibold text-slate-900">İletişim Bilgilerimiz</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">Adres</p>
                  <p>Fevziçakmak Mah. Aksaray Çevreyolu Caddesi Akasya Sanayi Sitesi</p>
                  <p>A Blok No:18T 42210 Konya, Türkiye</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">E-posta</p>
                  <p>guohonglazerinfo@gmail.com</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Telefon</p>
                  <p>+90 536 831 67 87</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Çalışma Saatleri</p>
                  <p>Pazartesi - Cuma: 09:00 - 17:30</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 text-sm shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)]">
                <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hızlı ulaşım</div>
                <div className="mt-2 font-semibold text-slate-900">WhatsApp hattı</div>
                <p className="mt-1 text-xs text-slate-600">Sipariş ve servis takibi.</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 text-sm shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)]">
                <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Kurumsal</div>
                <div className="mt-2 font-semibold text-slate-900">Proje planlama</div>
                <p className="mt-1 text-xs text-slate-600">Saha keşif ve teklif akışı.</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-slate-900 p-6 text-white shadow-[0_18px_48px_-30px_rgba(15,23,42,0.5)]">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/60">Lokasyon</h3>
              <p className="mt-2 text-sm text-white/80">
                Konya merkez depo ve servis noktalarımızdan aynı gün çıkış.
              </p>
              <div className="mt-4 h-32 rounded-2xl border border-white/10 bg-[linear-gradient(120deg,_rgba(255,255,255,0.08),_transparent)]" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}


