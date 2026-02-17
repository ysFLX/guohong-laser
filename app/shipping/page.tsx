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
      'Türkiye geneli teslimat yapılır.',
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
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.45),_transparent_60%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Teslimat Merkezi
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Kargo ve teslimat politikası</h1>
            <p className="max-w-2xl text-base text-white/70">
              Sipariş hazırlık süresi, teslimat standartları ve takip adımları kurumsal satış süreciniz için
              netleştirilmiştir.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-white/60">{item.title}</div>
                  <div className="mt-2 font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            {deliveryCards.map((card) => (
              <div key={card.title} className="card-surface p-6">
                <div className="text-sm font-semibold text-[var(--foreground)]">{card.title}</div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--gray-500)]">
                  {card.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="card-surface p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--indigo-600)]">Hızlı bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm">
                <Link
                  href="/returns"
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  İade ve Garanti
                </Link>
                <Link
                  href="/payment-security"
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  Ödeme güvenliği
                </Link>
                <Link
                  href="/privacy"
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  Gizlilik politikası
                </Link>
              </div>
            </div>

            <div className="card-surface p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--indigo-600)]">Teslimat destek</div>
              <p className="mt-3 text-sm text-[var(--gray-500)]">
                Kritik teslimatlarda randevu planlaması, ağır ürünlerde ekipman desteği ve hasar tutanakları için destek
                sağlanır.
              </p>
              <Link
                href="/contact?subject=Kargo+Takip"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
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

