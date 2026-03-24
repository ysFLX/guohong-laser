import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Guohong Yedek Parca',
  description:
    'Guohong yedek parca sayfasinda lazer kafasi, lens, nozul, seramik govde ve kritik sarf malzemeler icin tedarik, stok ve teknik destek bilgileri yer alir.',
  alternates: {
    canonical: `${siteUrl}/guohong-yedek-parca`,
  },
};

export default function GuohongYedekParcaPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Guohong Yedek Parca',
    url: `${siteUrl}/guohong-yedek-parca`,
    description:
      'Guohong yedek parca, fiber lazer kesim makineleri icin lens, nozul, lazer kafasi ve sarf malzemelerin tedarik sayfasidir.',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-600">Yedek Parca</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Guohong yedek parca tedarigi</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Guohong Lazer; fiber lazer kesim makineleri icin lazer kafasi, koruma lensi, nozul, seramik govde, conta
            ve diger kritik yedek parcalari tedarik eder. Konya merkezli operasyonumuzla stoklu urunler, uyumluluk
            kontrolu ve teknik geri donus surecini tek noktadan yonetiyoruz.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/spare-parts"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Yedek parcayi incele
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
            <h2 className="mt-3 text-lg font-semibold">Kritik parcalarda hizli erisim</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Stokta bulunan urunler hizli sevk edilir. Ozel parca talepleri icin teknik ekip model uyumlulugunu
              kontrol ederek teklif ve teslim bilgisi paylasir.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Teknik Destek</div>
            <h2 className="mt-3 text-lg font-semibold">Model ve kullanim uyumlulugu</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Lazer kafa modeli, makine tipi ve kullanim amacina gore dogru yedek parcayi secmeniz icin ekibimiz
              destek verir. Boylece yanlis urun siparisi ve durus riski azalir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
