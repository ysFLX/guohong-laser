import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import RootChrome from "@/components/layout/RootChrome";
import Providers from "./providers";
import Analytics from "@/components/analytics/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
const siteName = "Guohong Lazer";
const defaultTitle = "Guohong Lazer - Lazer Makineleri ve Yedek Parcalar";
const defaultDescription =
  "Yuksek kaliteli lazer makineleri ve yedek parcalar icin dogru adres. En iyi fiyat ve kalite garantisi ile hizmetinizdeyiz.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Guohong Lazer",
  },
  description: defaultDescription,
  keywords: "lazer makinesi, yedek parca, lazer kesim, lazer kazima, endustriyel lazer",
  alternates: {
    canonical: siteUrl,
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
    type: "website",
    locale: "tr_TR",
    images: [
      {
        url: "/images/og-cover.svg",
        alt: `${siteName} OG`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/og-cover.svg"],
  },
  icons: {
    icon: "/images/logokoyu.png",
    shortcut: "/images/logokoyu.png",
    apple: "/images/logokoyu.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="tr" className="h-full bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logokoyu.png" />
        <link rel="apple-touch-icon" href="/images/logokoyu.png" />
        <link rel="shortcut icon" href="/images/logokoyu.png" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-full`} suppressHydrationWarning>
        <Analytics gaId={gaId} metaPixelId={metaPixelId} />
        <Providers>
          <RootChrome>{children}</RootChrome>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
