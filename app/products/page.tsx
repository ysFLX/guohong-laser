﻿﻿'use client';

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
    name: 'Açık Çift Tablalı Sac Kesim Makinası',
    category: 'Sac Kesim',
    image: '/images/1.jpg',
    description: 'Kesintisiz üretim için tasarlanmış, yüksek verimli çift tablalı sac kesim çözümü. Otomatik tabla değişimi ile verimliliği maksimuma çıkarır.',
    features: [
      'Çift tablalı sürekli üretim',
      'Yüksek hassasiyetli kesim',
      'Düşük enerji tüketimi',
      'Otomatik odaklama',
      'Kullanıcı dostu arayüz'
    ]
  },
  {
    id: 2,
    name: 'Ağır Tip Boru Kesim Makinası',
    category: 'Boru Kesim',
    image: '/images/2.jpg',
    description: 'Ağır sanayi uygulamaları için özel olarak geliştirilmiş, yüksek dayanımlı boru kesim çözümü.',
    features: [
      'Ağır hizmet tipi yapı',
      'Geniş boru çap aralığı',
      'Yüksek hassasiyet',
      'Uzun ömürlü lazer kaynağı',
      'Düşük bakım maliyeti'
    ]
  },
  {
    id: 3,
    name: 'Boru Sac İkisi Bir Arada Lazer Kesim Makinası',
    category: 'Kombine Kesim',
    image: '/images/3.jpg',
    description: 'Hem sac hem de boru kesim ihtiyaçlarınız için tek çözüm. İki farklı işlemi tek makinede birleştiren pratik tasarım.',
    features: [
      'Çift amaçlı kullanım',
      'Hızlı işlem değişimi',
      'Yüksek verimlilik',
      'Tasarruflu enerji kullanımı',
      'Geniş çalışma alanı'
    ]
  },
  {
    id: 4,
    name: 'Çift Tabla Sac Kesim Makinası',
    category: 'Sac Kesim',
    image: '/images/4.jpg',
    description: 'Kesintisiz üretim için optimize edilmiş, yüksek kapasiteli çift tablalı lazer kesim sistemi.',
    features: [
      'Kesintisiz üretim',
      'Otomatik tabla değişimi',
      'Yüksek hassasiyet',
      'Düşük işletme maliyeti',
      'Kolay bakım'
    ]
  },
  {
    id: 5,
    name: 'Değiştirilebilir Ayna Boru Kesim Makinası',
    category: 'Boru Kesim',
    image: '/images/5.jpg',
    description: 'Farklı boru çapları için hızlı ayna değişimi yapabilme özelliğine sahip, esnek üretim çözümü.',
    features: [
      'Hızlı ayna değişimi',
      'Geniş boru çap aralığı',
      'Yüksek hassasiyet',
      'Kullanıcı dostu arayüz',
      'Düşük bakım gereksinimi'
    ]
  },
  {
    id: 6,
    name: 'Demir Kesim Makinası',
    category: 'Özel Kesim',
    image: '/images/6.jpg',
    description: 'Sert metaller ve demir kesimi için özel olarak tasarlanmış, yüksek güçlü lazer kesim çözümü.',
    features: [
      'Yüksek güçlü lazer kaynağı',
      'Sert metallerde etkili kesim',
      'Uzun ömürlü optik sistem',
      'Düşük enerji tüketimi',
      'Güvenli çalışma'
    ]
  },
  {
    id: 7,
    name: 'Geniş Tabla Yüksek KW Sac Kesim Makinası',
    category: 'Sac Kesim',
    image: '/images/7.jpg',
    description: 'Büyük ebatlı sac levhalar için yüksek güçlü, endüstriyel lazer kesim çözümü.',
    features: [
      'Geniş çalışma alanı',
      'Yüksek güçlü lazer kaynağı',
      'Endüstriyel dayanıklılık',
      'Yüksek kesim hızı',
      'Otomatik malzeme tanıma'
    ]
  },
  {
    id: 8,
    name: 'Küçük Çaplı Tam Otomatik Yükleme ve İndirme Boru Kesim Makinası',
    category: 'Boru Kesim',
    image: '/images/8.jpg',
    description: 'Küçük çaplı borular için tam otomatik yükleme ve boşaltma sistemine sahip, yüksek verimli kesim çözümü.',
    features: [
      'Tam otomatik sistem',
      'Yüksek üretim hızı',
      'Düşük işçilik maliyeti',
      'Hassas kesim',
      'Kullanıcı dostu arayüz'
    ]
  },
  {
    id: 9,
    name: 'Raylı Sac Kesim Makinası',
    category: 'Sac Kesim',
    image: '/images/9.jpg',
    description: 'Uzun sac levhalar için özel raylı sistem tasarımına sahip, yüksek hassasiyetli kesim çözümü.',
    features: [
      'Raylı taşıma sistemi',
      'Uzun saclarda yüksek hassasiyet',
      'Düşük enerji tüketimi',
      'Kolay kullanım',
      'Düşük bakım maliyeti'
    ]
  },
  {
    id: 10,
    name: 'Tek Tabla Sac Kesim Makinası',
    category: 'Sac Kesim',
    image: '/images/10.jpg',
    description: 'Küçük ve orta ölçekli işletmeler için ekonomik, yüksek verimli tek tablalı lazer kesim çözümü.',
    features: [
      'Ekonomik çözüm',
      'Yüksek verimlilik',
      'Kompakt tasarım',
      'Kolay kullanım',
      'Düşük işletme maliyeti'
    ]
  },
  {
    id: 11,
    name: 'Yandan Yüklemeli Yarı Otomatik Boru Kesim Makinası',
    category: 'Boru Kesim',
    image: '/images/11.jpg',
    description: 'Yandan yükleme özelliği ile kolay kullanım sunan, yarı otomatik boru kesim çözümü.',
    features: [
      'Yandan yükleme kolaylığı',
      'Yarı otomatik çalışma',
      'Yüksek hassasiyet',
      'Düşük enerji tüketimi',
      'Kolay bakım'
    ]
  },
  {
    id: 12,
    name: 'Yarı Otomatik Yüklemeli Boru Kesim Makinası',
    category: 'Boru Kesim',
    image: '/images/12.jpg',
    description: 'Yarı otomatik yükleme sistemi ile verimli boru kesim çözümü. İşletmeler için pratik ve ekonomik çözüm.',
    features: [
      'Yarı otomatik yükleme',
      'Yüksek verimlilik',
      'Hassas kesim',
      'Kullanım kolaylığı',
      'Düşük işletme maliyeti'
    ]
  }
];

const categories = ['Tümü', 'Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Özel Kesim'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Tümü' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Lazer Makineleri
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-emerald-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              En son teknoloji lazer makineleri ile üretim süreçlerinizi optimize edin.
            </p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
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
                  placeholder="Ürün ara..."
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
              <div className="relative h-64 w-full">
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
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{product.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Özellikler:</h4>
                  <ul className="mt-2 space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
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
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Ürün bulunamadı</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun ürün bulunamadı.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="block">Fiyat teklifi mi almak istiyorsunuz?</span>
            <span className="block text-emerald-600 dark:text-emerald-400">Uzman ekibimiz size yardımcı olmaktan mutluluk duyar.</span>
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



