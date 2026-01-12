import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import AddToCartButton from '@/components/cart/AddToCartButton';
import SparePartImageSlider from '@/components/spare-parts/SparePartImageSlider';
import SparePartReviews from '@/components/spare-parts/SparePartReviews';

type SparePartDetail = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  images: Array<{ id: string; url: string }>;
  stockOnHand: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
};

type SparePartFindUniqueResult = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  images: Array<{ id: string; url: string }>;
  stockOnHand: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
} | null;

type RelatedPart = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  category: { name: string };
};

type SparePartFindManyResult = RelatedPart[];

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findUnique: (args: unknown) => Promise<SparePartFindUniqueResult>;
    findMany: (args: unknown) => Promise<SparePartFindManyResult>;
  };
};

const compatibilityByCategory: Record<string, string[]> = {
  'Sac Kesim': ['GL-3015', 'GL-6020', 'GL-9025'],
  'Boru Kesim': ['GT-6020', 'GT-12030'],
  'Kombine Kesim': ['GL-Comb 1500', 'GL-Comb 3000'],
  'Ozel Kesim': ['GL-9000'],
};

const CRITICAL_STOCK_LEVEL = 5;

const faqItems = [
  {
    q: 'Bu parca hangi modellere uyumludur?',
    a: 'Uyumluluk listesi urun kartinda yer alir. Net teyit icin model bilgisini paylasabilirsiniz.',
  },
  {
    q: 'Teslimat suresi nedir?',
    a: 'Stoklu urunler genellikle 2-3 is gunu, ozel siparisler 7-10 gun icinde sevk edilir.',
  },
  {
    q: 'Montaj destegi sagliyor musunuz?',
    a: 'Teknik ekip uzaktan destek verir. Yerinde servis icin planlama yapilabilir.',
  },
  {
    q: 'Garanti kapsami nedir?',
    a: 'Garanti suresi urun tipine gore degisir. Fatura ve seri numarasi ile destek alabilirsiniz.',
  },
];

const getBaseUrl = () => process.env.NEXTAUTH_URL || 'http://localhost:3000';

