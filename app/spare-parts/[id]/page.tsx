import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getBoughtTogetherSpareParts,
  getRelatedSpareParts,
  getSparePartById,
  getSparePartReviewSummary,
} from '@/lib/sparePartsData';

import ViewItemEvent from '@/components/analytics/ViewItemEvent';
import SparePartDetailExperience from '@/components/spare-parts/SparePartDetailExperience';
import SparePartReviews from '@/components/spare-parts/SparePartReviews';
import { isSparePartDirectPurchaseEnabled, isSparePartPriceVisible } from '@/lib/sparePartSales';
import { buildSparePartSizeOptionEntries } from '@/lib/sparePartSizeOptions';

type SparePartDetail = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  hasSizeOptions: boolean;
  sizeOptions: string[];
  sizeOptionPrices: unknown;
  sizeOptionImages: unknown;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  images: Array<{ id: string; url: string }>;
  stockOnHand: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
};

const compatibilityByCategory: Record<string, string[]> = {
  'Sac Kesim': ['GL-3015', 'GL-6020', 'GL-9025'],
  'Boru Kesim': ['GT-6020', 'GT-12030'],
  'Kombine Kesim': ['GL-Comb 1500', 'GL-Comb 3000'],
  'Özel Kesim': ['GL-9000'],
};

const modelIdByLabel: Record<string, string> = {
  'GL-Comb 1500': 'GL-COMB-1500',
  'GL-Comb 3000': 'GL-COMB-3000',
};

const getModelId = (label: string) => modelIdByLabel[label] ?? label;

const CRITICAL_STOCK_LEVEL = 5;

const faqItems = [
  {
    q: 'Bu parça hangi modellere uyumludur?',
    a: 'Uyumluluk listesi ürün kartında yer alır. Net teyit için model bilgisini paylaşabilirsiniz.',
  },
  {
    q: 'Teslimat süresi nedir?',
    a: 'Stoklu ürünler genellikle 2-3 iş günü, özel siparişler 7-10 gün içinde sevk edilir.',
  },
  {
    q: 'Montaj desteği sağlıyor musunuz?',
    a: 'Teknik ekip uzaktan destek verir. Yerinde servis için planlama yapılabilir.',
  },
  {
    q: 'Garanti kapsamı nedir?',
    a: 'Garanti süresi ürün tipine göre değişir. Fatura ve seri numarası ile destek alabilirsiniz.',
  },
];

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

const truncate = (value: string, max = 160) =>
  value.length > max ? `${value.slice(0, max - 3)}...` : value;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let part: Awaited<ReturnType<typeof getSparePartById>> | null = null;
  try {
    part = await getSparePartById(id);
  } catch {
    part = null;
  }

  if (!part) {
    return {
      title: 'Ürün bulunamadı',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/spare-parts/${part.id}`;
  const title = `${part.name} | Guohong Lazer`;
  const description = truncate(part.description || `${part.name} yedek parça detayları.`);
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
      ...(isSparePartPriceVisible()
        ? {
            'product:price:amount': String((part.priceCents / 100).toFixed(2)),
            'product:price:currency': part.currency || 'TRY',
          }
        : {}),
    },
  };
}

const renderStars = (average: number) =>
  Array.from({ length: 5 }, (_, index) => {
    const value = average - index;
    const isFull = value >= 0.9;
    const isHalf = value >= 0.1 && value < 0.9;

    if (isHalf) {
      return (
        <span key={`star-${index}`} className="relative inline-flex h-4 w-4">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-300" fill="currentColor" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
          </svg>
          <span className="absolute left-0 top-0 h-4 w-2 overflow-hidden">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
            </svg>
          </span>
        </span>
      );
    }

    return (
      <svg
        key={`star-${index}`}
        viewBox="0 0 20 20"
        className={`h-4 w-4 ${isFull ? 'text-amber-400' : 'text-slate-300'}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.538 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.783.57-1.838-.197-1.538-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.025 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
      </svg>
    );
  });

