import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import RootChrome from "@/components/layout/RootChrome";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guohong Lazer - Lazer Makineleri ve Yedek Parcalar",
  description: "Yuksek kaliteli lazer makineleri ve yedek parcalar icin dogru adres. En iyi fiyat ve kalite garantisi ile hizmetinizdeyiz.",
  keywords: "lazer makinesi, yedek parca, lazer kesim, lazer kazima, endustriyel lazer",
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
  return (
    <html lang="tr" className="h-full bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logokoyu.png" />
        <link rel="apple-touch-icon" href="/images/logokoyu.png" />
        <link rel="shortcut icon" href="/images/logokoyu.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-full`} suppressHydrationWarning>
        <Providers>
          <RootChrome>{children}</RootChrome>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
