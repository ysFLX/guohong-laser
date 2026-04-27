import type { Metadata } from 'next';

import { getAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'İletişim',
  description:
    'Guohong Lazer ile teklif, teknik destek ve ürün bilgisi için iletişime geçin. Konya merkezli hızlı geri dönüş.',
  alternates: {
    canonical: getAbsoluteUrl('/contact'),
  },
  openGraph: {
    title: 'İletişim | Guohong Lazer',
    description:
      'Guohong Lazer ile teklif, teknik destek ve ürün bilgisi için iletişime geçin. Konya merkezli hızlı geri dönüş.',
    url: getAbsoluteUrl('/contact'),
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

