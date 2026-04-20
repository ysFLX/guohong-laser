import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Referanslar | Guohong Lazer',
  description:
    'Guohong Lazer referans projeleri, kurulum örnekleri ve saha deneyimleri. Sac, boru ve demir kesim çözümleri.',
  alternates: {
    canonical: `${siteUrl}/references`,
  },
  openGraph: {
    title: 'Referanslar | Guohong Lazer',
    description:
      'Guohong Lazer referans projeleri, kurulum örnekleri ve saha deneyimleri. Sac, boru ve demir kesim çözümleri.',
    url: `${siteUrl}/references`,
    type: 'website',
  },
};

export default function ReferencesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

