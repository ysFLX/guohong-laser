import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageShell from "@/components/layout/PageShell";
import Providers from "./providers";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="tr" className="h-full bg-slate-50 dark:bg-slate-950">
      <head>
        <link rel="icon" href="/images/logokoyu.png" />
        <link rel="apple-touch-icon" href="/images/logokoyu.png" />
        <link rel="shortcut icon" href="/images/logokoyu.png" />
      </head>
      <body className={`${manrope.variable} ${geistMono.variable} flex min-h-full flex-col`}>
        <Providers>
          <Header />
          <main className="flex-grow">
            <PageShell>{children}</PageShell>
          </main>
          <Footer />
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
