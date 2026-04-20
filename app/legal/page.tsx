import Link from 'next/link';

const legalLinks = [
  {
    title: 'KVKK Aydınlatma Metni',
    description: 'Kişisel veri işleme amaçları, haklar ve başvuru süreci.',
    href: '/kvkk',
  },
  {
    title: 'Gizlilik Politikası',
    description: 'Toplanan veriler, saklama süreleri ve paylaşım esasları.',
    href: '/privacy',
  },
  {
    title: 'Çerez Politikası',
    description: 'Çerez türleri, tercih yönetimi ve tarayıcı ayarları.',
    href: '/cookies',
  },
  {
    title: 'Mesafeli Satış Sözleşmesi',
    description: 'Sipariş, ödeme, teslimat ve cayma hakkı koşulları.',
    href: '/distance-sales',
  },
  {
    title: 'Ä°ade ve Garanti',
    description: 'Ä°ade koşulları, garanti kapsamı ve servis süreci.',
    href: '/returns',
  },
  {
    title: 'Kargo ve Teslimat',
    description: 'Teslimat süreleri, kargo süreci ve takip bilgileri.',
    href: '/shipping',
  },
  {
    title: 'Ödeme Güvenliği',
    description: 'Güvenli ödeme altyapisi, SSL ve koruma adimlari.',
    href: '/payment-security',
  },
  {
    title: 'Firma Bilgileri',
    description: 'Resmi ünvan, iletişim ve kurumsal bilgiler.',
    href: '/company',
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.45),_transparent_60%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Yasal Belgeler
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Güven ve uyumluluk merkezi</h1>
            <p className="max-w-2xl text-base text-white/70">
              Yasal metinler, sipariş koşulları ve veri güvenliği ile ilgili tüm dokümanlara buradan ulaşabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">Güncel metinler</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Güvenli satış</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Kurumsal standart</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group card-surface flex h-full flex-col justify-between p-5 transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-34px_rgba(15,23,42,0.6)]"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-500)]">Yasal metin</div>
                <h2 className="mt-3 text-lg font-semibold text-[var(--foreground)]">{item.title}</h2>
                <p className="mt-2 text-sm text-[var(--gray-500)]">{item.description}</p>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--indigo-600)]">
                Görüntüle
                <span className="transition group-hover:translate-x-1">â†’</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

