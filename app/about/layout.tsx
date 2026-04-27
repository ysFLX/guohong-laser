import type { Metadata } from 'next';

import { getAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description:
    "Guohong Lazer'in üretim, servis ve satış sonrası destek yaklaşımı. Konya merkezli fiber lazer kesim çözümleri.",
  alternates: {
    canonical: getAbsoluteUrl('/about'),
  },
  openGraph: {
    title: 'Hakkımızda | Guohong Lazer',
    description:
      "Guohong Lazer'in üretim, servis ve satış sonrası destek yaklaşımı. Konya merkezli fiber lazer kesim çözümleri.",
    url: getAbsoluteUrl('/about'),
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

