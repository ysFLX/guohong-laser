import type { Metadata } from 'next';
import { Geist_Mono, Poppins } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Analytics from '@/components/analytics/Analytics';
import CookieBanner from '@/components/legal/CookieBanner';
import RootChrome from '@/components/layout/RootChrome';

import './globals.css';
import Providers from './providers';

const poppins = Poppins({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
const siteName = 'Guohong Lazer';
const defaultTitle = 'Guohong Lazer | Fiber Lazer Kesim Makineleri, Yedek Parça ve Teknik Servis';
const defaultDescription =
  'Guohong Lazer Konya merkezli fiber lazer kesim makineleri, yedek parça, teknik servis ve endüstriyel lazer çözümleri sunar. Türkiye geneli satış, destek ve yedek parça hizmeti.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | Guohong Lazer',
  },
  description: defaultDescription,
  keywords: [
    'guohong lazer',
    'guohong lazer konya',
    'guohong yedek parca',
    'fiber lazer kesim makinesi',
    'lazer kesim makinesi',
    'sac plaka kesimi',
    'boru kesimi',
    'demir kesimi',
    'konya lazer makinesi',
    'lazer kafasi',
    'koruma lens',
    'lazer nozul',
    'teknik servis',
    'fiber lazer',
  ],
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    type: 'website',
    locale: 'tr_TR',
    images: [
      {
        url: '/images/og-cover.svg',
        alt: 'Guohong Lazer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/images/og-cover.svg'],
  },
  icons: {
    icon: '/images/logokoyu.png',
    shortcut: '/images/logokoyu.png',
    apple: '/images/logokoyu.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const showSpeedInsights = process.env.VERCEL === '1';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/images/logokoyu.png`,
    sameAs: [
      'https://www.facebook.com/profile.php?id=61584746766233&locale=tr_TR',
      'https://www.instagram.com/gu0honglaser/',
      'https://wa.me/905368316787',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+90 536 831 67 87',
        contactType: 'sales',
        areaServed: 'TR',
        availableLanguage: ['tr'],
      },
    ],
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#localbusiness`,
    name: siteName,
    url: siteUrl,
    image: [`${siteUrl}/images/logokoyu.png`],
    telephone: '+90 536 831 67 87',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Fevzi Cakmak Mah. Aksaray Cevre Yolu Cad. Akasya Sanayi Sitesi A Blok No:18 T',
      addressLocality: 'Karatay',
      addressRegion: 'Konya',
      postalCode: '42210',
      addressCountry: 'TR',
    },
    areaServed: 'TR',
    sameAs: organizationSchema.sameAs,
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/spare-parts?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="tr" className="h-full overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logokoyu.png" />
        <link rel="apple-touch-icon" href="/images/logokoyu.png" />
        <link rel="shortcut icon" href="/images/logokoyu.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body
        className={`${poppins.variable} ${geistMono.variable} flex min-h-full flex-col overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]`}
        suppressHydrationWarning
      >
        <Analytics gaId={gaId} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <Providers>
          <RootChrome>{children}</RootChrome>
        </Providers>
        <CookieBanner />
        {showSpeedInsights ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}

