import type { Metadata } from 'next';

import { getAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Yedek Parçalar',
  description:
    'Lazer kafası, koruma lensi, nozul, seramik gövde ve diğer fiber lazer yedek parçaları için ürün ve destek sayfası.',
  alternates: {
    canonical: getAbsoluteUrl('/spare-parts'),
  },
  openGraph: {
    title: 'Yedek Parçalar | Guohong Lazer',
    description:
      'Lazer kafası, koruma lensi, nozul, seramik gövde ve diğer fiber lazer yedek parçaları için ürün ve destek sayfası.',
    url: getAbsoluteUrl('/spare-parts'),
    type: 'website',
  },
};

export default function SparePartsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

