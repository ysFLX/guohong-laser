'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Reveal from '@/components/home/Reveal';
import { machineProducts } from '@/lib/machineCatalog';

const tabs = ['Sac Plaka Kesimi', 'Boru Kesimi', 'Demir Kesimi'] as const;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Sac Plaka Kesimi');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category === 'sac-plaka-kesimi') setActiveTab('Sac Plaka Kesimi');
    if (category === 'boru-kesimi') setActiveTab('Boru Kesimi');
    if (category === 'demir-kesimi') setActiveTab('Demir Kesimi');
  }, [searchParams]);

  const products = useMemo(() => {
    return machineProducts.filter((item) => item.category === activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-14 pb-16 text-white">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#15148c] shadow-[0_40px_120px_-60px_rgba(5,0,92,0.95)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.25),_transparent_30%),linear-gradient(120deg,_rgba(5,0,92,0.2),_rgba(5,0,92,0.92))]" />
        <div className="relative grid gap-8 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#ff6a0d]">Ürünler</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Sac, boru ve demir kesim makine portföyü
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/76">
              Tüm katalog tek mantıkta toplandı: sac plaka kesimi, boru kesimi ve demir kesimi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-[#ff6a0d] px-7 py-3 text-sm font-semibold text-[#15148c]">
                Daha Fazlasını Gör
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white">
                Teknik Destek
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: '12+', text: 'Hazır katalog modeli' },
              { label: '60 kW', text: 'Maksimum güç skalası' },
              { label: '4', text: 'Ana ürün grubu' },
              { label: '100+', text: 'Ülke ve bölgeye teslimat' },
            ].map((item) => (
              <div key={item.text} className="rounded-[26px] border border-white/10 bg-white/6 p-5 backdrop-blur">
                <div className="text-3xl font-semibold text-[#ff6a0d]">{item.label}</div>
                <div className="mt-2 text-sm text-white/72">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Kategori seçimi</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Sektörümüzde birçok ürün çeşidi vardır</h2>
          </div>
          <div className="text-sm text-white/55">{products.length} model listeleniyor</div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-[#ff6a0d] text-[#15148c]'
                  : 'border border-white/15 bg-white/6 text-white/82 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <article key={product.id} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/6 transition hover:-translate-y-1 hover:border-[#ff6a0d]/55">
              <div className="relative h-64 overflow-hidden">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute left-5 top-5 rounded-full bg-[#ff6a0d] px-3 py-1 text-xs font-semibold text-[#15148c]">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[#15148c]">{product.stockLabel}</span>
                  <span className="rounded-full bg-[#15148c]/80 px-3 py-1 text-white">{product.deliveryLabel}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{product.category}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{product.name}</h3>
                <p className="mt-3 text-sm leading-7 text-white/72">{product.description}</p>
                <div className="mt-4 grid gap-2 text-sm text-white/72">
                  <div className="flex items-center justify-between">
                    <span>Güç</span>
                    <span className="font-semibold text-white">{product.power}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Çalışma alanı</span>
                    <span className="font-semibold text-white">{product.workArea}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Otomasyon</span>
                    <span className="font-semibold text-white">{product.automation}</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/products/${product.id}`} className="inline-flex items-center justify-center rounded-full bg-[#ff6a0d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#15148c]">
                    Ayrıntıyı Görüntüle
                  </Link>
                  <Link href={`/quote?product=${encodeURIComponent(product.name)}`} className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Teklif Al
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

