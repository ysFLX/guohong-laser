import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Hakkımızda | Guohong Lazer',
  description:
    'Guohong Lazerâ€™in üretim, servis ve satış sonrası destek yaklaşımı. Konya merkezli fiber lazer kesim çözümleri.',
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: 'Hakkımızda | Guohong Lazer',
    description:
      'Guohong Lazerâ€™in üretim, servis ve satış sonrası destek yaklaşımı. Konya merkezli fiber lazer kesim çözümleri.',
    url: `${siteUrl}/about`,
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

