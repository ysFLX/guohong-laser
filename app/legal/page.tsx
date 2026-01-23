import Link from 'next/link';

const legalLinks = [
  {
    title: 'KVKK Aydinlatma Metni',
    description: 'Kisisel veri isleme amaclari, haklar ve basvuru sureci.',
    href: '/kvkk',
  },
  {
    title: 'Gizlilik Politikasi',
    description: 'Toplanan veriler, saklama sureleri ve paylasim esaslari.',
    href: '/privacy',
  },
  {
    title: 'Cerez Politikasi',
    description: 'Cerez turleri, tercih yonetimi ve tarayici ayarlari.',
    href: '/cookies',
  },
  {
    title: 'Mesafeli Satis Sozlesmesi',
    description: 'Siparis, odeme, teslimat ve cayma hakki kosullari.',
    href: '/distance-sales',
  },
  {
    title: 'Iade ve Garanti',
    description: 'Iade kosullari, garanti kapsami ve servis sureci.',
    href: '/returns',
  },
  {
    title: 'Kargo ve Teslimat',
    description: 'Teslimat sureleri, kargo sureci ve takip bilgileri.',
    href: '/shipping',
  },
  {
    title: 'Odeme Guvenligi',
    description: 'Guvenli odeme altyapisi, SSL ve koruma adimlari.',
    href: '/payment-security',
  },
  {
    title: 'Firma Bilgileri',
    description: 'Resmi unvan, iletisim ve kurumsal bilgiler.',
    href: '/company',
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white px-6 py-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_60%)]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-700">
              Yasal Belgeler
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Guven ve uyumluluk merkezi</h1>
            <p className="max-w-2xl text-base text-slate-600">
              Yasal metinler, siparis kosullari ve veri guvenligi ile ilgili tum dokumanlara buradan ulasabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Guncel metinler</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Guvenli satis</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Kurumsal standart</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex h-full flex-col justify-between rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Yasal metin</div>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                Goruntule
                <span className="text-indigo-400 transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
