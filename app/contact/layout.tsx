import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'İletişim | Guohong Lazer',
  description:
    'Guohong Lazer ile teklif, teknik destek ve ürün bilgisi için iletişime geçin. Konya merkezli hızlı geri dönüş.',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'İletişim | Guohong Lazer',
    description:
      'Guohong Lazer ile teklif, teknik destek ve ürün bilgisi için iletişime geçin. Konya merkezli hızlı geri dönüş.',
    url: `${siteUrl}/contact`,
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

