export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Kargo ve Teslimat</h1>
        <p className="mt-4 text-sm text-slate-600">
          Siparis hazirlanma suresi, kargo teslimati ve takip bilgileri burada paylasilir.
          Detaylar urun tipine ve stok durumuna gore degisebilir.
        </p>
        <div className="mt-6 space-y-6 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Hazirlama suresi</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Stoklu urunler genellikle ayni gun veya ertesi is gunu kargoya verilir.</li>
              <li>Stoksuz urunlerde tedarik suresi, teklif veya siparis onayinda bildirilir.</li>
              <li>Ozel uretim urunlerde planlanan termin tarihi esas alinir.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Teslimat bolgeleri</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Turkiye geneli teslimat yapilir.</li>
              <li>Yurtdisi sevkiyatlar icin lojistik planlama destegi verilir.</li>
              <li>Agir ve hacimli urunlerde ozel tasima kosullari uygulanabilir.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Kargo takibi</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Kargo takip numarasi siparis durumunda paylasilir.</li>
              <li>Gecikme veya hasar durumunda destek ekibimize hemen ulasin.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
