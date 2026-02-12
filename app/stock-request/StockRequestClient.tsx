'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { trackEvent } from '@/lib/analytics';

export default function StockRequestClient() {
  const searchParams = useSearchParams();
  const presetProduct = searchParams.get('product') || '';
  const presetProductId = searchParams.get('id') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product: presetProduct,
    productId: presetProductId,
    quantity: '1',
    urgency: 'Normal',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!presetProduct && !presetProductId) return;
    setFormData((prev) => ({
      ...prev,
      product: prev.product || presetProduct,
      productId: prev.productId || presetProductId,
    }));
  }, [presetProduct, presetProductId]);

  const isEmailValid = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
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

    const messageParts = [
      `Ürün: ${formData.product || '-'}`,
      `Ürün ID: ${formData.productId || '-'}`,
      `Adet: ${formData.quantity || '-'}`,
      `Aciliyet: ${formData.urgency || '-'}`,
      `Not: ${formData.note || '-'}`,
      `Telefon: ${formData.phone || '-'}`,
    ];

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: 'Stok Talebi',
          message: messageParts.join('\n'),
          otp: step === 'verify' ? otp : undefined,
        }),
      });

      const data = await response.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Doğrulama kodu e-posta adresinize gönderildi.');
      } else if (data.success) {
        trackEvent('generate_lead', {
          lead_type: 'stock_request',
          product: formData.product || undefined,
          urgency: formData.urgency,
        });
        setSubmitStatus({
          success: true,
          message: 'Talebiniz alındı. Stok güncelliği için sizinle iletişime geçeceğiz.',
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          product: presetProduct,
          productId: presetProductId,
          quantity: '1',
          urgency: 'Normal',
          note: '',
        });
        setOtp('');
        setStep('details');
      } else {
        throw new Error(data.error || data.message || 'Talep gönderilemedi');
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
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.35),_transparent_60%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Stok talebi
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Stok gelince haber ver</h1>
            <p className="max-w-2xl text-base text-white/70">
              Stokta olmayan ürünler için talep bırak. Stok açıldığında size öncelikli bilgi gönderelim.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">Öncelikli bilgilendirme</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Hızlı tedarik</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Kurumsal destek</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
            {submitStatus && (
              <div className={`mb-6 form-alert ${submitStatus.success ? 'form-alert--success' : 'form-alert--error'}`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="form-label">Ad Soyad *</div>
                  <input name="name" required value={formData.name} onChange={handleChange} className="form-input" />
                </div>
                <div className="space-y-2">
                  <div className="form-label">E-posta *</div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                  />
                  {emailError && <div className="text-xs text-red-600">{emailError}</div>}
                </div>
                <div className="space-y-2">
                  <div className="form-label">Telefon</div>
                  <input name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
                </div>
                <div className="space-y-2">
                  <div className="form-label">Ürün adı *</div>
                  <input
                    name="product"
                    required
                    value={formData.product}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <div className="form-label">Ürün ID</div>
                  <input
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <div className="form-label">Adet</div>
                  <input
                    name="quantity"
                    inputMode="numeric"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="form-label">Aciliyet</div>
                  <select name="urgency" value={formData.urgency} onChange={handleChange} className="form-input">
                    <option value="Normal">Normal</option>
                    <option value="Acil (48 saat)">Acil (48 saat)</option>
                    <option value="Planlı">Planlı</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="form-label">Not</div>
                  <textarea
                    name="note"
                    rows={4}
                    value={formData.note}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ek bilgi yazabilirsiniz."
                  />
                </div>
              </div>

              {step === 'verify' && (
                <div className="space-y-2">
                  <div className="text-sm text-[var(--gray-500)]">
                    Doğrulama kodunu e-posta adresine gönderdik. Kodu girip gönderimi tamamla.
                  </div>
                  <input
                    name="otp"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-input text-center"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              {info && <div className="form-alert form-alert--info text-center">{info}</div>}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Gönderiliyor...' : step === 'verify' ? 'Doğrula ve gönder' : 'Talebi gönder'}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="card-surface p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--indigo-600)]">Neden talep bırakmalıyım?</div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--gray-500)]">
                <li>Stok girişi olduğunda önce size haber verilir.</li>
                <li>Tedarik sürecinde önceliklendirme sağlanır.</li>
                <li>Alternatif parça önerileri paylaşılır.</li>
              </ul>
            </div>
            <div className="card-surface p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--indigo-600)]">Bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm">
                <Link
                  href="/spare-parts"
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  Yedek parçalara dön
                </Link>
                <Link
                  href="/returns"
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  İade ve garanti
                </Link>
                <Link
                  href="/contact?subject=Stok+Talebi"
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  Destek iletişimi
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