const truncate = (value: string, max = 160) =>
  value.length > max ? `${value.slice(0, max - 3)}...` : value;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      images: { select: { url: true } },
      category: { select: { name: true } },
      priceCents: true,
      currency: true,
      stockOnHand: true,
    },
  });

  if (!part) {
    return {
      title: 'Urun bulunamadi',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/spare-parts/${part.id}`;
  const title = `${part.name} | Guohong Lazer`;
  const description = truncate(part.description || `${part.name} yedek parca detaylari.`);
  const images = (part.images?.length ? part.images.map((img) => img.url) : [part.imageUrl]).filter(
    Boolean,
  ) as string[];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: images.length ? images : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length ? images : undefined,
    },
    other: {
      'product:brand': 'Guohong Lazer',
      'product:availability': part.stockOnHand > 0 ? 'in stock' : 'out of stock',
      'product:price:amount': String((part.priceCents / 100).toFixed(2)),
      'product:price:currency': part.currency || 'TRY',
    },
  };
}

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

export default async function SparePartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!part) notFound();

  const p: SparePartDetail = {
    id: part.id,
    name: part.name,
    description: part.description,
    dimensions: part.dimensions,
    priceCents: part.priceCents,
    currency: part.currency,
    imageUrl: part.imageUrl,
    images: part.images,
    stockOnHand: part.stockOnHand,
    isFeatured: part.isFeatured,
    category: {
      id: part.category.id,
      name: part.category.name,
      slug: part.category.slug,
    },
  };

  const related = await prismaSpareParts.sparePart.findMany({
    where: {
      category: { id: part.category.id },
      NOT: { id },
    },
    take: 3,
    select: {
      id: true,
      name: true,
      priceCents: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  const compatibility = compatibilityByCategory[p.category.name] ?? [];
  const inStock = p.stockOnHand > 0;
  const isCritical = inStock && p.stockOnHand <= CRITICAL_STOCK_LEVEL;
  const baseUrl = getBaseUrl();
  const imageUrls = (p.images?.length ? p.images.map((img) => img.url) : [p.imageUrl]).filter(
    Boolean,
  ) as string[];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    category: p.category.name,
    image: imageUrls,
    brand: {
      '@type': 'Organization',
      name: 'Guohong Lazer',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: p.currency || 'TRY',
      price: (p.priceCents / 100).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/spare-parts/${p.id}`,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
              Ana sayfa
            </Link>
            <span className="mx-2">/</span>
            <Link href="/spare-parts" className="hover:text-gray-700 dark:hover:text-gray-200">
              Yedek parcalar
            </Link>
            <span className="mx-2">/</span>
            <span>{p.category.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="#reviews"
              className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:text-gray-200"
            >
              Yorumlara git
            </Link>
            {p.isFeatured && (
              <div className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                Vitrin
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.15fr_0.8fr]">
          <div className="space-y-5">
            <SparePartImageSlider
              images={p.images}
              fallbackUrl={p.imageUrl || '/images/1.jpg'}
              name={p.name}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
              <span className="rounded-full border border-gray-200 bg-white/90 px-3 py-1 dark:border-gray-700 dark:bg-gray-800">
                {p.category.name}
              </span>
              <span className={`rounded-full px-3 py-1 ${inStock ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                {inStock ? 'Stokta' : 'Siparisle'}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {inStock ? '2-3 gun teslim' : '7-10 gun teslim'}
              </span>
              {isCritical && (
                <span className="rounded-full bg-amber-200 px-3 py-1 text-amber-800">Kritik stok</span>
              )}
            </div>
            <div className="grid gap-3 rounded-2xl border border-gray-100 bg-white/90 p-4 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Guvenli odeme</div>
                <div className="mt-1 font-semibold text-gray-900 dark:text-white">SSL korumali</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Garanti</div>
                <div className="mt-1 font-semibold text-gray-900 dark:text-white">Resmi servis</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Iade</div>
                <div className="mt-1 font-semibold text-gray-900 dark:text-white">14 gun</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {p.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>Kategori: {p.category.name}</span>
                <span>Stok: {p.stockOnHand}</span>
                <span>Olcu: {p.dimensions || '-'}</span>
              </div>
              <p className="mt-4 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{p.description}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/90 p-5 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                One cikanlar
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                <li>Model uyumlulugu ve teknik destek dahil.</li>
                <li>Fatura ve garanti belgesi otomatik olusur.</li>
                <li>Stoklu urunlerde hizli sevkiyat.</li>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Teslim</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{inStock ? '2-3 gun' : '7-10 gun'}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Durum</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{inStock ? 'Stokta' : 'Siparisle'}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Olcu</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{p.dimensions || '-'}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Kategori</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{p.category.name}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-4 text-sm text-teal-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Uyumluluk listesi</p>
              {compatibility.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {compatibility.map((model) => (
                    <span key={model} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700">
                      {model}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2">Uyumluluk icin teknik ekiple iletisime gec.</p>
              )}
            </div>

          </div>

          <aside className="h-fit rounded-2xl border border-gray-100 bg-white/95 p-5 shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-24">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatPriceTry(p.priceCents)}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className={`rounded-full px-3 py-1 ${inStock ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                {inStock ? 'Stokta' : 'Siparisle'}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                {inStock ? '2-3 gun teslim' : '7-10 gun teslim'}
              </span>
              {isCritical && (
                <span className="rounded-full bg-amber-200 px-3 py-1 text-amber-800">Kritik stok</span>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-gray-100 bg-white/90 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span>Gonderen</span>
                <span className="font-semibold text-gray-900 dark:text-white">Guohong Lazer</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Garanti</span>
                <span className="font-semibold text-gray-900 dark:text-white">Resmi servis</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Iade</span>
                <span className="font-semibold text-gray-900 dark:text-white">14 gun</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {inStock ? (
                <AddToCartButton
                  id={p.id}
                  name={p.name}
                  priceCents={p.priceCents}
                  imageUrl={p.imageUrl}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700"
                  quantity={1}
                />
              ) : (
                <div className="grid gap-2">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                  >
                    Stokta yok
                  </button>
                  <Link
                    href={`/stock-request?product=${encodeURIComponent(p.name)}&id=${encodeURIComponent(p.id)}`}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300"
                  >
                    Stok gelince haber ver
                  </Link>
                </div>
              )}
              <Link
                href="/cart"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Sepete git
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
              >
                Urun hakkinda sor
              </Link>
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-300">
              <ul className="space-y-2">
                <li>Guvenli odeme altyapisi</li>
                <li>Fatura ve garanti destegi</li>
                <li>Teknik ekipten hizli destek</li>
              </ul>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-12 rounded-[28px] border border-gray-100 bg-white/90 p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-600">Satin alanlar bunlari da aldi</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Tamamlayici parcalar</h2>
              </div>
              <Link
                href="/spare-parts"
                className="rounded-full border border-gray-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                Tum yedek parcalar
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/spare-parts/${item.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white">
                    <Image src={item.imageUrl || '/images/1.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.category.name}</p>
                  </div>
                  <span className="ml-auto text-teal-600 transition group-hover:translate-x-1">-&gt;</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12" id="reviews">
          <SparePartReviews sparePartId={p.id} />
        </div>

        <div className="mt-12 rounded-[28px] border border-gray-100 bg-white/90 p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-600">SSS</p>
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Sik sorulan sorular</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <div key={item.q} className="rounded-2xl border border-gray-100 bg-white/80 p-4">
                <div className="text-sm font-semibold text-gray-900">{item.q}</div>
                <p className="mt-2 text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



