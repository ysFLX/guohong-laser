import Link from 'next/link';

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-semibold sm:text-4xl">Gizlilik Politikasi</h1>
            <p className="max-w-2xl text-base text-white/70">
              Guohong Lazer olarak kisisel verilerinizi guvenle isler, yalnizca hizmetin gerektirdigi kadarini saklariz.
              Bu sayfada verilerin hangi amaclarla toplandigi ve nasil korundugu ozetlenir.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">Veri guvenligi</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Islem amaclari</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Paylasim</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Toplanan veriler</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Iletisim bilgileri (ad, e-posta, telefon).</li>
                <li>Siparis ve teslimat bilgileri (adres, fatura, urun).</li>
                <li>Islem guvenligi (IP, cihaz, oturum kayitlari).</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Kullanim amaclari</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Teklif, siparis ve teslimat sureclerini yurutmek.</li>
                <li>Garanti, iade ve destek taleplerini yonetmek.</li>
                <li>Yasal yukumlulukleri yerine getirmek ve suistimali onlemek.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Veri paylasimi</div>
              <p className="mt-3 text-sm text-slate-600">
                Veriler, siparis ve teslimat sureci icin zorunlu olan kargo, odeme ve teknik servis saglayicilariyla
                paylasilabilir. Bu paylasimlar, sadece hizmetin sunumu icin gereklidir.
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hizli baglantilar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/kvkk" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  KVKK aydinlatma
                </Link>
                <Link href="/cookies" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Cerez politikasi
                </Link>
                <Link href="/distance-sales" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Mesafeli satis sozlesmesi
                </Link>
                <Link href="/returns" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Iade ve garanti
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Veri talebi</div>
              <p className="mt-3 text-sm text-slate-600">
                Verilerinizle ilgili taleplerinizi veya guncelleme isteklerinizi destek ekibimize iletebilirsiniz.
              </p>
              <Link
                href="/contact?subject=Gizlilik+Talebi"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Talep olustur
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

