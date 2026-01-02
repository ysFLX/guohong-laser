export default function PaymentSecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Odeme Guvenligi</h1>
        <p className="mt-4 text-sm text-slate-600">
          Odeme altyapisi guvenlik standartlarina uygundur. Kart bilgileri sistemimizde tutulmaz.
          Islem adimlari guvenli odeme saglayicisi uzerinden yurutulur.
        </p>
        <div className="mt-6 space-y-6 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Guvenli altyapi</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>SSL ile sifrelenmis baglanti kullanilir.</li>
              <li>Odeme saglayicisi PCI-DSS standartlarina uygun islemler yapar.</li>
              <li>Kart bilgileri sirket sistemlerine kaydedilmez.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">3D Secure ve dogrulama</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Bankanizin 3D Secure dogrulama adimi gerekebilir.</li>
              <li>Supheli islemler guvenlik nedeni ile reddedilebilir.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Sahtekarlik onleme</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Olagandisi islemler risk kontrolunden gecirilebilir.</li>
              <li>Gerekli gorulurse ek dogrulama veya belgeler istenebilir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
