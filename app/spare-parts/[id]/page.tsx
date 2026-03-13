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
import SparePartPurchaseClient from '@/components/spare-parts/SparePartPurchaseClient';
import SparePartImageSlider from '@/components/spare-parts/SparePartImageSlider';
import SparePartReviews from '@/components/spare-parts/SparePartReviews';
import { isSparePartDirectPurchaseEnabled, isSparePartPriceVisible } from '@/lib/sparePartSales';

type SparePartDetail = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  hasSizeOptions: boolean;
  sizeOptions: string[];
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  images: Array<{ id: string; url: string }>;
  stockOnHand: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
};

type RelatedPart = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  category: { name: string };
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
  const productUrl = `${baseUrl}/spare-parts/${p.id}`;
  const whatsAppText = `Merhaba, ${p.name} yedek parçası hakkında bilgi almak istiyorum.\nLink: ${productUrl}`;
  const whatsAppHref = `https://wa.me/905368316787?text=${encodeURIComponent(whatsAppText)}`;

  const [related, boughtTogether] = await Promise.all([
    getRelatedSpareParts(part.category.id, id),
    getBoughtTogetherSpareParts(id),
  ]);

  const compatibility = compatibilityByCategory[p.category.name] ?? [];
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
    offers: {
      '@type': 'Offer',
      ...(sparePartPriceVisible
        ? {
            priceCurrency: p.currency || 'TRY',
            price: (p.priceCents / 100).toFixed(2),
          }
        : {}),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/spare-parts/${p.id}`,
    },
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
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ViewItemEvent id={p.id} name={p.name} priceCents={p.priceCents} currency={p.currency || 'TRY'} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr_0.9fr] lg:items-start">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
              <SparePartImageSlider
                images={p.images}
                fallbackUrl={p.imageUrl || '/images/1.jpg'}
                name={p.name}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                {p.category.name}
              </span>
              <span className={`rounded-full px-3 py-1 ${inStock ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                {inStock ? 'Stokta' : 'Siparişle'}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {inStock ? '2-3 gün teslim' : '7-10 gün teslim'}
              </span>
              {isCritical && (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-3 py-1 text-amber-900">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
                  </span>
                  Stok azalıyor
                </span>
              )}
            </div>
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 sm:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Güvenli ödeme</div>
                <div className="mt-1 font-semibold text-slate-900">SSL korumalı</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Garanti</div>
                <div className="mt-1 font-semibold text-slate-900">Resmi servis</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">İade</div>
                <div className="mt-1 font-semibold text-slate-900">14 gün</div>
              </div>
            </div>
          </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                  {p.name}
                </h1>
                {ratingCount > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-0.5" aria-label={`Ortalama puan ${ratingAverage.toFixed(1)} / 5`}>
                      {renderStars(ratingAverage)}
                    </span>
                    <Link
                      href="#reviews"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>{ratingAverage.toFixed(1)}</span>
                      <span className="text-slate-400">({ratingCount})</span>
                      <span className="text-slate-400">•</span>
                      <span>Yorumları gör</span>
                    </Link>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Kategori: {p.category.name}</span>
                  <span>Stok: {p.stockOnHand}</span>
                  <span>Ölçü: {p.dimensions || '-'}</span>
                </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">{p.description}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Öne çıkanlar
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>Model uyumluluğu ve teknik destek dahil.</li>
                <li>Fatura ve garanti belgesi otomatik oluşur.</li>
                <li>Stoklu ürünlerde hızlı sevkiyat.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Güven paketi</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    Sertifika + servis + garanti tek ekranda
                  </h3>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-semibold text-indigo-700">
                  Kurumsal garanti
                </span>
              </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { title: 'Sertifikalı kalite', detail: 'CE, ISO 9001 ve uyum testleri.' },
                    { title: 'Orijinal tedarik', detail: 'Resmi servis ve orijinallik teyidi.' },
                    { title: 'Hızlı destek', detail: '24 saat içinde teknik geri dönüş.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.title}</div>
                    <p className="mt-2 text-xs text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className="rounded-full border border-slate-200 px-3 py-1">SSL korumalı ödeme</span>
                <span className="rounded-full border border-slate-200 px-3 py-1">Yetkili servis</span>
                <span className="rounded-full border border-slate-200 px-3 py-1">Fatura garantisi</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Teslim</p>
                <p className="mt-1 font-semibold text-slate-900">{inStock ? '2-3 gün' : '7-10 gün'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Durum</p>
                <p className="mt-1 font-semibold text-slate-900">{inStock ? 'Stokta' : 'Siparişle'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ölçü</p>
                <p className="mt-1 font-semibold text-slate-900">{p.dimensions || '-'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kategori</p>
                <p className="mt-1 font-semibold text-slate-900">{p.category.name}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-4 text-sm text-indigo-900">
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

          {sparePartPriceVisible ? (
            <SparePartPurchaseClient
              id={p.id}
              name={p.name}
              priceCents={p.priceCents}
              imageUrl={p.imageUrl}
              inStock={inStock}
              isCritical={isCritical}
              sparePartDirectPurchaseEnabled={sparePartDirectPurchaseEnabled}
              sizeOptions={p.hasSizeOptions ? p.sizeOptions : []}
            />
          ) : (
            <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)] lg:sticky lg:top-24 lg:block">
              <div className="text-3xl font-semibold text-slate-900">Fiyat için teklif al</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                <span className={`rounded-full px-3 py-1 ${inStock ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                  {inStock ? 'Stokta' : 'Siparişle'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {inStock ? '2-3 gün teslim' : '7-10 gün teslim'}
                </span>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Gönderen</span>
                  <span className="font-semibold text-slate-900">Guohong Lazer</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Garanti</span>
                  <span className="font-semibold text-slate-900">Resmi servis</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>İade</span>
                  <span className="font-semibold text-slate-900">14 gün</span>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <Link
                  href={
                    inStock
                      ? `/quote?product=${encodeURIComponent(p.name)}&id=${encodeURIComponent(p.id)}`
                      : `/stock-request?product=${encodeURIComponent(p.name)}&id=${encodeURIComponent(p.id)}`
                  }
                  className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 hover:border-amber-300"
                >
                  {inStock ? 'Fiyat teklifi iste' : 'Stok gelince haber ver'}
                </Link>
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  WhatsApp&apos;tan sor
                </a>
              </div>
            </aside>
          )}
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
