import Link from 'next/link';

const faqGroups = [
  {
    title: 'Siparis ve teklif',
    items: [
      {
        q: 'Fiyatlari neden gorunmuyor?',
        a: 'Urunler kurumsal teklif ile fiyatlandirilir. Model, konfigurasyon ve teslimat seceneklerine gore teklif hazirlanir.',
      },
      {
        q: 'Teklif ne kadar surede gelir?',
        a: 'Stoklu modeller icin 30-60 dakika icinde, ozel uretimlerde ayni gun icinde geri donus saglanir.',
      },
      {
        q: 'Toplu alimda ekstra indirim var mi?',
        a: 'Toplu alimlarda proje bazli fiyatlama yapilir. Teklif formunda adet bilgisini paylasabilirsiniz.',
      },
    ],
  },
  {
    title: 'Teslimat ve servis',
    items: [
      {
        q: 'Teslimat sureleri nedir?',
        a: 'Stoklu urunler ayni/ertesi gun kargoya verilir. Ozel uretimlerde termin tarihi teklif asamasinda netlesir.',
      },
      {
        q: 'Kurulum ve egitim sagliyor musunuz?',
        a: 'Evet. Kurulum, test ve operator egitimi kurumsal servis paketi kapsaminda sunulur.',
      },
      {
        q: 'Garanti sureci nasil ilerler?',
        a: 'Garanti basvurusu seri numarasi ve fatura bilgisi ile acilir. Teknik ekip on degerlendirme yapar.',
      },
    ],
  },
  {
    title: 'Yedek parca ve uyumluluk',
    items: [
      {
        q: 'Parca uyumlulugunu nasil ogrenecegim?',
        a: 'Urun sayfasinda uyumluluk bilgisi yoksa teknik ekibe model adini ileterek teyit alabilirsiniz.',
      },
      {
        q: 'Stokta olmayan parcalar icin ne yapmaliyim?',
        a: 'Teklif formu uzerinden talep olusturarak tedarik suresi ve fiyat bilgisi alabilirsiniz.',
      },
      {
        q: 'Acil tedarik hizmeti var mi?',
        a: 'Kritik parcalar icin hizli tedarik sureci uygulanir. Durum bilgi panelinde paylasilir.',
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
              Teklif, teslimat ve servis surecleriyle ilgili en cok sorulan sorulari tek sayfada topladik.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Kurumsal satis</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Hizli destek</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Teknik servis</span>
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
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hizli baglantilar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/contact" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Iletisim
                </Link>
                <Link href="/quote" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Teklif iste
                </Link>
                <Link href="/returns" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Iade ve garanti
                </Link>
                <Link href="/shipping" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Kargo ve teslimat
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Canli destek</div>
              <p className="mt-3 text-sm text-slate-600">
                Projenize ozel destek icin teknik ekibimizden geri donus talep edebilirsiniz.
              </p>
              <Link
                href="/contact?subject=Hizli+Destek"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Destek talebi
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
