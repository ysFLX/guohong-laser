'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { machineProductNames } from '@/lib/machineCatalog';

// The floating "Hızlı Teklif" dock is intentionally disabled.
// Keep the `/quote` and other CTAs, but remove the bottom-corner widget.
// Re-enable later by setting `NEXT_PUBLIC_ENABLE_QUICK_QUOTE=1`.
const QUICK_QUOTE_ENABLED = false;

type FormState = {
  name: string;
  email: string;
  phone: string;
  product: string;
  message: string;
};

const emptyForm: FormState = {
  name: '',
  email: '',
  phone: '',
  product: '',
  message: '',
};

export default function QuickQuoteDock() {
  if (!QUICK_QUOTE_ENABLED) return null;

  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isSpareParts = pathname?.startsWith('/spare-parts');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: 'Hizli Teklif',
          product: form.product,
          message: form.message,
          otp: step === 'verify' ? otp : undefined,
        }),
      });
      const data = await res.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Doğrulama kodu e-postana gönderildi.');
      } else if (data.success) {
        setInfo('Talebiniz alındı. En kısa sürede geri döneceğiz.');
        setForm(emptyForm);
        setOtp('');
        setStep('details');
      } else {
        throw new Error(data.error || 'Talep gönderilemedi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talep gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed bottom-6 z-40 ${isSpareParts ? 'left-6 right-auto' : 'right-6'}`}>
      {open && (
        <div className="mb-3 w-[320px] rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hızlı teklif</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">2 dakikada fiyat al</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:text-slate-900"
            >
              Kapat
            </button>
          </div>

          {info && <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">{info}</div>}
          {error && <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>}

          <form onSubmit={submit} className="mt-4 space-y-3 text-sm">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Ad soyad"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="E-posta"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Telefon"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <select
              name="product"
              value={form.product}
              onChange={(e) => setForm((prev) => ({ ...prev, product: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Makine seçiniz</option>
              {machineProductNames.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              rows={3}
              placeholder="Talep detayınız"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />

            {step === 'verify' && (
              <input
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Doğrulama kodu"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-center tracking-[0.3em] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                maxLength={6}
                required
              />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Gönderiliyor...' : step === 'verify' ? 'Doğrula ve gönder' : 'Teklif iste'}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-white" />
        Hızlı Teklif
      </button>
    </div>
  );
}


