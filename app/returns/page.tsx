import Link from 'next/link';

export default function ReturnsPage() {
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
            <h1 className="text-3xl font-semibold sm:text-4xl">Iade ve Garanti</h1>
            <p className="max-w-2xl text-base text-white/70">
              Iade ve garanti surecleri urun tipi, kullanim durumu ve servis raporlarina gore degisir.
              Asagidaki maddeler bilgilendirme amaclidir. Kesin teyit icin destek hattimizla iletisime gecin.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">14 gun iade</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Resmi servis</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Teknik destek</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Iade kosullari</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Stoklu urunlerde iade talebi, teslimattan sonra makul sure icinde iletilmelidir.</li>
                <li>Urun orijinal ambalajinda, eksiksiz ve tekrar satilabilir durumda olmalidir.</li>
                <li>Ozel siparis ve kisisellestirilmis urunlerde iade kabul edilmeyebilir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Garanti kapsami</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Garanti suresi urun grubuna gore degisir ve siparis belgesinde belirtilir.</li>
                <li>Yetkisiz mudahale, yanlis kullanim ve sariyici sarf malzeme hasarlari kapsam disidir.</li>
                <li>Garanti talepleri icin seri numarasi ve fatura gereklidir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Servis sureci</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Ariza bildirimi alindiktan sonra teknik ekip on degerlendirme yapar.</li>
                <li>Gerekirse uzaktan destek veya yerinde servis planlanir.</li>
                <li>Parca degisimi ihtiyacinda onay ve tedarik sureci baslatilir.</li>
              </ul>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Hizli baglantilar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/payment-security" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Odeme guvenligi
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
              <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Iade basvurusu</div>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li>1. Siparis numarasini ve urun bilgisini paylas.</li>
                <li>2. Teknik ekip on degerlendirme yapsin.</li>
                <li>3. Onay sonrasi iade akisina gecilsin.</li>
              </ol>
              <Link
                href="/contact?subject=Iade+Talebi"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Iade talebi olustur
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
