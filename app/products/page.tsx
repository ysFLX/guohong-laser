'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Reveal from '@/components/home/Reveal';
import { machineProducts } from '@/lib/machineCatalog';

const products = machineProducts;

const categories = ['Tumu', 'Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Ozel Kesim'];

const servicePackages = [
  {
    name: 'Kurulum Paketi',
    description: 'Yerinde kurulum, test ve operator egitimi.',
    badge: 'Baslangic',
  },
  {
    name: 'Servis Plus',
    description: 'Periyodik bakim, hizli servis ve yedek parca onceligi.',
    badge: 'En cok tercih',
  },
  {
    name: 'Uzaktan Izleme',
    description: 'Performans raporu, enerji takibi ve uzaktan destek.',
    badge: 'Verimlilik',
  },
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Guohong Lazer urunleri',
  itemListElement: products.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: product.name,
    url: baseUrl ? `${baseUrl}/products#product-${product.id}` : `/products#product-${product.id}`,
  })),
};

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tumu');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'Tumu' | 'Stokta' | 'Siparisle'>('Tumu');
  const [automationFilter, setAutomationFilter] = useState<'Tumu' | 'Otomatik' | 'Yari otomatik' | 'Manuel'>('Tumu');
  const [powerFilter, setPowerFilter] = useState<'Tumu' | '3-6 kW' | '6-12 kW' | '12+ kW'>('Tumu');
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
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

  const parsePowerRange = (value: string) => {
    const matches = value.match(/\d+/g)?.map((n) => Number(n)).filter((n) => Number.isFinite(n)) ?? [];
    if (matches.length === 0) return null;
    const min = Math.min(...matches);
    const max = Math.max(...matches);
    return { min, max };
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Tumu' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = stockFilter === 'Tumu' || product.stockLabel === stockFilter;
    const automationValue = product.automation.toLowerCase();
    const matchesAutomation =
      automationFilter === 'Tumu' ||
      (automationFilter === 'Otomatik' && automationValue.includes('otomatik') && !automationValue.includes('yari')) ||
      (automationFilter === 'Yari otomatik' && automationValue.includes('yari')) ||
      (automationFilter === 'Manuel' && automationValue.includes('manuel'));
    const powerRange = parsePowerRange(product.power);
    const matchesPower =
      powerFilter === 'Tumu' ||
      (powerFilter === '3-6 kW' && powerRange && powerRange.min >= 3 && powerRange.max <= 6) ||
      (powerFilter === '6-12 kW' && powerRange && powerRange.min <= 6 && powerRange.max >= 12) ||
      (powerFilter === '12+ kW' && powerRange && powerRange.max >= 12);

    return matchesCategory && matchesSearch && matchesStock && matchesAutomation && matchesPower;
  });

  const selectedCompare = compareIds
    .map((id) => products.find((product) => product.id === id))
    .filter((item): item is (typeof products)[number] => Boolean(item));

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const isEmailValid = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email' && emailError) {
      setEmailError('');
    }
  };

  const openQuoteModal = (productName: string) => {
    setFormData((prev) => ({
      ...prev,
      product: productName,
    }));
    setSubmitStatus(null);
    setEmailError('');
    setOtp('');
    setStep('details');
    setInfo('');
    setQuoteOpen(true);
  };

  const closeQuoteModal = () => {
    setQuoteOpen(false);
    setSubmitStatus(null);
    setEmailError('');
    setOtp('');
    setStep('details');
    setInfo('');
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
          message: `Fiyat Teklifi Talep Formu:\n-------------------------\nAd Soyad: ${formData.name}\nFirma: ${formData.company}\nE-posta: ${formData.email}\nTelefon: ${formData.phone}\nUrun: ${formData.product}\nMesaj: ${formData.message}`,
        }),
      });

      const data = await response.json();

      if (data.step === 'verify') {
        setStep('verify');
        setInfo('Dogrulama kodu e-posta adresinize gonderildi.');
      } else if (response.ok) {
        setSubmitStatus({
          success: true,
          message: 'Talebiniz alindi. En kisa surede sizinle iletisime gecilecektir.',
        });
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          product: formData.product,
          message: '',
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
    <div className="min-h-screen space-y-16 bg-slate-50 px-4 pb-16 pt-6 sm:px-6 lg:px-10 dark:bg-slate-950 dark:text-slate-200 dark:[&_.bg-white]:bg-slate-900/70 dark:[&_.border-slate-200\\/70]:border-white/10 dark:[&_.text-slate-900]:text-white dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Reveal
        as="section"
        className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-white px-6 py-12 text-slate-900 shadow-xl sm:px-10 lg:px-14"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_60%)]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_20%_30%,_rgba(14,165,233,0.16),_transparent_65%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-700">
              E-katalog
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Lazer makine katalogu</h1>
            <p className="max-w-2xl text-base text-slate-600">
              Uretim sureclerinizi optimize edecek lazer makine portfoyumuzu tek ekranda karsilastirin.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-indigo-500">
              <span className="rounded-full border border-indigo-200 bg-white px-4 py-2">Fiyat teklifle belirlenir</span>
              <span className="rounded-full border border-indigo-200 bg-white px-4 py-2">Kurumsal teklif akisi</span>
            </div>
          </div>
          <div className="rounded-[28px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Katalog hizli bakis</p>
            <div className="mt-4 grid gap-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Toplam model</span>
                <span className="font-semibold text-slate-900">{products.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Kategoriler</span>
                <span className="font-semibold text-slate-900">{categories.length - 1}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Teklif cevabi</span>
                <span className="font-semibold text-slate-900">30 dk icinde</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-lg lg:sticky lg:top-24">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Katalog filtreleri</p>
              <label htmlFor="search" className="sr-only">
                Ara
              </label>
              <div className="relative mt-3">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Model veya kategori ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Kategori</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Detay filtreleri</p>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                aria-label="Stok filtresi"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Tumu">Stok: Tumu</option>
                <option value="Stokta">Stokta</option>
                <option value="Siparisle">Siparisle</option>
              </select>
              <select
                value={automationFilter}
                onChange={(e) => setAutomationFilter(e.target.value as typeof automationFilter)}
                aria-label="Otomasyon filtresi"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Tumu">Otomasyon: Tumu</option>
                <option value="Otomatik">Otomatik</option>
                <option value="Yari otomatik">Yari otomatik</option>
                <option value="Manuel">Manuel</option>
              </select>
              <select
                value={powerFilter}
                onChange={(e) => setPowerFilter(e.target.value as typeof powerFilter)}
                aria-label="Guc filtresi"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Tumu">Guc: Tumu</option>
                <option value="3-6 kW">3-6 kW</option>
                <option value="6-12 kW">6-12 kW</option>
                <option value="12+ kW">12+ kW</option>
              </select>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm text-indigo-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Filtre sonucu</p>
              <p className="mt-2">
                {filteredProducts.length} urun listeleniyor.{' '}
                {selectedCategory !== 'Tumu' ? `${selectedCategory} kategorisi` : 'Tum kategoriler'}.
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/70 bg-white/90 px-5 py-4 shadow-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Katalog listesi</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{filteredProducts.length} model</p>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span className="rounded-full border border-slate-200 px-4 py-2">Teklif odakli</span>
              <span className="rounded-full border border-slate-200 px-4 py-2">Kiyaslama acik</span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <Reveal key={product.id} as="div" delay={120 + index * 60}>
                <div
                  id={`product-${product.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1280px) 100vw, 25vw"
                      className="object-cover"
                      priority={index < 2}
                    />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
                      <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-slate-700">
                        E-katalog
                      </span>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
                        {product.category}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
                      <span
                        className={`rounded-full px-3 py-1 ${
                          product.stockLabel === 'Stokta' ? 'bg-emerald-500 text-white' : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {product.stockLabel}
                      </span>
                      <span className="rounded-full bg-white/90 px-3 py-1 text-slate-700">
                        {product.deliveryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <span className="inline-flex w-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-700">
                      Fiyat teklif ile
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-600">{product.description}</p>
                    <div className="grid gap-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="uppercase tracking-[0.2em] text-slate-400">Guc</span>
                        <span className="font-semibold text-slate-900">{product.power}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="uppercase tracking-[0.2em] text-slate-400">Tabla</span>
                        <span className="font-semibold text-slate-900">{product.workArea}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="uppercase tracking-[0.2em] text-slate-400">Otomasyon</span>
                        <span className="font-semibold text-slate-900">{product.automation}</span>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => toggleCompare(product.id)}
                        className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                          compareIds.includes(product.id)
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {compareIds.includes(product.id) ? 'Secildi' : 'Karsilastir'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openQuoteModal(product.name)}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-slate-800"
                      >
                        Teklif iste
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-600">
              Aramaniza uygun urun bulunamadi.
            </div>
          )}
        </div>
      </Reveal>

      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex w-[92%] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-2xl backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Karsilastirma</div>
            <div className="font-semibold text-slate-900">{compareIds.length} urun secildi</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#compare"
              onClick={(event) => {
                event.preventDefault();
                setCompareOpen(true);
              }}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Tabloya git
            </a>
          </div>
        </div>
      )}

      {quoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.3)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%)]" />
            <div className="relative space-y-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hizli teklif</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Makine teklifi iste</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Urun icin teknik bilgileri ilet, ekibimiz sana hizli teklif hazirlasin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeQuoteModal}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Kapat
                </button>
              </div>

              {submitStatus && (
                <div
                  className={`form-alert ${submitStatus.success ? 'form-alert--success' : 'form-alert--error'}`}
                >
                  {submitStatus.message}
                </div>
              )}
              {info && <div className="form-alert form-alert--info text-center">{info}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Ad Soyad *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Firma Adi</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">E-posta *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                    {emailError && <div className="mt-2 text-sm text-red-600">{emailError}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Telefon *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Ilgilendiginiz urun *</label>
                    <input
                      type="text"
                      name="product"
                      readOnly
                      value={formData.product}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Ek bilgiler</label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                      placeholder="Eklemek istediginiz notlar veya ozel istekleriniz..."
                    />
                  </div>
                </div>

                {step === 'verify' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600">
                      Dogrulama kodunu e-posta adresine gonderdik. Kodu girip gonderimi tamamla.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Dogrulama Kodu</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeQuoteModal}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Iptal
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2">
                    {isSubmitting ? 'Gonderiliyor...' : step === 'verify' ? 'Dogrula ve gonder' : 'Gonder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Reveal as="section" className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-200">
              Teklif merkezi
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Uretim hattina uygun makine icin hizli teklif al
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Butun makineler kurumsal teklif ile fiyatlanir. Teknik ekip 30 dakika icinde geri doner.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm"
            >
              Teklif formu
            </Link>
            <Link
              href="/contact?subject=Makine+Teklifi"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Danisman iste
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: 'Hizli kesif', desc: 'Ihtiyac analizi + kapasite hesaplama' },
            { title: 'Teknik teklif', desc: 'Guc, tabla ve otomasyon netligi' },
            { title: 'Kurulum planı', desc: 'Takvim ve servis SLA dogrulama' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

        {compareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur">
            <div className="relative w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/20 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.15),_transparent_55%)]" />
              <div className="relative max-h-[85vh] overflow-y-auto p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-teal-600">Karsilastirma paneli</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Modelleri yan yana gor</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedCompare.length || 0} model secildi. En fazla 3 model karsilastirabilirsin.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/quote"
                      className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Teknik teklif iste
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setCompareOpen(false);
                        setCompareIds([]);
                      }}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Kapat
                    </button>
                  </div>
                </div>

                {selectedCompare.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-sm text-slate-600">
                    Karsilastirma icin kartlardan en az 2 urun sec.
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    {selectedCompare.map((item) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                      >
                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 320px"
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute left-4 top-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                            <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1">
                              {item.category}
                            </span>
                            <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1">
                              {item.stockLabel}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4 p-5">
                          <div>
                            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Model</div>
                            <div className="mt-2 text-lg font-semibold text-slate-900">{item.name}</div>
                          </div>
                          <div className="grid gap-3 text-sm text-slate-600">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Guc</span>
                              <span className="font-semibold text-slate-900">{item.power}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Tabla/Boru</span>
                              <span className="font-semibold text-slate-900">{item.workArea}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Otomasyon</span>
                              <span className="font-semibold text-slate-900">{item.automation}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Teslim</span>
                              <span className="font-semibold text-slate-900">{item.deliveryLabel}</span>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                            Uygun konfigurasyon icin teklif isteyebiliriz.
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-200">
              Servis paketleri
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Kurulum ve destek paketleri
            </h2>
          </div>
          <Link
            href="/contact"
            className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Destek al
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {servicePackages.map((pkg) => (
            <div key={pkg.name} className="rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{pkg.name}</p>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                  {pkg.badge}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{pkg.description}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}


