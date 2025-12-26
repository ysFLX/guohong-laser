'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const products = [
  'Acik Cift Tablali Sac Kesim Makinasi',
  'Agir Tip Boru Kesim Makinasi',
  'Boru Sac Ikisi Bir Arada Lazer Kesim Makinasi',
  'Cift Tabla Sac Kesim Makinasi',
  'Degistirilebilir Ayna Boru Kesim Makinasi',
  'Demir Kesim Makinasi',
  'Genis Tabla Yuksek KW Sac Kesim Makinasi',
  'Kucuk Capli Tam Otomatik Yukleme ve Indirme Boru Kesim Makinasi',
  'Rayli Sac Kesim Makinasi',
  'Tek Tabla Sac Kesim Makinasi',
  'Yandan Yuklemeli Yari Otomatik Boru Kesim Makinasi',
  'Yari Otomatik Yuklemeli Boru Kesim Makinasi'
];

export default function QuotePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    product: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{success: boolean; message: string} | null>(null);
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [info, setInfo] = useState('');

  const isEmailValid = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          subject: `Fiyat Teklifi Talebi - ${formData.product}`,
          message: `Fiyat Teklifi Talep Formu:
            -------------------------
            Ad Soyad: ${formData.name}
            Firma: ${formData.company}
            E-posta: ${formData.email}
            Telefon: ${formData.phone}
            Urun: ${formData.product}
            Mesaj: ${formData.message}`,
        }),
      });

      const data = await response.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Dogrulama kodu e-posta adresinize gonderildi.');
      } else if (response.ok) {
        setSubmitStatus({ success: true, message: 'Talebiniz alindi. En kisa surede sizinle iletisime gecilecektir.' });
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          product: '',
          message: ''
        });
        setOtp('');
        setStep('details');
      } else {
        throw new Error(data.error || 'Form gonderilemedi');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata olustu. Lutfen daha sonra tekrar deneyiniz.';
      setSubmitStatus({ success: false, message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Fiyat Teklifi Talebi
          </h1>
          <p className="mt-3 text-xl text-gray-500 dark:text-gray-300">
            Lutfen asagidaki formu doldurarak urunlerimiz hakkinda fiyat teklifi alabilirsiniz.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-8">
          {submitStatus && (
            <div className={`mb-6 p-4 rounded-md ${submitStatus.success ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    className="py-3 px-4 block w-full shadow-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Firma Adi
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="company"
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  E-posta Adresi <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {emailError && (
                  <div className="mt-2 text-sm text-red-600">{emailError}</div>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefon Numarasi <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ilgilendiginiz Urun <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="product"
                    name="product"
                    required
                    value={formData.product}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Urun seciniz</option>
                    {products.map((product, index) => (
                      <option key={index} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ek Bilgiler
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Eklemek istediginiz notlar veya ozel istekleriniz..."
                  ></textarea>
                </div>
              </div>
            </div>

            {step === 'verify' && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Dogrulama kodunu e-posta adresine gonderdik. Kodu girip gonderimi tamamla.
                </div>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="py-3 px-4 block w-full shadow-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white tracking-widest text-center"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {info && (
              <div className="text-green-700 text-sm text-center p-3 bg-green-50 rounded-lg border border-green-100">
                {info}
              </div>
            )}

            <div className="flex items-center justify-end gap-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Iptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Gonderiliyor...' : step === 'verify' ? 'Dogrula ve Gonder' : 'Gonder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


