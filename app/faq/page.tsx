import Link from 'next/link';

const faqGroups = [
  {
    title: 'Sipariş ve teklif',
    items: [
      {
        q: 'Makine fiyatları neden görünmüyor?',
        a: 'Makineler proje bazlı teklif ile fiyatlandırılıyor. Model, konfigürasyon ve teslimat koşullarına göre net teklif hazırlıyoruz.',
      },
      {
        q: 'Teklif ne kadar sürede gelir?',
        a: 'Stoklu modeller için genelde aynı gün içinde, özel üretimlerde ise kısa sürede geri dönüş sağlıyoruz.',
      },
      {
        q: 'Toplu alımda ekstra indirim var mı?',
        a: 'Toplu alımlarda proje bazlı fiyatlama yapıyoruz. Teklif formunda adet bilgisini paylaşmanız yeterli.',
      },
    ],
  },
  {
    title: 'Teslimat ve servis',
    items: [
      {
        q: 'Yedek parça teslimat süreleri nedir?',
        a: 'Stoklu ürünler aynı ya da ertesi gün kargoya verilir. Özel üretimlerde termin tarihi teklif aşamasında netleşir.',
      },
      {
        q: 'Kurulum ve eğitim sağlıyor musunuz?',
        a: 'Evet. Kurulum, test ve operatör eğitimi kurumsal servis paketinin içinde sunulur.',
      },
      {
        q: 'Garanti süreci nasıl ilerler?',
        a: 'Garanti başvurusu seri numarası ve fatura bilgisi ile açılır. Teknik ekip önce ön inceleme yapar.',
      },
    ],
  },
  {
    title: 'Yedek parçalar ve uyumluluk',
    items: [
      {
        q: 'Parça uyumluluğunu nasıl öğrenirim?',
        a: 'Ürün sayfasında bilgi yoksa model adını teknik ekibe iletin, hızlıca teyit edelim.',
      },
      {
        q: 'Stokta olmayan parçalar için ne yapmalıyım?',
        a: 'Teklif formu üzerinden talep oluşturursanız tedarik süresi ve fiyat bilgisini paylaşırız.',
      },
      {
        q: 'Acil tedarik hizmeti var mı?',
        a: 'Kritik parçalar için hızlı tedarik akışı uyguluyoruz. Durumu ekibimiz size ayrıca bildirir.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.45),_transparent_60%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Destek Merkezi
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Sık sorulan sorular</h1>
            <p className="max-w-2xl text-base text-white/70">
              Teklif, teslimat ve servis süreçleriyle ilgili en çok sorulan soruları tek sayfada topladık.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">Kurumsal Satış</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Hızlı Destek</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Teknik Servis</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            {faqGroups.map((group) => (
              <div key={group.title} className="card-surface p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--indigo-600)]">
                  {group.title}
                </div>
                <div className="mt-4 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.q} className="card-muted px-4 py-4">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{item.q}</p>
                      <p className="mt-2 text-sm text-[var(--gray-500)]">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="card-surface p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--indigo-600)]">Hızlı bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm">
                <Link href="/contact" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                  İletişim
                </Link>
                <Link href="/quote" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                  Teklif iste
                </Link>
                <Link href="/returns" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                  İade ve garanti
                </Link>
                <Link href="/shipping" className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-2 text-[var(--foreground)] transition hover:bg-[var(--surface)]">
                  Kargo ve teslimat
                </Link>
              </div>
            </div>

            <div className="card-surface p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--indigo-600)]">Canlı destek</div>
              <p className="mt-3 text-sm text-[var(--gray-500)]">
                Projene özel destek için teknik ekibimizden geri dönüş talep edebilirsin.
              </p>
              <Link href="/contact?subject=Hizli+Destek" className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800">
                Destek talebi
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

