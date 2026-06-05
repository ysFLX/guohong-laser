import type { Metadata } from 'next';
import { Geist_Mono, Poppins } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Analytics from '@/components/analytics/Analytics';
import CookieBanner from '@/components/legal/CookieBanner';
import RootChrome from '@/components/layout/RootChrome';
import {
  brandAliases,
  brandKeywords,
  defaultDescription,
  defaultTitle,
  getAbsoluteUrl,
  getSiteUrl,
  legalName,
  siteName,
} from '@/lib/seo';

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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  creator: siteName,
  publisher: siteName,
  title: {
    default: defaultTitle,
    template: '%s | Guohong Lazer',
  },
  description: defaultDescription,
  keywords: [
    ...brandKeywords,
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
    canonical: getAbsoluteUrl('/'),
    languages: {
      tr: getAbsoluteUrl('/'),
      'tr-TR': getAbsoluteUrl('/'),
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: getAbsoluteUrl('/'),
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
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18216035841';
  const showSpeedInsights = process.env.VERCEL === '1';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: siteName,
    legalName,
    alternateName: brandAliases,
    description: defaultDescription,
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
        availableLanguage: ['tr', 'en'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Fevzi Cakmak Mah. Aksaray Cevre Yolu Cad. Akasya Sanayi Sitesi A Blok No:18 T',
      addressLocality: 'Karatay',
      addressRegion: 'Konya',
      postalCode: '42210',
      addressCountry: 'TR',
    },
    knowsAbout: [
      'Fiber lazer kesim makineleri',
      'Lazer yedek parca',
      'Lazer teknik servis',
      'Sac plaka kesimi',
      'Boru kesimi',
    ],
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}#localbusiness`,
    name: siteName,
    legalName,
    alternateName: brandAliases,
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
    alternateName: brandAliases,
    url: siteUrl,
    inLanguage: 'tr-TR',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key='site-theme';var saved=localStorage.getItem(key);var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var next=saved==='light'||saved==='dark'?saved:(prefersDark?'dark':'light');var root=document.documentElement;var body=document.body;if(next==='dark'){root.classList.add('dark')}else{root.classList.remove('dark')}root.dataset.theme=next;body.dataset.theme=next;root.style.colorScheme=next;body.style.colorScheme=next;localStorage.setItem(key,next)}catch(e){}})();`,
          }}
        />
        <Analytics gaId={gaId} adsId={adsId} />
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

