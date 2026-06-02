'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { machineProducts } from '@/lib/machineCatalog';

const tabs = ['Tümü', 'Sac Plaka Kesimi', 'Boru Kesimi', 'Demir Kesimi'] as const;
type ProductTab = (typeof tabs)[number];

const categoryMap: Record<string, ProductTab> = {
  'sac-plaka-kesimi': 'Sac Plaka Kesimi',
  'boru-kesimi': 'Boru Kesimi',
  'demir-kesimi': 'Demir Kesimi',
};

function getInitialTab(initialCategory?: string | null): ProductTab {
  if (!initialCategory) return 'Tümü';
  return categoryMap[initialCategory] ?? 'Tümü';
}

export default function ProductsPageClient({ initialCategory }: { initialCategory?: string | null }) {
  const [activeTab, setActiveTab] = useState<ProductTab>(() => getInitialTab(initialCategory));

  const products = useMemo(() => {
    if (activeTab === 'Tümü') return machineProducts;
    return machineProducts.filter((item) => item.category === activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-10 pb-14">
      <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-950 text-white">
        <div className="grid min-h-[480px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f36b21]">Makine kataloğu</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Fiber lazer kesim makineleri, tek katalogda.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
              Sac, boru ve profil kesim ihtiyaçları için üretim kapasitesine göre seçilebilen Guohong makine portföyü.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-white/12 py-5">
              <div>
                <div className="text-2xl font-semibold text-white">{machineProducts.length}</div>
                <div className="mt-1 text-xs text-white/52">Model</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">60 kW</div>
                <div className="mt-1 text-xs text-white/52">Güç skalası</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">3</div>
                <div className="mt-1 text-xs text-white/52">Ürün grubu</div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quote" className="inline-flex items-center justify-center rounded-lg bg-[#f36b21] px-5 py-3 text-sm font-semibold text-white">
                Teklif iste
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-lg border border-white/16 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8">
                Teknik danışmanlık
              </Link>
            </div>
          </div>
          <div className="relative min-h-[320px]">
            <Image src="/images/7.jpg" alt="Guohong fiber lazer kesim makinesi" fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent lg:bg-gradient-to-l" />
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f36b21]">Portföy</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Tüm makineler</h2>
          </div>
          <div className="text-sm text-slate-500">{products.length} model listeleniyor</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'border-[#0f2a52] bg-[#0f2a52] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-[16px] border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute left-4 top-4 rounded-md bg-white/92 px-3 py-1 text-xs font-semibold text-[#0f2a52] shadow-sm">
                    {product.category}
                  </div>
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold leading-snug text-slate-950">{product.name}</h3>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {product.stockLabel}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-200 py-4 text-xs">
                  <div>
                    <div className="text-slate-400">Güç</div>
                    <div className="mt-1 font-semibold text-slate-950">{product.power}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Alan</div>
                    <div className="mt-1 font-semibold text-slate-950">{product.workArea}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Teslim</div>
                    <div className="mt-1 font-semibold text-slate-950">{product.deliveryLabel}</div>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Link href={`/products/${product.id}`} className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#0f2a52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#071526]">
                    İncele
                  </Link>
                  <Link href={`/quote?product=${encodeURIComponent(product.name)}`} className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#0f2a52] hover:bg-slate-50">
                    Teklif
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
