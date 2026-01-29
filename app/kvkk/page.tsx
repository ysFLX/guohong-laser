import Link from 'next/link';

export default function KvkkPage() {
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
            <h1 className="text-3xl font-semibold sm:text-4xl">KVKK Aydinlatma Metni</h1>
            <p className="max-w-2xl text-base text-white/70">
              Kişisel verilerinizin işlenmesi, saklanması ve haklarınızla ilgili özet bilgilendirme. Detaylar için
              destek hattımızla görüşebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">Veri İşleme</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Aydınlatma</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Haklar</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">İşlenen veri kategorileri</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Kimlik ve iletişim bilgileri (ad, e-posta, telefon).</li>
                <li>Sipariş ve teslimat bilgileri (adres, ürün, fatura).</li>
                <li>İşlem güvenliği kayıtları (oturum, log, teknik kayıtlar).</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">İşleme amaçları</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Siparişin oluşturulması, ödeme ve teslimat sürecinin yürütülmesi.</li>
                <li>Garanti, iade ve teknik destek süreçlerinin yürütülmesi.</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi ve dolandırıcılık önleme.</li>
              </ul>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-sm font-semibold text-slate-900">Haklarınız</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Kişisel verilerin işlenip işlenmediğini öğrenme.</li>
                <li>Eksik veya yanlış işlenen verilerin düzeltilmesini talep etme.</li>
                <li>Mevzuata uygun ise silinmesini veya anonimleştirilmesini isteme.</li>
              </ul>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Hızlı bağlantılar</div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700">
                <Link href="/privacy" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Gizlilik Politikası
                </Link>
                <Link href="/cookies" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Çerez Politikası
                </Link>
                <Link href="/payment-security" className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                  Ödeme Güvenliği
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-[0_18px_48px_-30px_rgba(15,23,42,0.35)]">
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-600">Başvuru</div>
              <p className="mt-3 text-sm text-slate-600">
                KVKK kapsamında talep ve başvurularınızı destek hatti üzerinden iletebilirsiniz.
              </p>
              <Link
                href="/contact?subject=KVKK+Basvuru"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Başvuru yap
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

