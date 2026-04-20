import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Ürünler | Guohong Lazer',
  description:
    'Sac plaka kesimi, boru kesimi ve demir kesimi için fiber lazer kesim makinesi çözümleri. Guohong Lazer ürün kataloğu.',
  alternates: {
    canonical: `${siteUrl}/products`,
  },
  openGraph: {
    title: 'Ürünler | Guohong Lazer',
    description:
      'Sac, boru ve demir kesimi için fiber lazer kesim makinesi çözümleri. Guohong Lazer ürün kataloğu.',
    url: `${siteUrl}/products`,
    type: 'website',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

