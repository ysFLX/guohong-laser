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
    name: 'A��k �ift Tablal� Sac Kesim Makinas�',
    category: 'Sac Kesim',
    image: '/images/1.jpg',
    description: 'Kesintisiz �retim i�in tasarlanm��, y�ksek verimli �ift tablal� sac kesim ��z�m�. Otomatik tabla de�i�imi ile verimlili�i maksimuma ��kar�r.',
    features: [
      '�ift tablal� s�rekli �retim',
      'Y�ksek hassasiyetli kesim',
      'D���k enerji t�ketimi',
      'Otomatik odaklama',
      'Kullan�c� dostu aray�z'
    ]
  },
  {
    id: 2,
    name: 'A��r Tip Boru Kesim Makinas�',
    category: 'Boru Kesim',
    image: '/images/2.jpg',
    description: 'A��r sanayi uygulamalar� i�in �zel olarak geli�tirilmi�, y�ksek dayan�ml� boru kesim ��z�m�.',
    features: [
      'A��r hizmet tipi yap�',
      'Geni� boru �ap aral���',
      'Y�ksek hassasiyet',
      'Uzun �m�rl� lazer kayna��',
      'D���k bak�m maliyeti'
    ]
  },
  {
    id: 3,
    name: 'Boru Sac �kisi Bir Arada Lazer Kesim Makinas�',
    category: 'Kombine Kesim',
    image: '/images/3.jpg',
    description: 'Hem sac hem de boru kesim ihtiya�lar�n�z i�in tek ��z�m. �ki farkl� i�lemi tek makinede birle�tiren pratik tasar�m.',
    features: [
      '�ift ama�l� kullan�m',
      'H�zl� i�lem de�i�imi',
      'Y�ksek verimlilik',
      'Tasarruflu enerji kullan�m�',
      'Geni� �al��ma alan�'
    ]
  },
  {
    id: 4,
    name: '�ift Tabla Sac Kesim Makinas�',
    category: 'Sac Kesim',
    image: '/images/4.jpg',
    description: 'Kesintisiz �retim i�in optimize edilmi�, y�ksek kapasiteli �ift tablal� lazer kesim sistemi.',
    features: [
      'Kesintisiz �retim',
      'Otomatik tabla de�i�imi',
      'Y�ksek hassasiyet',
      'D���k i�letme maliyeti',
      'Kolay bak�m'
    ]
  },
  {
    id: 5,
    name: 'De�i�tirilebilir Ayna Boru Kesim Makinas�',
    category: 'Boru Kesim',
    image: '/images/5.jpg',
    description: 'Farkl� boru �aplar� i�in h�zl� ayna de�i�imi yapabilme �zelli�ine sahip, esnek �retim ��z�m�.',
    features: [
      'H�zl� ayna de�i�imi',
      'Geni� boru �ap aral���',
      'Y�ksek hassasiyet',
      'Kullan�c� dostu aray�z',
      'D���k bak�m gereksinimi'
    ]
  },
  {
    id: 6,
    name: 'Demir Kesim Makinas�',
    category: '�zel Kesim',
    image: '/images/6.jpg',
    description: 'Sert metaller ve demir kesimi i�in �zel olarak tasarlanm��, y�ksek g��l� lazer kesim ��z�m�.',
    features: [
      'Y�ksek g��l� lazer kayna��',
      'Sert metallerde etkili kesim',
      'Uzun �m�rl� optik sistem',
      'D���k enerji t�ketimi',
      'G�venli �al��ma'
    ]
  },
  {
    id: 7,
    name: 'Geni� Tabla Y�ksek KW Sac Kesim Makinas�',
    category: 'Sac Kesim',
    image: '/images/7.jpg',
    description: 'B�y�k ebatl� sac levhalar i�in y�ksek g��l�, end�striyel lazer kesim ��z�m�.',
    features: [
      'Geni� �al��ma alan�',
      'Y�ksek g��l� lazer kayna��',
      'End�striyel dayan�kl�l�k',
      'Y�ksek kesim h�z�',
      'Otomatik malzeme tan�ma'
    ]
  },
  {
    id: 8,
    name: 'K���k �apl� Tam Otomatik Y�kleme ve �ndirme Boru Kesim Makinas�',
    category: 'Boru Kesim',
    image: '/images/8.jpg',
    description: 'K���k �apl� borular i�in tam otomatik y�kleme ve bo�altma sistemine sahip, y�ksek verimli kesim ��z�m�.',
    features: [
      'Tam otomatik sistem',
      'Y�ksek �retim h�z�',
      'D���k i��ilik maliyeti',
      'Hassas kesim',
      'Kullan�c� dostu aray�z'
    ]
  },
  {
    id: 9,
    name: 'Rayl� Sac Kesim Makinas�',
    category: 'Sac Kesim',
    image: '/images/9.jpg',
    description: 'Uzun sac levhalar i�in �zel rayl� sistem tasar�m�na sahip, y�ksek hassasiyetli kesim ��z�m�.',
    features: [
      'Rayl� ta��ma sistemi',
      'Uzun saclarda y�ksek hassasiyet',
      'D���k enerji t�ketimi',
      'Kolay kullan�m',
      'D���k bak�m maliyeti'
    ]
  },
  {
    id: 10,
    name: 'Tek Tabla Sac Kesim Makinas�',
    category: 'Sac Kesim',
    image: '/images/10.jpg',
    description: 'K���k ve orta �l�ekli i�letmeler i�in ekonomik, y�ksek verimli tek tablal� lazer kesim ��z�m�.',
    features: [
      'Ekonomik ��z�m',
      'Y�ksek verimlilik',
      'Kompakt tasar�m',
      'Kolay kullan�m',
      'D���k i�letme maliyeti'
    ]
  },
  {
    id: 11,
    name: 'Yandan Y�klemeli Yar� Otomatik Boru Kesim Makinas�',
    category: 'Boru Kesim',
    image: '/images/11.jpg',
    description: 'Yandan y�kleme �zelli�i ile kolay kullan�m sunan, yar� otomatik boru kesim ��z�m�.',
    features: [
      'Yandan y�kleme kolayl���',
      'Yar� otomatik �al��ma',
      'Y�ksek hassasiyet',
      'D���k enerji t�ketimi',
      'Kolay bak�m'
    ]
  },
  {
    id: 12,
    name: 'Yar� Otomatik Y�klemeli Boru Kesim Makinas�',
    category: 'Boru Kesim',
    image: '/images/12.jpg',
    description: 'Yar� otomatik y�kleme sistemi ile verimli boru kesim ��z�m�. ��letmeler i�in pratik ve ekonomik ��z�m.',
    features: [
      'Yar� otomatik y�kleme',
      'Y�ksek verimlilik',
      'Hassas kesim',
      'Kullan�m kolayl���',
      'D���k i�letme maliyeti'
    ]
  }
];

const categories = ['T�m�', 'Sac Kesim', 'Boru Kesim', 'Kombine Kesim', '�zel Kesim'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('T�m�');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'T�m�' || product.category === selectedCategory;
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
              En son teknoloji lazer makineleri ile �retim s�re�lerinizi optimize edin.
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
                  placeholder="�r�n ara..."
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 w-full sm:h-52">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {product.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{product.description}</p>
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-900 dark:text-white">Ozellikler</h4>
                  <ul className="mt-2 space-y-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                 
                </div>
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
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">�r�n bulunamad�</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun �r�n bulunamad�.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-none mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="block">Fiyat teklifi mi almak istiyorsunuz?</span>
            <span className="block text-emerald-600 dark:text-emerald-400">Uzman ekibimiz size yard�mc� olmaktan mutluluk duyar.</span>
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