export default async function SparePartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sparePartPriceVisible = isSparePartPriceVisible();
  const sparePartDirectPurchaseEnabled = isSparePartDirectPurchaseEnabled();
  const backHref = '/spare-parts';

  const [part, review] = await Promise.all([
    getSparePartById(id).catch(() => null),
    getSparePartReviewSummary(id),
  ]);

  if (!part) notFound();

  const p: SparePartDetail = {
    id: part.id,
    name: part.name,
    description: part.description,
    dimensions: part.dimensions,
    hasSizeOptions: part.hasSizeOptions,
    sizeOptions: part.sizeOptions,
    sizeOptionPrices: part.sizeOptionPrices,
    sizeOptionImages: part.sizeOptionImages,
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

  const ratingCount = review.ratingCount;
  const ratingAverage = review.ratingAverage;

  const baseUrl = getBaseUrl().replace(/\/$/, '');

  const [related, boughtTogether] = await Promise.all([
    getRelatedSpareParts(part.category.id, id),
    getBoughtTogetherSpareParts(id),
  ]);

  const compatibility = compatibilityByCategory[p.category.name] ?? [];
  const sizeOptionEntries = p.hasSizeOptions
    ? buildSparePartSizeOptionEntries(p.sizeOptions, p.sizeOptionPrices, p.sizeOptionImages, p.priceCents, p.currency)
    : [];
  const visiblePriceCents = p.hasSizeOptions && sizeOptionEntries[0] ? sizeOptionEntries[0].priceCents : p.priceCents;
  const inStock = p.stockOnHand > 0;
  const isCritical = inStock && p.stockOnHand <= CRITICAL_STOCK_LEVEL;
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
    ...(sparePartPriceVisible
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: p.currency || 'TRY',
            price: (p.priceCents / 100).toFixed(2),
            availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${baseUrl}/spare-parts/${p.id}`,
          },
        }
      : {}),
    ...(ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(ratingAverage.toFixed(1)),
            ratingCount,
          },
        }
      : {}),
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_18%,#ffffff_42%,#f8fafc_100%)] pb-24 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ViewItemEvent id={p.id} name={p.name} priceCents={visiblePriceCents} currency={p.currency || 'TRY'} />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_56%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_34%)]" />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
            <Link href="/" className="hover:text-slate-900">
              Ana sayfa
            </Link>
            <span className="mx-2">/</span>
            <Link href={backHref} className="hover:text-slate-900">
              Yedek parçalar
            </Link>
            <span className="mx-2">/</span>
            <span>{p.category.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="#reviews"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Yorumlara git
            </Link>
            {p.isFeatured && (
              <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                Vitrin
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 rounded-[32px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.45)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">{p.category.name}</span>
                {p.dimensions ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">Ölçü: {p.dimensions}</span> : null}
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium">Stok: {p.stockOnHand}</span>
                {p.isFeatured ? (
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">Vitrin ürün</span>
                ) : null}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.8rem]">
                {p.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                {p.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[320px] lg:max-w-[360px] lg:grid-cols-1">
              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_100%)] px-4 py-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Teslim</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{inStock ? '2-3 gün içinde sevk' : '7-10 gün planlı teslim'}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Destek</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">Resmi servis ve teknik ekip</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_100%)] px-4 py-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Ödeme</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">Faturalı satış ve güvenli ödeme akışı</div>
              </div>
            </div>
          </div>

          {ratingCount > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-0.5" aria-label={`Ortalama puan ${ratingAverage.toFixed(1)} / 5`}>
                {renderStars(ratingAverage)}
              </span>
              <Link
                href="#reviews"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>{ratingAverage.toFixed(1)}</span>
                <span className="text-slate-400">({ratingCount})</span>
                <span className="text-slate-400">•</span>
                <span>Yorumları gör</span>
              </Link>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.15fr] lg:items-start">
          <SparePartDetailExperience
            id={p.id}
            name={p.name}
            priceCents={visiblePriceCents}
            imageUrl={p.imageUrl}
            images={p.images}
            inStock={inStock}
            isCritical={isCritical}
            stockOnHand={p.stockOnHand}
            showPrice={sparePartPriceVisible}
            sparePartDirectPurchaseEnabled={sparePartDirectPurchaseEnabled}
            sizeOptionEntries={sizeOptionEntries}
          />

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_80px_-55px_rgba(15,23,42,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Kisa bilgi
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_100%)] px-4 py-4 text-sm text-slate-700">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Teslim</div>
                  <div className="mt-1 font-semibold text-slate-900">{inStock ? '2-3 gün' : '7-10 gün'}</div>
                </div>
                <div className="rounded-[22px] bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-4 text-sm text-slate-700">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Garanti</div>
                  <div className="mt-1 font-semibold text-slate-900">Resmi servis</div>
                </div>
                <div className="rounded-[22px] bg-[linear-gradient(135deg,#f8fafc_0%,#fff7ed_100%)] px-4 py-4 text-sm text-slate-700">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Iade</div>
                  <div className="mt-1 font-semibold text-slate-900">14 gün</div>
                </div>
                <div className="rounded-[22px] bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_100%)] px-4 py-4 text-sm text-slate-700">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Satici</div>
                  <div className="mt-1 font-semibold text-slate-900">Guohong Lazer</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,0.9),rgba(224,242,254,0.9))] px-5 py-5 text-sm text-indigo-900 shadow-[0_18px_65px_-45px_rgba(79,70,229,0.7)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Uyumluluk listesi</p>
              {compatibility.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {compatibility.map((model) => (
                    <Link
                      key={model}
                      href={`/spare-parts?model=${encodeURIComponent(getModelId(model))}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      {model}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2">Uyumluluk için teknik ekiple iletişime geç.</p>
              )}
            </div>
          </div>
        </div>

        {(boughtTogether.length > 0 || related.length > 0) && (
          <div className="mt-12 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">
                  {boughtTogether.length > 0 ? 'Satın alanlar bunları da aldı' : 'Tamamlayıcı parçalar'}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {boughtTogether.length > 0 ? 'Birlikte satın alınan ürünler' : 'Benzer ürün önerileri'}
                </h2>
              </div>
              <Link
                href="/spare-parts"
                className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Tüm yedek parçalar
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(boughtTogether.length > 0 ? boughtTogether : related).map((item) => (
                <Link
                  key={item.id}
                  href={`/spare-parts/${item.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white">
                    <Image src={item.imageUrl || '/images/1.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.category.name}</p>
                  </div>
                  <span className="ml-auto text-indigo-600 transition group-hover:translate-x-1">-&gt;</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12" id="reviews">
          <SparePartReviews sparePartId={p.id} />
        </div>

        <div className="mt-12 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">SSS</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Sık sorulan sorular</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">{item.q}</div>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

