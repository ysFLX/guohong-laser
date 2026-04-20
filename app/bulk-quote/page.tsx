'use client';

import { type ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Reveal from '@/components/home/Reveal';
import { machineProductNames } from '@/lib/machineCatalog';
import { trackEvent } from '@/lib/analytics';

type QuoteItem = {
  name: string;
  quantity: string;
  note: string;
};

export default function BulkQuotePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });
  const [items, setItems] = useState<QuoteItem[]>([{ name: '', quantity: '1', note: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preselected = (new URLSearchParams(window.location.search).get('product') ?? '').trim();
    if (!preselected) return;
    setItems((prev) => {
      if (prev.length === 0) return [{ name: preselected, quantity: '1', note: '' }];
      if (prev[0]?.name?.trim()) return prev;
      const next = [...prev];
      next[0] = { ...next[0], name: preselected };
      return next;
    });
  }, []);

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

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email' && emailError) setEmailError('');
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: '1', note: '' }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
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

    const cleanedItems = items.filter((item) => item.name.trim().length > 0);
    if (cleanedItems.length === 0) {
      setSubmitStatus({ success: false, message: 'En az bir ürün eklemelisiniz.' });
      setIsSubmitting(false);
      return;
    }

    const itemsText = cleanedItems
      .map((item, idx) => {
        const lines = [
          `${idx + 1}) Ürün: ${item.name}`,
          `   Adet: ${item.quantity || '-'}`,
          `   Not: ${item.note || '-'}`,
        ];
        return lines.join('\n');
      })
      .join('\n');

    const message = [
      'Toplu Teklif Talep Formu',
      '-------------------------',
      `Ad Soyad: ${formData.name}`,
      `Firma: ${formData.company || '-'}`,
      `E-posta: ${formData.email}`,
      `Telefon: ${formData.phone}`,
      'Ürünler:',
      itemsText,
      `Ek Mesaj: ${formData.message || '-'}`,
    ].join('\n');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          subject: 'Toplu Teklif Talebi',
          message,
          otp: step === 'verify' ? otp : undefined,
        }),
      });

      const data = await response.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Doğrulama kodu e-posta adresinize gönderildi.');
      } else if (response.ok) {
        trackEvent('generate_lead', {
          lead_type: 'bulk_quote',
          items_count: cleanedItems.length,
        });
        setSubmitStatus({
          success: true,
          message: 'Talebiniz alındı. Ekibimiz toplu teklifi hazırlayıp sizinle iletişime geçecek.',
        });
        setFormData({ name: '', company: '', email: '', phone: '', message: '' });
        setItems([{ name: '', quantity: '1', note: '' }]);
        setOtp('');
        setStep('details');
      } else {
        throw new Error(data.error || 'Form gönderilemedi');
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      setSubmitStatus({ success: false, message: messageText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-16">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.45),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
            Toplu Teklif
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Çoklu ürün teklifi iste</h1>
          <p className="max-w-2xl text-base text-white/70">
            Birden fazla ürün için tek seferde teklif talebi oluştur. Ekibimiz toplu fiyatlandırma hazırlasın.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
        {submitStatus && (
          <div className={`mb-6 form-alert ${submitStatus.success ? 'form-alert--success' : 'form-alert--error'}`}>
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Ad Soyad *</label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleFormChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Firma Adı</label>
              <input
                name="company"
                value={formData.company}
                onChange={handleFormChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">E-posta *</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleFormChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm"
              />
              {emailError && <div className="mt-2 text-sm text-red-600">{emailError}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefon *</label>
              <input
                name="phone"
                required
                value={formData.phone}
                onChange={handleFormChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Ürün Listesi</div>
              <button
                type="button"
                onClick={addItem}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                + Ürün ekle
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {items.map((item, idx) => (
                <div key={`item-${idx}`} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[1.6fr_0.6fr_0.8fr]">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Ürün</label>
                    <input
                      list="machine-products"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Ürün adı"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Adet</label>
                    <input
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Not</label>
                    <input
                      value={item.note}
                      onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Opsiyonel"
                    />
                  </div>
                  {items.length > 1 && (
                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-xs font-semibold text-red-600"
                      >
                        Ürünü kaldır
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <datalist id="machine-products">
            {machineProductNames.map((product) => (
              <option key={product} value={product} />
            ))}
          </datalist>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ek bilgiler</label>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleFormChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm"
              placeholder="Ek notlar veya teslimat detayları..."
            />
          </div>

          {step === 'verify' && (
            <div className="space-y-3">
              <div className="text-sm text-slate-600">
                Doğrulama kodunu e-posta adresine gönderdik. Kodu girip gönderimi tamamla.
              </div>
              <input
                name="otp"
                type="text"
                inputMode="numeric"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-center text-sm text-slate-900 shadow-sm"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          )}

          {info && <div className="form-alert form-alert--info text-center">{info}</div>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              İptal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2">
              {isSubmitting ? 'Gönderiliyor...' : step === 'verify' ? 'Doğrula ve gönder' : 'Teklif iste'}
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}


