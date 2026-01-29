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
              Güven Merkezi
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Ödeme Güvenliği</h1>
            <p className="max-w-2xl text-base text-white/70">
              Ödeme altyapısı güvenlik standartlarına uygundur. Kart bilgileri sistemimizde tutulmaz.
              İşlem adımları güvenli ödeme sağlayıcısı üzerinden yürütülür.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">SSL Koruma</span>
              <span className="rounded-full border border-white/20 px-3 py-1">PCI-DSS Uyumlu</span>
              <span className="rounded-full border border-white/20 px-3 py-1">3D Secure</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Güvenli altyapı</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>SSL ile şifrelenmiş bağlantı kullanılır.</li>
                <li>Ödeme sağlayıcısı PCI-DSS standartlarına uygun işlemler yapar.</li>
                <li>Kart bilgileri şirket sistemlerine kaydedilmez.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">3D Secure ve doğrulama</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Bankanızın 3D Secure doğrulama adımı gerekebilir.</li>
                <li>Şüpheli işlemler güvenlik nedeni ile reddedilebilir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Sahtekarlık önleme</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Olağandışı işlemler risk kontrolunden geçirilebilir.</li>
                <li>Gerekli görülürse ek doğrulama veya belgeler istenebilir.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Güven rozetleri</div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">SSL</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">PCI-DSS</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">3D Secure</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Banka onaylı ödeme</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">İade garantisi</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Ödeme işlemleri güvenli altyapı üzerinden gerçekleşir ve kart bilgileri sistemimizde tutulmaz.
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hızlı Bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/returns" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  İade ve Garanti
                </Link>
                <Link href="/shipping" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Kargo ve Teslimat
                </Link>
                <Link href="/privacy" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Gizlilik Politikası
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Güvenli ödeme adımları</div>
              <ol className="mt-4 space-y-3 text-sm text-slate-600">
                <li>1. Sipariş detaylarını onayla.</li>
                <li>2. 3D Secure doğrulamasını tamamla.</li>
                <li>3. Ödeme durumunu sipariş ekranından takip et.</li>
              </ol>
              <Link
                href="/contact?subject=Odeme+Sorusu"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Ödeme desteği al
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

