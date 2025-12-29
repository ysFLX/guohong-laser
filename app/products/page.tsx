'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

type Product = {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  features: string[];
};

const products: Product[] = [
  {
    id: 1,
    name: 'Acik Cift Tablali Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/1.jpg',
    description: 'Kesintisiz uretim icin tasarlanmis, yuksek verimli cift tablali sac kesim cozumu. Otomatik tabla degisimiyle verimlilik artar.',
    features: [
      'Cift tablali surekli uretim',
      'Yuksek hassasiyet',
      'Dusuk enerji tuketimi',
      'Otomatik odaklama',
      'Kullanici dostu arayuz'
    ]
  },
  {
    id: 2,
    name: 'Agir Tip Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/2.jpg',
    description: 'Agir sanayi uygulamalari icin gelistirilmis, yuksek dayanimli boru kesim cozumu.',
    features: [
      'Agir hizmet tipi yapi',
      'Genis boru cap araligi',
      'Yuksek hassasiyet',
      'Uzun omurlu lazer kaynagi',
      'Dusuk bakim maliyeti'
    ]
  },
  {
    id: 3,
    name: 'Boru ve Sac Ikisi Bir Arada Lazer Kesim Makinesi',
    category: 'Kombine Kesim',
    image: '/images/3.jpg',
    description: 'Hem sac hem de boru kesimi icin tek cozum. Iki islemi tek makinede birlestirir.',
    features: [
      'Cift amacli kullanim',
      'Hizli islem degisimi',
      'Yuksek verimlilik',
      'Tasarruflu enerji kullanimi',
      'Genis calisma alani'
    ]
  },
  {
    id: 4,
    name: 'Cift Tabla Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/4.jpg',
    description: 'Kesintisiz uretim icin optimize edilmis, yuksek kapasiteli lazer kesim sistemi.',
    features: [
      'Kesintisiz uretim',
      'Otomatik tabla degisimi',
      'Yuksek hassasiyet',
      'Dusuk isletme maliyeti',
      'Kolay bakim'
    ]
  },
  {
    id: 5,
    name: 'Degistirilebilir Ayna Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/5.jpg',
    description: 'Farkli boru caplari icin hizli ayna degisimi yapabilen esnek uretim cozumu.',
    features: [
      'Hizli ayna degisimi',
      'Genis boru cap araligi',
      'Yuksek hassasiyet',
      'Kullanici dostu arayuz',
      'Dusuk bakim gereksinimi'
    ]
  },
  {
    id: 6,
    name: 'Demir Kesim Makinesi',
    category: 'Ozel Kesim',
    image: '/images/6.jpg',
    description: 'Sert metaller ve demir kesimi icin tasarlanmis yuksek guclu lazer cozumu.',
    features: [
      'Yuksek guclu lazer kaynagi',
      'Sert metalde etkili kesim',
      'Uzun omurlu optik sistem',
      'Dusuk enerji tuketimi',
      'Guvenli calisma'
    ]
  },
  {
    id: 7,
    name: 'Genis Tabla Yuksek KW Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/7.jpg',
    description: 'Buyuk ebatli saclar icin yuksek guclu, endustriyel lazer kesim cozumu.',
    features: [
      'Genis calisma alani',
      'Yuksek guclu lazer kaynagi',
      'Endustriyel dayaniklilik',
      'Yuksek kesim hizi',
      'Otomatik malzeme tanima'
    ]
  },
  {
    id: 8,
    name: 'Kucuk Capli Tam Otomatik Yukleme ve Indirme Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/8.jpg',
    description: 'Kucuk capli borular icin tam otomatik yukleme/bosaltma sistemli cozum.',
    features: [
      'Tam otomatik sistem',
      'Yuksek uretim hizi',
      'Dusuk iscilik maliyeti',
      'Hassas kesim',
      'Kullanici dostu arayuz'
    ]
  },
  {
    id: 9,
    name: 'Rayli Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/9.jpg',
    description: 'Uzun sac levhalar icin rayli sistem tasarimiyla yuksek hassasiyet.',
    features: [
      'Rayli tasima sistemi',
      'Uzun saclarda yuksek hassasiyet',
      'Dusuk enerji tuketimi',
      'Kolay kullanim',
      'Dusuk bakim maliyeti'
    ]
  },
  {
    id: 10,
    name: 'Tek Tabla Sac Kesim Makinesi',
    category: 'Sac Kesim',
    image: '/images/10.jpg',
    description: 'Kucuk ve orta olcekli isletmeler icin ekonomik, verimli tek tablali cozum.',
    features: [
      'Ekonomik cozum',
      'Yuksek verimlilik',
      'Kompakt tasarim',
      'Kolay kullanim',
      'Dusuk isletme maliyeti'
    ]
  },
  {
    id: 11,
    name: 'Yandan Yuklemeli Yari Otomatik Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/11.jpg',
    description: 'Yandan yukleme ile kolay kullanim sunan yari otomatik boru kesim cozumu.',
    features: [
      'Yandan yukleme kolayligi',
      'Yari otomatik calisma',
      'Yuksek hassasiyet',
      'Dusuk enerji tuketimi',
      'Kolay bakim'
    ]
  },
  {
    id: 12,
    name: 'Yari Otomatik Yuklemeli Boru Kesim Makinesi',
    category: 'Boru Kesim',
    image: '/images/12.jpg',
    description: 'Yari otomatik yukleme sistemi ile pratik ve ekonomik boru kesim cozumu.',
    features: [
      'Yari otomatik yukleme',
      'Yuksek verimlilik',
      'Hassas kesim',
      'Kullanim kolayligi',
      'Dusuk isletme maliyeti'
    ]
  }
];

const categories = ['Tumu', 'Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Ozel Kesim'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tumu');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Tumu' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="max-w-none mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Lazer Makineleri
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-emerald-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              En son teknoloji lazer makineleri ile uretim sureclerinizi optimize edin.
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-none mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">Ara</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/70 dark:border-gray-700/70 overflow-hidden"
            >
              <div className="relative h-44 w-full overflow-hidden bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
                    {product.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{product.description}</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {product.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Urun bulunamadi</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun urun bulunamadi.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-none mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="block">Fiyat teklifi mi almak istiyorsunuz?</span>
            <span className="block text-emerald-600 dark:text-emerald-400">
              Uzman ekibimiz size yardimci olmaktan mutluluk duyar.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="/quote"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Fiyat Teklifi Al
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








