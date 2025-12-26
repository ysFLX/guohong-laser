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
    name: 'AÃ§Ä±k Ã‡ift TablalÄ± Sac Kesim MakinasÄ±',
    category: 'Sac Kesim',
    image: '/images/1.jpg',
    description: 'Kesintisiz Ã¼retim iÃ§in tasarlanmÄ±ÅŸ, yÃ¼ksek verimli Ã§ift tablalÄ± sac kesim Ã§Ã¶zÃ¼mÃ¼. Otomatik tabla deÄŸiÅŸimi ile verimliliÄŸi maksimuma Ã§Ä±karÄ±r.',
    features: [
      'Ã‡ift tablalÄ± sÃ¼rekli Ã¼retim',
      'YÃ¼ksek hassasiyetli kesim',
      'DÃ¼ÅŸÃ¼k enerji tÃ¼ketimi',
      'Otomatik odaklama',
      'KullanÄ±cÄ± dostu arayÃ¼z'
    ]
  },
  {
    id: 2,
    name: 'AÄŸÄ±r Tip Boru Kesim MakinasÄ±',
    category: 'Boru Kesim',
    image: '/images/2.jpg',
    description: 'AÄŸÄ±r sanayi uygulamalarÄ± iÃ§in Ã¶zel olarak geliÅŸtirilmiÅŸ, yÃ¼ksek dayanÄ±mlÄ± boru kesim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'AÄŸÄ±r hizmet tipi yapÄ±',
      'GeniÅŸ boru Ã§ap aralÄ±ÄŸÄ±',
      'YÃ¼ksek hassasiyet',
      'Uzun Ã¶mÃ¼rlÃ¼ lazer kaynaÄŸÄ±',
      'DÃ¼ÅŸÃ¼k bakÄ±m maliyeti'
    ]
  },
  {
    id: 3,
    name: 'Boru Sac Ä°kisi Bir Arada Lazer Kesim MakinasÄ±',
    category: 'Kombine Kesim',
    image: '/images/3.jpg',
    description: 'Hem sac hem de boru kesim ihtiyaÃ§larÄ±nÄ±z iÃ§in tek Ã§Ã¶zÃ¼m. Ä°ki farklÄ± iÅŸlemi tek makinede birleÅŸtiren pratik tasarÄ±m.',
    features: [
      'Ã‡ift amaÃ§lÄ± kullanÄ±m',
      'HÄ±zlÄ± iÅŸlem deÄŸiÅŸimi',
      'YÃ¼ksek verimlilik',
      'Tasarruflu enerji kullanÄ±mÄ±',
      'GeniÅŸ Ã§alÄ±ÅŸma alanÄ±'
    ]
  },
  {
    id: 4,
    name: 'Ã‡ift Tabla Sac Kesim MakinasÄ±',
    category: 'Sac Kesim',
    image: '/images/4.jpg',
    description: 'Kesintisiz Ã¼retim iÃ§in optimize edilmiÅŸ, yÃ¼ksek kapasiteli Ã§ift tablalÄ± lazer kesim sistemi.',
    features: [
      'Kesintisiz Ã¼retim',
      'Otomatik tabla deÄŸiÅŸimi',
      'YÃ¼ksek hassasiyet',
      'DÃ¼ÅŸÃ¼k iÅŸletme maliyeti',
      'Kolay bakÄ±m'
    ]
  },
  {
    id: 5,
    name: 'DeÄŸiÅŸtirilebilir Ayna Boru Kesim MakinasÄ±',
    category: 'Boru Kesim',
    image: '/images/5.jpg',
    description: 'FarklÄ± boru Ã§aplarÄ± iÃ§in hÄ±zlÄ± ayna deÄŸiÅŸimi yapabilme Ã¶zelliÄŸine sahip, esnek Ã¼retim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'HÄ±zlÄ± ayna deÄŸiÅŸimi',
      'GeniÅŸ boru Ã§ap aralÄ±ÄŸÄ±',
      'YÃ¼ksek hassasiyet',
      'KullanÄ±cÄ± dostu arayÃ¼z',
      'DÃ¼ÅŸÃ¼k bakÄ±m gereksinimi'
    ]
  },
  {
    id: 6,
    name: 'Demir Kesim MakinasÄ±',
    category: 'Ã–zel Kesim',
    image: '/images/6.jpg',
    description: 'Sert metaller ve demir kesimi iÃ§in Ã¶zel olarak tasarlanmÄ±ÅŸ, yÃ¼ksek gÃ¼Ã§lÃ¼ lazer kesim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'YÃ¼ksek gÃ¼Ã§lÃ¼ lazer kaynaÄŸÄ±',
      'Sert metallerde etkili kesim',
      'Uzun Ã¶mÃ¼rlÃ¼ optik sistem',
      'DÃ¼ÅŸÃ¼k enerji tÃ¼ketimi',
      'GÃ¼venli Ã§alÄ±ÅŸma'
    ]
  },
  {
    id: 7,
    name: 'GeniÅŸ Tabla YÃ¼ksek KW Sac Kesim MakinasÄ±',
    category: 'Sac Kesim',
    image: '/images/7.jpg',
    description: 'BÃ¼yÃ¼k ebatlÄ± sac levhalar iÃ§in yÃ¼ksek gÃ¼Ã§lÃ¼, endÃ¼striyel lazer kesim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'GeniÅŸ Ã§alÄ±ÅŸma alanÄ±',
      'YÃ¼ksek gÃ¼Ã§lÃ¼ lazer kaynaÄŸÄ±',
      'EndÃ¼striyel dayanÄ±klÄ±lÄ±k',
      'YÃ¼ksek kesim hÄ±zÄ±',
      'Otomatik malzeme tanÄ±ma'
    ]
  },
  {
    id: 8,
    name: 'KÃ¼Ã§Ã¼k Ã‡aplÄ± Tam Otomatik YÃ¼kleme ve Ä°ndirme Boru Kesim MakinasÄ±',
    category: 'Boru Kesim',
    image: '/images/8.jpg',
    description: 'KÃ¼Ã§Ã¼k Ã§aplÄ± borular iÃ§in tam otomatik yÃ¼kleme ve boÅŸaltma sistemine sahip, yÃ¼ksek verimli kesim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'Tam otomatik sistem',
      'YÃ¼ksek Ã¼retim hÄ±zÄ±',
      'DÃ¼ÅŸÃ¼k iÅŸÃ§ilik maliyeti',
      'Hassas kesim',
      'KullanÄ±cÄ± dostu arayÃ¼z'
    ]
  },
  {
    id: 9,
    name: 'RaylÄ± Sac Kesim MakinasÄ±',
    category: 'Sac Kesim',
    image: '/images/9.jpg',
    description: 'Uzun sac levhalar iÃ§in Ã¶zel raylÄ± sistem tasarÄ±mÄ±na sahip, yÃ¼ksek hassasiyetli kesim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'RaylÄ± taÅŸÄ±ma sistemi',
      'Uzun saclarda yÃ¼ksek hassasiyet',
      'DÃ¼ÅŸÃ¼k enerji tÃ¼ketimi',
      'Kolay kullanÄ±m',
      'DÃ¼ÅŸÃ¼k bakÄ±m maliyeti'
    ]
  },
  {
    id: 10,
    name: 'Tek Tabla Sac Kesim MakinasÄ±',
    category: 'Sac Kesim',
    image: '/images/10.jpg',
    description: 'KÃ¼Ã§Ã¼k ve orta Ã¶lÃ§ekli iÅŸletmeler iÃ§in ekonomik, yÃ¼ksek verimli tek tablalÄ± lazer kesim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'Ekonomik Ã§Ã¶zÃ¼m',
      'YÃ¼ksek verimlilik',
      'Kompakt tasarÄ±m',
      'Kolay kullanÄ±m',
      'DÃ¼ÅŸÃ¼k iÅŸletme maliyeti'
    ]
  },
  {
    id: 11,
    name: 'Yandan YÃ¼klemeli YarÄ± Otomatik Boru Kesim MakinasÄ±',
    category: 'Boru Kesim',
    image: '/images/11.jpg',
    description: 'Yandan yÃ¼kleme Ã¶zelliÄŸi ile kolay kullanÄ±m sunan, yarÄ± otomatik boru kesim Ã§Ã¶zÃ¼mÃ¼.',
    features: [
      'Yandan yÃ¼kleme kolaylÄ±ÄŸÄ±',
      'YarÄ± otomatik Ã§alÄ±ÅŸma',
      'YÃ¼ksek hassasiyet',
      'DÃ¼ÅŸÃ¼k enerji tÃ¼ketimi',
      'Kolay bakÄ±m'
    ]
  },
  {
    id: 12,
    name: 'YarÄ± Otomatik YÃ¼klemeli Boru Kesim MakinasÄ±',
    category: 'Boru Kesim',
    image: '/images/12.jpg',
    description: 'YarÄ± otomatik yÃ¼kleme sistemi ile verimli boru kesim Ã§Ã¶zÃ¼mÃ¼. Ä°ÅŸletmeler iÃ§in pratik ve ekonomik Ã§Ã¶zÃ¼m.',
    features: [
      'YarÄ± otomatik yÃ¼kleme',
      'YÃ¼ksek verimlilik',
      'Hassas kesim',
      'KullanÄ±m kolaylÄ±ÄŸÄ±',
      'DÃ¼ÅŸÃ¼k iÅŸletme maliyeti'
    ]
  }
];

const categories = ['TÃ¼mÃ¼', 'Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Ã–zel Kesim'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('TÃ¼mÃ¼');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'TÃ¼mÃ¼' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Lazer Makineleri
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-teal-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              En son teknoloji lazer makineleri ile Ã¼retim sÃ¼reÃ§lerinizi optimize edin.
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="ÃœrÃ¼n ara..."
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
                      ? 'bg-teal-600 text-white'
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
                <div className="absolute top-4 right-4 bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {product.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{product.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Ã–zellikler:</h4>
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
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">ÃœrÃ¼n bulunamadÄ±</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun Ã¼rÃ¼n bulunamadÄ±.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="block">Fiyat teklifi mi almak istiyorsunuz?</span>
            <span className="block text-teal-600 dark:text-teal-400">Uzman ekibimiz size yardÄ±mcÄ± olmaktan mutluluk duyar.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="/quote"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
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

