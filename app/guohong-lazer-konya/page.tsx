import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Guohong Lazer Konya',
  description:
    'Guohong Lazer Konya; fiber lazer kesim makinesi, teknik servis, yedek parca ve kurumsal uretim cozumleri sunar.',
  alternates: {
    canonical: `${siteUrl}/guohong-lazer-konya`,
  },
};

export default function GuohongLazerKonyaPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Guohong Lazer Konya',
    url: `${siteUrl}/guohong-lazer-konya`,
    about: ['Guohong Lazer', 'Konya', 'fiber lazer kesim makinesi', 'yedek parca', 'teknik servis'],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-600">Konya</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Guohong Lazer Konya
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Guohong Lazer Konya lokasyonunda fiber lazer kesim makineleri, orijinal yedek parca tedariği, teknik
            servis ve satis sonrasi destek hizmetleri sunar. Konya ve çevre illerde üretim yapan firmalar için hızlı
            erişilebilir saha desteği sağlar.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Konya icin sundugumuz hizmetler</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm font-semibold">Fiber lazer kesim makinesi satışı</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Uretim kapasitesine uygun lazer kesim makineleri icin teklif, planlama ve kurulum destegi.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm font-semibold">Yedek parca ve teknik servis</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Lens, nozul, seramik, lazer kafasi ve kritik parcalar icin hizli tedarik ve teknik geri donus.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Konya ofisiyle iletisime gec
            </Link>
            <Link
              href="/quote"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Teklif al
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
