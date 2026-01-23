import Link from 'next/link';

const sectors = [
  { title: 'Otomotiv yan sanayi', detail: 'Yuksek hassasiyetli sac ve boru kesim hatlari.' },
  { title: 'Metal isleme', detail: 'Fason kesim ve uretim hatlari optimizasyonu.' },
  { title: 'Makine imalat', detail: 'Kurulum + devreye alma + servis paketleri.' },
  { title: 'Enerji ekipmanlari', detail: 'Kalibrasyon, kalite kontrol ve veri izleme.' },
];

const highlights = [
  { title: 'Kurulum', value: '1000+' },
  { title: 'Servis noktasi', value: '24' },
  { title: 'Referans proje', value: '350+' },
];

const stories = [
  {
    title: 'Yuksek hassasiyet sac kesim hatti',
    desc: 'Verimlilik %22 artarken fire orani %12 dustu. Takipli bakim ve uzaktan izleme aktif edildi.',
    tag: 'Sac kesim',
  },
  {
    title: 'Boru kesim hat hizlandirma',
    desc: 'Otomasyon revizyonu ile vardiya basina ortalama 40 dk tasarruf saglandi.',
    tag: 'Boru kesim',
  },
  {
    title: 'Kombine hat kurulum & egitim',
    desc: 'Kurulumdan 7 gun sonra operator egitimi tamamlandi, teslimatta tam performans elde edildi.',
    tag: 'Kombine kesim',
  },
];

export default function ReferencesPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white px-6 py-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_60%)]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-700">
              Referanslar
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Saha basarilari ve projeler</h1>
            <p className="max-w-2xl text-base text-slate-600">
              Kurulum, servis ve tedarik sureclerinde gercek saha basarilariyla olculen kurumsal guc.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 text-sm">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.title}</div>
                  <div className="mt-2 font-semibold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Sektorel dagilim</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {sectors.map((sector) => (
                <div key={sector.title} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{sector.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{sector.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Kurumsal guvence</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Tek ekip ile kurulum + egitim + servis sureci.</li>
              <li>Yedek parca tedarikinde kritik stok guvencesi.</li>
              <li>Performans raporu ve uretim analizi destegi.</li>
              <li>Kurumsal SLA ile planli servis takvimi.</li>
            </ul>
            <Link
              href="/contact?subject=Referans+Talebi"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Referans iste
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Saha hikayeleri</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Olculen basarilar</h2>
            </div>
            <Link
              href="/quote"
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              Teklif iste
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stories.map((story) => (
              <div key={story.title} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">{story.tag}</span>
                <p className="mt-3 text-sm font-semibold text-slate-900">{story.title}</p>
                <p className="mt-2 text-sm text-slate-600">{story.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
