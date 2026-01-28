import Link from 'next/link';

export default function PaymentSecurityPage() {
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
            <h1 className="text-3xl font-semibold sm:text-4xl">Odeme Guvenligi</h1>
            <p className="max-w-2xl text-base text-white/70">
              Odeme altyapisi guvenlik standartlarina uygundur. Kart bilgileri sistemimizde tutulmaz.
              Islem adimlari guvenli odeme saglayicisi uzerinden yurutulur.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">SSL koruma</span>
              <span className="rounded-full border border-white/20 px-3 py-1">PCI-DSS uyumlu</span>
              <span className="rounded-full border border-white/20 px-3 py-1">3D Secure</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Guvenli altyapi</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>SSL ile sifrelenmis baglanti kullanilir.</li>
                <li>Odeme saglayicisi PCI-DSS standartlarina uygun islemler yapar.</li>
                <li>Kart bilgileri sirket sistemlerine kaydedilmez.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">3D Secure ve dogrulama</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Bankanizin 3D Secure dogrulama adimi gerekebilir.</li>
                <li>Supheli islemler guvenlik nedeni ile reddedilebilir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Sahtekarlik onleme</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Olagandisi islemler risk kontrolunden gecirilebilir.</li>
                <li>Gerekli gorulurse ek dogrulama veya belgeler istenebilir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Guven rozetleri</div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">SSL</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">PCI-DSS</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">3D Secure</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Banka onayli odeme</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Iade garantisi</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Odeme islemleri guvenli altyapi uzerinden gerceklesir ve kart bilgileri sistemimizde tutulmaz.
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hizli baglantilar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/returns" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Iade ve garanti
                </Link>
                <Link href="/shipping" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Kargo ve teslimat
                </Link>
                <Link href="/privacy" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Gizlilik politikasi
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Guvenli odeme adimlari</div>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li>1. Siparis detaylarini onayla.</li>
                <li>2. 3D Secure dogrulamasini tamamla.</li>
                <li>3. Odeme durumunu siparis ekranindan takip et.</li>
              </ol>
              <Link
                href="/contact?subject=Odeme+Sorusu"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Odeme destegi al
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

