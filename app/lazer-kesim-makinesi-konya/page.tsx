import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Lazer Kesim Makinesi Konya',
  description:
    'Konya icin fiber lazer kesim makinesi, kurulum, teknik servis, yedek parca ve satis sonrasi destek cozumleri Guohong Lazer tarafindan sunulur.',
  alternates: {
    canonical: `${siteUrl}/lazer-kesim-makinesi-konya`,
  },
};

export default function LazerKesimMakinesiKonyaPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Lazer Kesim Makinesi Konya',
    url: `${siteUrl}/lazer-kesim-makinesi-konya`,
    about: ['lazer kesim makinesi konya', 'fiber lazer kesim makinesi', 'teknik servis', 'Guohong Lazer'],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-600">Konya Uretim Cozumleri</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Lazer kesim makinesi Konya</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Konya ve cevre illerde fiber lazer kesim makinesi arayan firmalar icin Guohong Lazer; makine secimi,
            tekliflendirme, kurulum, operator egitimi, teknik servis ve yedek parca tedarigi sunar. Sac, boru ve
            farkli metal kesim hatlarina uygun sistemlerle uretim kapasitesini guclendirir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Makine cozumlerini gor
            </Link>
            <Link
              href="/quote"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Teklif al
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Kurulum</div>
            <h2 className="mt-3 text-lg font-semibold">Saha kurulumu ve devreye alma</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Makine tesliminden sonra saha kurulum, test ve ilk uretim sureci planli sekilde tamamlanir.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Servis</div>
            <h2 className="mt-3 text-lg font-semibold">Teknik servis ve operator destegi</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Uzaktan destek, saha servis yonlendirmesi ve bakim planlari ile hat duruslari azaltilir.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Yedek Parca</div>
            <h2 className="mt-3 text-lg font-semibold">Hizli parca ve sarf malzeme tedariği</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Koruma lensi, nozul, seramik ve kritik makinelerde kullanilan diger parcalar hizli sekilde temin edilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
