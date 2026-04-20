import Link from 'next/link';

const WHATSAPP_NUMBER = '905368316787';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-16">
      <section className="relative w-full overflow-hidden rounded-[36px] border border-slate-900/10 bg-slate-950 px-6 py-12 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.5),_transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.35))]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              404 â€¢ Sayfa bulunamadı
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Aradığın sayfayı bulamadık</h1>
            <p className="max-w-2xl text-sm text-white/70 sm:text-base">
              Link taşınmış, silinmiş veya hatalı olabilir. İstersen ana sayfaya dön veya hızlıca ürünlere göz at.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
            >
              Ana sayfaya dön
            </Link>
            <Link
              href="/spare-parts"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/50"
            >
              Yedek parçalar
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/50"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/products"
            className="group rounded-3xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Makineler</div>
            <div className="mt-2 text-sm font-semibold text-white">Katalogu incele</div>
            <div className="mt-1 text-sm text-white/70">Model, güç ve otomasyon filtreleriyle.</div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Git <span className="transition group-hover:translate-x-1">â†’</span>
            </div>
          </Link>
          <Link
            href="/contact"
            className="group rounded-3xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Destek</div>
            <div className="mt-2 text-sm font-semibold text-white">İletişime geç</div>
            <div className="mt-1 text-sm text-white/70">Teknik destek, teklif ve uyumluluk sor.</div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Git <span className="transition group-hover:translate-x-1">â†’</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}


