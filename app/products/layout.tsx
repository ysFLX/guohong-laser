import type { Metadata } from 'next';

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

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

