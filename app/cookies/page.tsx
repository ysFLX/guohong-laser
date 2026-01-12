import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-50/80 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.35),_transparent_60%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Guven Merkezi
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Cerez Politikasi</h1>
            <p className="max-w-2xl text-base text-white/70">
              Cerezler, site deneyimini iyilestirmek ve servisleri guvenli calistirmak icin kullanilir. Bu sayfada
              cerez turleri ve kontrol secenekleri ozetlenir.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">Performans</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Islevsellik</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Analitik</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Kullandigimiz cerez tipleri</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Zorunlu cerezler: Oturum ve guvenlik icin gereklidir.</li>
                <li>Performans cerezleri: Site hizini ve deneyimini iyilestirir.</li>
                <li>Analitik cerezler: Trafik ve icerik performansini olcer.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Cerez yonetimi</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Tarayici ayarlarinizdan cerezleri silebilir veya engelleyebilirsiniz.</li>
                <li>Bazi cerezler devre disi kalirsa site ozellikleri etkilenebilir.</li>
                <li>Tercihlerinizde degisiklik yaptiginizda yenileme gerekebilir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Ucuncu taraf servisler</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Odeme ve kargo servisleri, teknik olarak zorunlu cerezler kullanabilir.</li>
                <li>Analitik servisler anonim veriler uzerinden raporlama yapar.</li>
              </ul>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Hizli baglantilar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/privacy" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Gizlilik politikasi
                </Link>
                <Link href="/kvkk" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  KVKK aydinlatma
                </Link>
                <Link href="/payment-security" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Odeme guvenligi
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Tercih yardimi</div>
              <p className="mt-3 text-sm text-slate-600">
                Cerez tercihleriyle ilgili sorularin icin destek ekibimiz yardimci olur.
              </p>
              <Link
                href="/contact?subject=Cerez+Tercihleri"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Destek al
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
