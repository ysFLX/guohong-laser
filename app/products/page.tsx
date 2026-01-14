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

  return (
    <div className="min-h-screen space-y-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
            Makineler
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Lazer makineleri</h1>
          <p className="max-w-2xl text-base text-white/70">
            Uretim sureclerinizi optimize edecek lazer makine portfoyumuzu kesfedin.
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-lg dark:border-slate-800/70 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/3">
            <label htmlFor="search" className="sr-only">
              Ara
            </label>
            <div className="relative">
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
                className="block w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
                placeholder="Urun ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                  selectedCategory === category
                    ? 'bg-teal-500 text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Filtreler
            </label>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                aria-label="Stok filtresi"
                className="block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
              >
                <option value="Tumu">Stok: Tumu</option>
                <option value="Stokta">Stokta</option>
                <option value="Siparisle">Siparisle</option>
              </select>
              <select
                value={automationFilter}
                onChange={(e) => setAutomationFilter(e.target.value as typeof automationFilter)}
                aria-label="Otomasyon filtresi"
                className="block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
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
                className="block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
              >
                <option value="Tumu">Guc: Tumu</option>
                <option value="3-6 kW">3-6 kW</option>
                <option value="6-12 kW">6-12 kW</option>
                <option value="12+ kW">12+ kW</option>
              </select>
            </div>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-4 text-sm text-teal-900 dark:border-teal-400/40 dark:bg-slate-900/70 dark:text-teal-200">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              Filtre sonucu
            </p>
            <p className="mt-2">
              {filteredProducts.length} urun listeleniyor.{' '}
              {selectedCategory !== 'Tumu' ? `${selectedCategory} kategorisi` : 'Tum kategoriler'}.
            </p>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500 dark:text-slate-300">
          {filteredProducts.length} urun listeleniyor
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
        {filteredProducts.map((product, index) => (
          <Reveal key={product.id} as="div" delay={120 + index * 60}>
            <div
              id={`product-${product.id}`}
              className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
            >
              <div className="relative h-48 w-full overflow-hidden bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority={index < 2}
                />
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      product.stockLabel === 'Stokta' ? 'bg-teal-500 text-slate-900' : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {product.stockLabel}
                  </span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-slate-700">
                    {product.deliveryLabel}
                  </span>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                    {product.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(product.id)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      compareIds.includes(product.id)
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {compareIds.includes(product.id) ? 'Secildi' : 'Karsilastir'}
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
                <div className="grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Guc</span>
                    <p>{product.power}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Tabla</span>
                    <p>{product.workArea}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Otomasyon</span>
                    <p>{product.automation}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </Reveal>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-slate-600">Aramaniza uygun urun bulunamadi.</div>
      )}

      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex w-[92%] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-2xl backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Karsilastirma</div>
            <div className="font-semibold text-slate-900">{compareIds.length} urun secildi</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Temizle
            </button>
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

        {compareOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
            <div className="w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-600">Urun karsilastirma</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Modelleri yan yana gor</h2>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/quote"
                  className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Teknik teklif iste
                </Link>
                <button
                  type="button"
                  onClick={() => setCompareOpen(false)}
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
              <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      <tr className="border-b border-slate-200">
                        <th className="py-3 pr-4">Gorsel</th>
                        <th className="py-3 pr-4">Model</th>
                        <th className="py-3 pr-4">Guc</th>
                        <th className="py-3 pr-4">Tabla/Boru</th>
                        <th className="py-3 pr-4">Otomasyon</th>
                        <th className="py-3">Teslim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCompare.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-3 pr-4">
                            <div className="relative h-16 w-24 overflow-hidden rounded-xl bg-slate-100">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3 pr-4">{item.power}</td>
                          <td className="py-3 pr-4">{item.workArea}</td>
                          <td className="py-3 pr-4">{item.automation}</td>
                        <td className="py-3">{item.deliveryLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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


