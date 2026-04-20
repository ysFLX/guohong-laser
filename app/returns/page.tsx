import Link from 'next/link';

const summary = [
  { title: 'Ä°ade süresi', value: '14 gün (stoklu ürün)' },
  { title: 'Garanti', value: 'Resmi servis' },
  { title: 'Destek', value: '24/7 teyit' },
];

const policyBlocks = [
  {
    title: 'Ä°ade koşulları',
    items: [
      'Stoklu ürünler için iade talebi makul süre içinde iletilmelidir.',
      'Ürün orijinal ambalajında, eksiksiz ve tekrar satılabilir durumda olmalıdır.',
      'Özel sipariş veya kişiselleştirilmiş ürünlerde iade koşulları farklı olabilir.',
    ],
  },
  {
    title: 'Garanti kapsamı',
    items: [
      'Garanti süresi ürün grubuna göre değişir ve sipariş belgesinde belirtilir.',
      'Yetkisiz müdahale, yanlış kullanım ve sarf malzeme hasarları kapsam dışıdır.',
      'Garanti taleplerinde seri numarası ve fatura bilgisi zorunludur.',
    ],
  },
  {
    title: 'Servis süreci',
    items: [
      'Arıza bildirimi alındıktan sonra teknik ekip ön değerlendirme yapar.',
      'Gerekirse uzaktan destek veya yerinde servis planlanır.',
      'Parça değişimi için onay ve tedarik süreci başlatılır.',
    ],
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.45),_transparent_60%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Garanti Merkezi
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Ä°ade ve garanti politikaları</h1>
            <p className="max-w-2xl text-base text-white/70">
              Ä°ade, garanti ve servis süreçleri ürün tipi ve teknik raporlara göre belirlenir. Aşağıdaki metinler
              kurumsal bilgi amacıyla sunulur.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {summary.map((item) => (
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
            {policyBlocks.map((block) => (
              <div key={block.title} className="card-surface p-6">
                <div className="text-sm font-semibold text-[var(--foreground)]">{block.title}</div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--gray-500)]">
                  {block.items.map((item) => (
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
                  href="/shipping"
                  className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]"
                >
                  Kargo ve teslimat
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
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--indigo-600)]">Ä°ade başvurusu</div>
              <ol className="mt-4 space-y-3 text-sm text-[var(--gray-500)]">
                <li>1. Sipariş numaranızı ve ürün bilgisini paylaşın.</li>
                <li>2. Teknik ekip ön değerlendirme yapsın.</li>
                <li>3. Onay sonrası iade akışına geçilsin.</li>
              </ol>
              <Link
                href="/returns-request"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
              >
                Ä°ade talebi oluştur
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


