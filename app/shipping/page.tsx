import Link from 'next/link';

const highlights = [
  { title: 'Stoklu teslimat', value: 'Aynı/ertesi gün' },
  { title: 'Yurtdışı sevkiyat', value: 'Planlı lojistik' },
  { title: 'Takip güncelleme', value: 'Anlık panel + e-posta' },
];

const deliveryCards = [
  {
    title: 'Hazırlama süresi',
    items: [
      'Stoklu ürünler aynı gün veya ertesi iş günü kargolanır.',
      'Stoksuz ürünlerde tedarik süresi teklif onayında netleşir.',
      'Özel üretim modellerde termin tarihlerine göre planlama yapılır.',
    ],
  },
  {
    title: 'Teslimat bölgeleri',
    items: [
      'Türkiye geneli teslimat yapilir.',
      'Yurtdışı sevkiyatlar için lojistik ekibimiz destek verir.',
      'Ağır/hacimli ürünler için özel taşıma koşulları uygulanabilir.',
    ],
  },
  {
    title: 'Kargo takip',
    items: [
      'Takip numarası sipariş panelinde ve e-postada paylaşılır.',
      'Gecikme veya hasar durumunda ekip hemen bilgilendirilir.',
    ],
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white px-6 py-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_60%)]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-700">
              Teslimat Merkezi
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Kargo ve teslimat politikası</h1>
            <p className="max-w-2xl text-base text-slate-600">
              Sipariş hazırlık süresi, teslimat standartları ve takip adımları kurumsal satış süreciniz için
              netleştirilmiştir.
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

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            {deliveryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.3)]"
              >
                <div className="text-sm font-semibold text-slate-900">{card.title}</div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.3)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hızlı bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/returns" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  İade ve garanti
                </Link>
                <Link href="/payment-security" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Ödeme güvenliği
                </Link>
                <Link href="/privacy" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Gizlilik politikası
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.3)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Teslimat destek</div>
              <p className="mt-3 text-sm text-slate-600">
                Kritik teslimatlarda randevu planlaması, ağır ürünlerde ekipman desteği ve hasar tutanakları için destek
                sağlanır.
              </p>
              <Link
                href="/contact?subject=Kargo+Takip"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Kargo desteği
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
