'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Reveal from '@/components/home/Reveal';
import { trackEvent } from '@/lib/analytics';

function ContactPageInner() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const sessionName = session?.user?.name || '';
  const sessionEmail = session?.user?.email || '';
  const sessionPhone = session?.user?.phone || '';
  const subjectParam = searchParams.get('subject')?.trim() ?? '';
  const messageParam = searchParams.get('message')?.trim() ?? '';
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

  useEffect(() => {
    if (!subjectParam && !messageParam) return;
    setFormData((prev) => ({
      ...prev,
      subject: subjectParam || prev.subject,
      message: messageParam || prev.message,
    }));
  }, [subjectParam, messageParam]);

  useEffect(() => {
    if (!sessionName && !sessionEmail && !sessionPhone) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || sessionName,
      email: prev.email || sessionEmail,
      phone: prev.phone || sessionPhone,
    }));
  }, [sessionEmail, sessionName, sessionPhone]);

  const isEmailValid = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email' && emailError) setEmailError('');
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
        headers: { 'Content-Type': 'application/json' },
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
        trackEvent('generate_lead', { lead_type: 'contact', subject: formData.subject });
        setSubmitStatus({ success: true, message: 'Mesajınız alındı. En kısa sürede size geri döneceğiz.' });
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
      setSubmitStatus({ success: false, message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-14 pb-16 text-white">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#15148c] shadow-[0_40px_120px_-60px_rgba(5,0,92,0.95)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.24),_transparent_30%),linear-gradient(120deg,_rgba(5,0,92,0.2),_rgba(5,0,92,0.92))]" />
        <div className="relative grid gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#ff6a0d]">Bize Ulaşın</p>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-5xl">Sorularınız için buradayız</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/76">
              Teklif, servis ya da ürün bilgisi için formu doldürün. Referans sitedeki inquiry alanı mantığıyla hızlı geri dönüş akışı burada çalışıyor.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Teknik Destek', text: 'Kurulum, arıza ve bakım kaydı' },
              { title: 'Teklif Talebi', text: 'Model ve kapasite danışmanlığı' },
              { title: 'Satış', text: 'Teslim ve tedarik planı' },
              { title: 'Kurumsal', text: 'Büyük proje görüşmeleri' },
            ].map((card) => (
              <div key={card.title} className="rounded-[26px] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <div className="text-lg font-semibold text-white">{card.title}</div>
                <div className="mt-2 text-sm text-white/72">{card.text}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
          {submitStatus ? (
            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${submitStatus.success ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100' : 'border-rose-300/25 bg-rose-400/10 text-rose-100'}`}>
              {submitStatus.message}
            </div>
          ) : null}
          {info ? (
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/80">{info}</div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-white/82">
                Ad Soyad
                <input name="name" required value={formData.name} onChange={handleChange} className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-white/82">
                E-posta
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]" />
                {emailError ? <span className="text-xs text-rose-200">{emailError}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-medium text-white/82">
                Telefon
                <input name="phone" value={formData.phone} onChange={handleChange} className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-white/82">
                Konu
                <select name="subject" value={formData.subject} onChange={handleChange} className="rounded-2xl border border-white/12 bg-[#f7f9ff] px-4 py-3 text-white outline-none focus:border-[#ff6a0d]">
                  <option value="Genel Soru">Genel Soru</option>
                  <option value="Teknik Destek">Teknik Destek</option>
                  <option value="Satış Bilgisi">Satış Bilgisi</option>
                  <option value="Diger">Diğer</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-white/82">
              Mesajınız
              <textarea name="message" rows={6} required value={formData.message} onChange={handleChange} className="rounded-[26px] border border-white/12 bg-white/6 px-4 py-4 text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]" />
            </label>

            {step === 'verify' ? (
              <label className="grid gap-2 text-sm font-medium text-white/82">
                Doğrulama Kodu
                <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-center text-white outline-none placeholder:text-white/35 focus:border-[#ff6a0d]" />
              </label>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#ff6a0d] px-7 py-3 text-sm font-semibold text-[#15148c] disabled:opacity-70">
                {isSubmitting ? 'Gönderiliyor...' : step === 'verify' ? 'Doğrula ve Gönder' : 'Gönder'}
              </button>
              <Link href="/quote" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white">
                Teklif Formu
              </Link>
            </div>
          </form>
        </Reveal>

        <Reveal as="section" className="space-y-5">
          <div className="rounded-[34px] border border-white/10 bg-[#15148c] p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">İletişim bilgileri</p>
            <div className="mt-5 grid gap-4 text-sm">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="text-white/45">Telefon</div>
                <div className="mt-2 font-semibold text-white">+90 536 831 67 87</div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="text-white/45">E-posta</div>
                <div className="mt-2 font-semibold text-white">guohonglazerinfo@gmail.com</div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="text-white/45">Adres</div>
                <div className="mt-2 font-semibold text-white">Aksaray Çevreyolu Caddesi Akasya Sanayi Sitesi No: 18T Konya / Karatay</div>
              </div>
            </div>
          </div>
          <div className="rounded-[34px] border border-white/10 bg-[#15148c] p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Çalışma saatleri</p>
            <div className="mt-4 text-sm leading-8 text-white/76">
              Pazartesi - Cuma: 09:00 - 17:30
              <br />
              Cumartesi: Proje planına göre
              <br />
              Acil servis taleplerinde hızlı yönlendirme yapılır.
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#15148c]" />}><ContactPageInner /></Suspense>;
}
