import type { Metadata } from 'next';
import Link from 'next/link';

import { brandKeywords, defaultDescription, getAbsoluteUrl, legalName } from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    absolute: 'Guohong Lazer | Resmi Türkiye Fiber Lazer Çözümleri',
  },
  description: defaultDescription,
  keywords: [...brandKeywords, 'Guohong resmi', 'Guohong Türkiye'],
  alternates: {
    canonical: getAbsoluteUrl('/guohong-lazer'),
  },
  openGraph: {
    title: 'Guohong Lazer | Resmi Türkiye Fiber Lazer Çözümleri',
    description: defaultDescription,
    url: getAbsoluteUrl('/guohong-lazer'),
    type: 'website',
  },
};

export default function GuohongLazerPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Guohong Lazer',
    url: getAbsoluteUrl('/guohong-lazer'),
    description: defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: 'Guohong Lazer',
      legalName,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-600">Guohong Lazer</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Fiber lazer kesim makinesi, yedek parça ve teknik servis
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Guohong Lazer, Konya merkezli olarak fiber lazer kesim makinesi kurulumu, lazer yedek parça tedariği,
            teknik servis ve saha destek hizmetleri sunar. Türkiye genelinde endüstriyel üretim hatları için çözümler
            geliştirir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Makineleri incele
            </Link>
            <Link
              href="/spare-parts"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Yedek parçaları gör
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              İletişime geç
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Makine</div>
            <h2 className="mt-3 text-lg font-semibold">Fiber lazer kesim sistemleri</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Sac, boru ve farklı endüstriyel uygulamalar için yüksek performanslı lazer makinesi çözümleri.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Servis</div>
            <h2 className="mt-3 text-lg font-semibold">Teknik servis ve saha desteği</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Kurulum, devreye alma, arıza takibi ve operatör desteği dahil teknik süreçleri tek noktadan yönetir.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Yedek Parça</div>
            <h2 className="mt-3 text-lg font-semibold">Orijinal yedek parça tedariği</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Lazer kafası, lens, nozul, seramik gövde ve diğer kritik parçalar için hızlı tedarik altyapısı.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

