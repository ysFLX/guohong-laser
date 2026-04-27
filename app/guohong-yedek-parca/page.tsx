import type { Metadata } from 'next';
import Link from 'next/link';

import { brandKeywords, getAbsoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Guohong Yedek Parça',
  description:
    'Guohong yedek parça sayfasında lazer kafası, lens, nozul, seramik gövde ve kritik sarf malzemeler için tedarik, stok ve teknik destek bilgileri yer alır.',
  keywords: [...brandKeywords, 'Guohong yedek parça', 'lazer kafası', 'koruma lensi', 'lazer nozul'],
  alternates: {
    canonical: getAbsoluteUrl('/guohong-yedek-parca'),
  },
  openGraph: {
    title: 'Guohong Yedek Parça',
    description:
      'Guohong yedek parça sayfasında lazer kafası, lens, nozul, seramik gövde ve kritik sarf malzemeler için tedarik, stok ve teknik destek bilgileri yer alır.',
    url: getAbsoluteUrl('/guohong-yedek-parca'),
    type: 'website',
  },
};

export default function GuohongYedekParcaPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Guohong Yedek Parça',
    url: getAbsoluteUrl('/guohong-yedek-parca'),
    description:
      'Guohong yedek parça, fiber lazer kesim makineleri için lens, nozul, lazer kafası ve sarf malzemelerin tedarik sayfasıdır.',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-600">Yedek Parça</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Guohong yedek parça tedariki</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Guohong Lazer; fiber lazer kesim makineleri için lazer kafası, koruma lensi, nozul, seramik gövde, conta
            ve diğer kritik yedek parçaları tedarik eder. Konya merkezli operasyonumuzla stoklu ürünler, uyumluluk
            kontrolü ve teknik geri dönüş sürecini tek noktadan yönetiyoruz.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/spare-parts"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Yedek parçayı incele
            </Link>
            <Link
              href="/contact?subject=Yedek+Parca"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Uyumluluk sor
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Stok ve Tedarik</div>
            <h2 className="mt-3 text-lg font-semibold">Kritik parçalarda hızlı erişim</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Stokta bulunan ürünler hızlı sevk edilir. Özel parça talepleri için teknik ekip model uyumluluğunu
              kontrol ederek teklif ve teslim bilgisi paylaşır.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Teknik Destek</div>
            <h2 className="mt-3 text-lg font-semibold">Model ve kullanım uyumluluğu</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Lazer kafa modeli, makine tipi ve kullanım amacına göre doğru yedek parçayı seçmeniz için ekibimiz destek
              verir. Böylece yanlış ürün siparişi ve duruş riski azalır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

