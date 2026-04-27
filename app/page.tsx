import type { Metadata } from 'next';

import ReferenceHomeClient from '@/components/home/ReferenceHomeClient';
import { getUsdTryExchangeRate, resolveDisplayedCurrency, resolveDisplayedPriceCents } from '@/lib/exchangeRates';
import { prisma } from '@/lib/prisma';
import { brandKeywords, defaultDescription, getAbsoluteUrl, siteName } from '@/lib/seo';
import { isSparePartDirectPurchaseEnabled, isSparePartPriceVisible } from '@/lib/sparePartSales';

export const metadata: Metadata = {
  title: {
    absolute: 'Guohong Lazer | Fiber Lazer Kesim Makinesi, Yedek Parça ve Servis',
  },
  description: defaultDescription,
  keywords: [...brandKeywords, 'Guohong resmi Türkiye', 'Guohong Konya iletişim'],
  alternates: {
    canonical: getAbsoluteUrl('/'),
  },
  openGraph: {
    title: 'Guohong Lazer | Fiber Lazer Kesim Makinesi, Yedek Parça ve Servis',
    description: defaultDescription,
    url: getAbsoluteUrl('/'),
    type: 'website',
  },
};

const formatPrice = (value: number, currency = 'TRY') =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

const shortText = (value: string, max = 130) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);

export default async function Home() {
  const sparePartPriceVisible = isSparePartPriceVisible();
  const sparePartDirectPurchaseEnabled = isSparePartDirectPurchaseEnabled();
  const exchangeRate = await getUsdTryExchangeRate();

  const [featuredParts, activePartCount] = await Promise.all([
    prisma.sparePart.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: 6,
    }),
    prisma.sparePart.count({ where: { isActive: true } }),
  ]);

  const showcase = featuredParts.map((part) => {
    const displayedPriceCents = resolveDisplayedPriceCents(part.priceCents, part.currency, exchangeRate.rate);
    const displayedCurrency = resolveDisplayedCurrency(part.currency);
    const imageUrl = part.imageUrl ?? part.images[0]?.url ?? null;

    return {
      id: part.id,
      name: part.name,
      description: shortText(part.description, 122),
      image: imageUrl ?? '/images/2.jpg',
      imageUrl,
      categoryName: part.category.name,
      inStock: part.stockOnHand > 0,
      priceCents: displayedPriceCents,
      displayedPrice: formatPrice(displayedPriceCents / 100, displayedCurrency),
      href: `/spare-parts/${part.id}`,
    };
  });

  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${getAbsoluteUrl('/')}#home`,
    name: siteName,
    url: getAbsoluteUrl('/'),
    description: defaultDescription,
    isPartOf: { '@id': `${getAbsoluteUrl('/')}#website` },
    about: ['Guohong Lazer', 'fiber lazer kesim makinesi', 'lazer yedek parca', 'lazer teknik servis'],
    primaryImageOfPage: `${getAbsoluteUrl('/images/logokoyu.png')}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      <ReferenceHomeClient
        showcase={showcase}
        activePartCount={activePartCount}
        sparePartPriceVisible={sparePartPriceVisible}
        sparePartDirectPurchaseEnabled={sparePartDirectPurchaseEnabled}
      />
    </>
  );
}

