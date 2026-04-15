import type { Metadata } from 'next';

import ReferenceHomeClient from '@/components/home/ReferenceHomeClient';
import { getUsdTryExchangeRate, resolveDisplayedCurrency, resolveDisplayedPriceCents } from '@/lib/exchangeRates';
import { prisma } from '@/lib/prisma';
import { isSparePartDirectPurchaseEnabled, isSparePartPriceVisible } from '@/lib/sparePartSales';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Fiber Lazer Kesim Makineleri, Yedek Parça ve Teknik Servis',
  description:
    'Guohong Lazer; sac plaka kesimi, boru kesimi ve demir kesimi için fiber lazer kesim makineleri, yedek parça ve teknik servis çözümleri sunar.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Fiber Lazer Kesim Makineleri, Yedek Parça ve Teknik Servis',
    description:
      'Guohong Lazer; sac plaka kesimi, boru kesimi ve demir kesimi için fiber lazer kesim makineleri, yedek parça ve teknik servis çözümleri sunar.',
    url: siteUrl,
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

  return (
    <ReferenceHomeClient
      showcase={showcase}
      activePartCount={activePartCount}
      sparePartPriceVisible={sparePartPriceVisible}
      sparePartDirectPurchaseEnabled={sparePartDirectPurchaseEnabled}
    />
  );
}
