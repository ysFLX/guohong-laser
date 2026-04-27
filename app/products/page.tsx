import type { Metadata } from 'next';

import ProductsPageClient from '@/components/products/ProductsPageClient';

import { getAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Ürünler',
  description:
    'Sac plaka kesimi, boru kesimi ve demir kesimi için fiber lazer kesim makinesi çözümleri. Guohong Lazer ürün kataloğu.',
  alternates: {
    canonical: getAbsoluteUrl('/products'),
  },
  openGraph: {
    title: 'Ürünler | Guohong Lazer',
    description:
      'Sac, boru ve demir kesimi için fiber lazer kesim makinesi çözümleri. Guohong Lazer ürün kataloğu.',
    url: getAbsoluteUrl('/products'),
    type: 'website',
  },
};

type ProductsPageProps = {
  searchParams?: { category?: string } | Promise<{ category?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  return <ProductsPageClient initialCategory={resolved?.category} />;
}

