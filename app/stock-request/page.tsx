'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function StockRequestPage() {
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
      setEmailError('Lutfen dogru bir e-posta adresi giriniz.');
      setIsSubmitting(false);
      return;
    }

    const messageParts = [
      `Urun: ${formData.product || '-'}`,
      `Urun ID: ${formData.productId || '-'}`,
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
        setInfo('Dogrulama kodu e-posta adresinize gonderildi.');
      } else if (data.success) {
        setSubmitStatus({
          success: true,
          message: 'Talebiniz alindi. Stok guncelligi icin sizinle iletisime gececegiz.',
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
        throw new Error(data.error || data.message || 'Talep gonderilemedi');
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
    <div className="min-h-screen bg-slate-50/80 px-4 py-10 sm:px-8">
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
              Stokta olmayan urunler icin talep birak. Stok acildiginda size oncelikli bilgi gonderelim.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">Oncelikli bilgilendirme</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Hizli tedarik</span>
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
                  <div className="form-label">Urun adi *</div>
                  <input
                    name="product"
                    required
                    value={formData.product}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="space-y-2">
                  <div className="form-label">Urun ID</div>
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
                    <option value="Planli">Planli</option>
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
                  <div className="text-sm text-slate-600">
                    Dogrulama kodunu e-posta adresine gonderdik. Kodu girip gonderimi tamamla.
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
                {isSubmitting ? 'Gonderiliyor...' : step === 'verify' ? 'Dogrula ve gonder' : 'Talebi gonder'}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Neden talep birakmali?</div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Stok girisi oldugunda once size haber verilir.</li>
                <li>Tedarik surecinde onceliklendirme saglanir.</li>
                <li>Alternatif parca onerileri paylasilir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Baglantilar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/spare-parts" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Yedek parcalara don
                </Link>
                <Link href="/returns" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Iade ve garanti
                </Link>
                <Link href="/contact?subject=Stok+Talebi" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Destek iletisimi
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
