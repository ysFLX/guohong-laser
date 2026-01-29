import Link from 'next/link';

const faqGroups = [
  {
    title: 'Sipariş ve Teklif',
    items: [
      {
        q: 'Makine Fiyatları neden görünmüyor?',
        a: 'Ürünler kurumsal teklif ile fiyatlandırılır. Model, konfigurasyon ve teslimat seçeneklerine göre teklif hazırlanır.',
      },
      {
        q: 'Teklif ne kadar surede gelir?',
        a: 'Stoklu modeller için 30-60 dakika içinde, özel üretimlerde aynı gün içinde geri dönüş sağlanır.',
      },
      {
        q: 'Toplu alımda ekstra indirim var mı?',
        a: 'Toplu alımlarda proje bazlı fiyatlama yapılır. Teklif formunda adet bilgisini paylaşabilirsiniz.',
      },
    ],
  },
  {
    title: 'Teslimat ve Servis',
    items: [
      {
        q: 'Yedek parça teslimat süreleri nedir?',
        a: 'Stoklu ürünler aynı/ertesi gün kargoya verilir. Özel üretimlerde termin tarihi teklif aşamasında netleşir.',
      },
      {
        q: 'Kurulum ve eğitim sağlıyor musunuz?',
        a: 'Evet. Kurulum, test ve operator eğitimi kurumsal servis paketi kapsamında sunulur.',
      },
      {
        q: 'Garanti süreci nasıl ilerler?',
        a: 'Garanti başvurusu seri numarası ve fatura bilgisi ile açılır. Teknik ekip ön değerlendirme yapar.',
      },
    ],
  },
  {
    title: 'Yedek parçalar ve uyumluluk',
    items: [
      {
        q: 'Parça uyumluluğunu nasıl ögreneceğim?',
        a: 'Ürün sayfasında uyumluluk bilgisi yoksa teknik ekibe model adını ileterek teyit alabilirsiniz.',
      },
      {
        q: 'Stokta olmayan parçalar için ne yapmalıyım?',
        a: 'Teklif formu üzerinden talep oluşturarak tedarik süresi ve fiyat bilgisi alabilirsiniz.',
      },
      {
        q: 'Acil tedarik hizmeti var mı?',
        a: 'Kritik parçalar için hızlı tedarik süreci uygulanır. Durum bilgi panelinde paylaşılır.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white px-6 py-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_60%)]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-700">
              Destek Merkezi
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Sik sorulan sorular</h1>
            <p className="max-w-2xl text-base text-slate-600">
              Teklif, teslimat ve servis süreçleriyle ilgili en çok sorulan soruları tek sayfada topladık.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Kurumsal Satış</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Hızlı Destek</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Teknik Servis</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            {faqGroups.map((group) => (
              <div key={group.title} className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">{group.title}</div>
                <div className="mt-4 space-y-4 text-sm text-slate-600">
                  {group.items.map((item) => (
                    <div key={item.q} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">{item.q}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hızlı Bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/contact" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  İletişim
                </Link>
                <Link href="/quote" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Teklif İste
                </Link>
                <Link href="/returns" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  İade ve Garanti
                </Link>
                <Link href="/shipping" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Kargo ve Teslimat
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Canlı Destek</div>
              <p className="mt-3 text-sm text-slate-600">
                Projenize özel destek için teknik ekibimizden geri dönüş talep edebilirsiniz.
              </p>
              <Link
                href="/contact?subject=Hizli+Destek"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Destek Talebi
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
