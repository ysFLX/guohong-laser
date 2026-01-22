'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { machineProductNames } from '@/lib/machineCatalog';

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
        setInfo('Dogrulama kodu e-postana gonderildi.');
      } else if (data.success) {
        setInfo('Talebin alindi. En kisa surede geri donecegiz.');
        setForm(emptyForm);
        setOtp('');
        setStep('details');
      } else {
        throw new Error(data.error || 'Talep gonderilemedi.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Talep gonderilemedi.');
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
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Hizli teklif</div>
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

          {info && <div className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-xs text-teal-700">{info}</div>}
          {error && <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>}

          <form onSubmit={submit} className="mt-4 space-y-3 text-sm">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Ad soyad"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
              required
            />
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="E-posta"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
              required
            />
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Telefon"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
            <select
              name="product"
              value={form.product}
              onChange={(e) => setForm((prev) => ({ ...prev, product: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="">Makine seciniz</option>
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
              placeholder="Talep detayiniz"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
              required
            />

            {step === 'verify' && (
              <input
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Dogrulama kodu"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-center tracking-[0.3em] focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                maxLength={6}
                required
              />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Gonderiliyor...' : step === 'verify' ? 'Dogrula ve gonder' : 'Teklif iste'}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 hover:bg-teal-500"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-white" />
        Hizli Teklif
      </button>
    </div>
  );
}
