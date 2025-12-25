import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
  title: "Guohong Lazer - Lazer Makineleri ve Yedek ParÃ§alarÄ±",
  description: "YÃ¼ksek kaliteli lazer makineleri ve yedek parÃ§alarÄ± iÃ§in doÄŸru adres. En iyi fiyat ve kalite garantisi ile hizmetinizdeyiz.",
  keywords: "lazer makinesi, yedek parÃ§a, lazer kesim, lazer kazÄ±ma, endÃ¼striyel lazer",
  icons: {
    icon: "https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/logokoyu.png",
    shortcut: "https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/logokoyu.png",
    apple: "https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/logokoyu.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full bg-gray-50 dark:bg-gray-900">
      <body className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-full`}>
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
