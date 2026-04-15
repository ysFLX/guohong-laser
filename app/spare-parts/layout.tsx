import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Yedek Parçalar | Guohong Lazer',
  description:
    'Lazer kafası, koruma lensi, nozul, seramik gövde ve diğer fiber lazer yedek parçaları için ürün ve destek sayfası.',
  alternates: {
    canonical: `${siteUrl}/spare-parts`,
  },
  openGraph: {
    title: 'Yedek Parçalar | Guohong Lazer',
    description:
      'Lazer kafası, koruma lensi, nozul, seramik gövde ve diğer fiber lazer yedek parçaları için ürün ve destek sayfası.',
    url: `${siteUrl}/spare-parts`,
    type: 'website',
  },
};

export default function SparePartsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
