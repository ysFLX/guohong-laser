import Link from 'next/link';

const summary = [
  { title: 'İade süresi', value: '14 gün (stoklu ürün)' },
  { title: 'Garanti', value: 'Resmi servis' },
  { title: 'Destek', value: '24/7 teyit' },
];

const policyBlocks = [
  {
    title: 'İade koşulları',
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
      'Arıza bildirimi alındiktan sonra teknik ekip ön değerlendirme yapar.',
      'Gerekirse uzaktan destek veya yerinde servis planlanır.',
      'Parça değişimi için onay ve tedarik süreci başlatılır.',
    ],
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white px-6 py-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_60%)]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-700">
              Garanti Merkezi
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">İade ve garanti politikaları</h1>
            <p className="max-w-2xl text-base text-slate-600">
              İade, garanti ve servis süreçleri ürün tipi ve teknik raporlara göre belirlenir. şağıdaki metinler
              kurumsal bilgi amacıyla sunulur.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {summary.map((item) => (
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
            {policyBlocks.map((block) => (
              <div
                key={block.title}
                className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.3)]"
              >
                <div className="text-sm font-semibold text-slate-900">{block.title}</div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.3)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hızlı Bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/shipping" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Kargo ve teslimat
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
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">İade başvurusu</div>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li>1. Sipariş numarasını ve ürün bilgisini paylaş.</li>
                <li>2. Teknik ekip ön değerlendirme yapsın.</li>
                <li>3. Onay sonrası iade akışına geçilsin.</li>
              </ol>
              <Link
                href="/returns-request"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                İade talebi oluştur
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
