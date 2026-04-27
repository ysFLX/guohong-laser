import type { Metadata } from 'next';

import { getAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Referanslar',
  description:
    'Guohong Lazer referans projeleri, kurulum örnekleri ve saha deneyimleri. Sac, boru ve demir kesim çözümleri.',
  alternates: {
    canonical: getAbsoluteUrl('/references'),
  },
  openGraph: {
    title: 'Referanslar | Guohong Lazer',
    description:
      'Guohong Lazer referans projeleri, kurulum örnekleri ve saha deneyimleri. Sac, boru ve demir kesim çözümleri.',
    url: getAbsoluteUrl('/references'),
    type: 'website',
  },
};

export default function ReferencesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

