'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Reveal from '@/components/home/Reveal';

type Product = {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  features: string[];
  power: string;
  workArea: string;
  automation: string;
  stockLabel: string;
  deliveryLabel: string;
};

const products: Product[] = [
  {
    id: 1,
    name: 'Acik Cift Tablali Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/1.jpg',
    description:
      'Kesintisiz uretim icin tasarlanmis, yuksek verimli cift tablali sac kesim cozumu. Otomatik tabla degisimiyle verimlilik artar.',
    features: ['Cift tablali surekli uretim', 'Yuksek hassasiyet', 'Dusuk enerji tuketimi'],
    power: '6-12 kW',
    workArea: '1500x3000',
    automation: 'Otomatik tabla',
    stockLabel: 'Stokta',
    deliveryLabel: '3-5 hafta',
  },
  {
    id: 2,
    name: 'Agir Tip Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/2.jpg',
    description: 'Agir sanayi uygulamalari icin gelistirilmis, yuksek dayanimli boru kesim cozumu.',
    features: ['Agir hizmet tipi yapi', 'Genis boru cap araligi', 'Yuksek hassasiyet'],
    power: '6-15 kW',
    workArea: 'Boru cap 20-220mm',
    automation: 'Otomatik yukleme',
    stockLabel: 'Siparisle',
    deliveryLabel: '5-7 hafta',
  },
  {
    id: 3,
    name: 'Boru ve Sac Ikisi Bir Arada Lazer Kesim Makinesi',
    category: 'Kombine Kesim',
    image: '/images/3.jpg',
    description: 'Hem sac hem de boru kesimi icin tek cozum. Iki islemi tek makinede birlestirir.',
    features: ['Cift amacli kullanim', 'Hizli islem degisimi', 'Genis calisma alani'],
    power: '6-12 kW',
    workArea: '1500x3000 + boru',
    automation: 'Hizli degisim',
    stockLabel: 'Stokta',
    deliveryLabel: '4-6 hafta',
  },
  {
    id: 4,
    name: 'Cift Tabla Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/4.jpg',
    description: 'Kesintisiz uretim icin optimize edilmis, yuksek kapasiteli lazer kesim sistemi.',
    features: ['Kesintisiz uretim', 'Otomatik tabla degisimi', 'Kolay bakim'],
    power: '6-20 kW',
    workArea: '2000x4000',
    automation: 'Cift tabla',
    stockLabel: 'Siparisle',
    deliveryLabel: '6-8 hafta',
  },
  {
    id: 5,
    name: 'Degistirilebilir Ayna Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/5.jpg',
    description: 'Farkli boru caplari icin hizli ayna degisimi yapabilen esnek uretim cozumu.',
    features: ['Hizli ayna degisimi', 'Genis boru cap araligi', 'Dusuk bakim gereksinimi'],
    power: '6-12 kW',
    workArea: 'Boru cap 20-240mm',
    automation: 'Ayna degisimi',
    stockLabel: 'Stokta',
    deliveryLabel: '4-6 hafta',
  },
  {
    id: 6,
    name: 'Demir Kesim Makinesi',
    category: 'Ozel Kesim',
    image: '/images/6.jpg',
    description: 'Sert metaller ve demir kesimi icin tasarlanmis yuksek guclu lazer cozumu.',
    features: ['Yuksek guclu lazer kaynagi', 'Sert metalde etkili kesim', 'Guvenli calisma'],
    power: '12-30 kW',
    workArea: '1500x3000',
    automation: 'Guvenlik paketi',
    stockLabel: 'Siparisle',
    deliveryLabel: '6-9 hafta',
  },
  {
    id: 7,
    name: 'Genis Tabla Yuksek KW Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/7.jpg',
    description: 'Buyuk ebatli saclar icin yuksek guclu, endustriyel lazer kesim cozumu.',
    features: ['Genis calisma alani', 'Yuksek guclu lazer kaynagi', 'Yuksek kesim hizi'],
    power: '12-30 kW',
    workArea: '2500x6000',
    automation: 'Otomatik yukleme',
    stockLabel: 'Siparisle',
    deliveryLabel: '6-9 hafta',
  },
  {
    id: 8,
    name: 'Kucuk Capli Tam Otomatik Yukleme ve Indirme Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/8.jpg',
    description: 'Kucuk capli borular icin tam otomatik yukleme/bosaltma sistemli cozum.',
    features: ['Tam otomatik sistem', 'Yuksek uretim hizi', 'Dusuk iscilik maliyeti'],
    power: '3-6 kW',
    workArea: 'Boru cap 10-120mm',
    automation: 'Tam otomatik',
    stockLabel: 'Stokta',
    deliveryLabel: '3-5 hafta',
  },
  {
    id: 9,
    name: 'Rayli Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/9.jpg',
    description: 'Uzun sac levhalar icin rayli sistem tasarimiyla yuksek hassasiyet.',
    features: ['Rayli tasima sistemi', 'Uzun saclarda yuksek hassasiyet', 'Dusuk enerji tuketimi'],
    power: '6-15 kW',
    workArea: '2000x8000',
    automation: 'Rayli sistem',
    stockLabel: 'Siparisle',
    deliveryLabel: '7-9 hafta',
  },
  {
    id: 10,
    name: 'Tek Tabla Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/10.jpg',
    description: 'Kucuk ve orta olcekli isletmeler icin ekonomik, verimli tek tablali cozum.',
    features: ['Ekonomik cozum', 'Kompakt tasarim', 'Kolay kullanim'],
    power: '3-6 kW',
    workArea: '1500x3000',
    automation: 'Manuel tabla',
    stockLabel: 'Stokta',
    deliveryLabel: '3-4 hafta',
  },
  {
    id: 11,
    name: 'Yandan Yuklemeli Yari Otomatik Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/11.jpg',
    description: 'Yandan yukleme ile kolay kullanim sunan yari otomatik boru kesim cozumu.',
    features: ['Yandan yukleme kolayligi', 'Yari otomatik calisma', 'Kolay bakim'],
    power: '3-6 kW',
    workArea: 'Boru cap 20-160mm',
    automation: 'Yari otomatik',
    stockLabel: 'Stokta',
    deliveryLabel: '4-6 hafta',
  },
  {
    id: 12,
    name: 'Yari Otomatik Yuklemeli Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/12.jpg',
    description: 'Yari otomatik yukleme sistemi ile pratik ve ekonomik boru kesim cozumu.',
    features: ['Yari otomatik yukleme', 'Kullanim kolayligi', 'Dusuk isletme maliyeti'],
    power: '3-6 kW',
    workArea: 'Boru cap 20-120mm',
    automation: 'Yari otomatik',
    stockLabel: 'Siparisle',
    deliveryLabel: '5-7 hafta',
  },
];

const categories = ['Tumu', 'Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Ozel Kesim'];

const compareItems = [products[0], products[1], products[2]];

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

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tumu');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Tumu' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen space-y-16">
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

      <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
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
                className="block w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                    ? 'bg-orange-500 text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
        {filteredProducts.map((product, index) => (
          <Reveal key={product.id} as="div" delay={120 + index * 60}>
            <div className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="relative h-48 w-full overflow-hidden bg-white">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      product.stockLabel === 'Stokta' ? 'bg-orange-500 text-slate-900' : 'bg-amber-200 text-amber-900'
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
                <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  {product.category}
                </span>
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
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
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

      <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">
              Urun karsilastirma
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Modelleri yan yana gor
            </h2>
          </div>
          <Link
            href="/quote"
            className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            Teknik teklif iste
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4">Model</th>
                <th className="py-3 pr-4">Guc</th>
                <th className="py-3 pr-4">Tabla/Boru</th>
                <th className="py-3 pr-4">Otomasyon</th>
                <th className="py-3">Teslim</th>
              </tr>
            </thead>
            <tbody>
              {compareItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
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
      </Reveal>

      <Reveal as="section" className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-200">
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
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
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

