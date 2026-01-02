export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Gizlilik Politikasi</h1>
        <p className="mt-4 text-sm text-slate-600">
          Bu sayfa, Guohong Lazer olarak kisisel verilerinizi hangi amaclarla isledigimizi ve
          haklarinizi ozetler. Detayli bilgi ve talepler icin bizimle iletisime gecebilirsiniz.
        </p>
        <div className="mt-6 space-y-6 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Islenen veriler</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Ad, soyad, telefon, e-posta, teslimat ve fatura adresi</li>
              <li>Siparis ve fatura bilgileri, teslimat detaylari</li>
              <li>Destek, teklif veya iletisim taleplerine dair icerikler</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Isleme amaclari</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Siparislerin alinmasi, teslimati ve muhasebe surecleri</li>
              <li>Teknik destek ve musteri hizmetleri operasyonlari</li>
              <li>Yasal yukumluluklerin yerine getirilmesi</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Paylasim ve aktarim</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Kargo firmalari ile teslimat icin gerekli bilgiler paylasilir.</li>
              <li>Odeme islemleri guvenli odeme saglayicilari uzerinden yapilir.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Saklama suresi</div>
            <p className="mt-1">
              Veriler, mevzuatta ongorulen sureler ve isleme amaci kadar saklanir.
            </p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Haklariniz</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Kisisel verilerinize erisim, duzeltme ve silme talep etme</li>
              <li>Isleme faaliyetlerine itiraz ve bilgilendirme talebi</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Iletisim</div>
            <p className="mt-1">Telefon: +90 536 831 67 87</p>
            <p className="mt-1">E-posta: guohonglazerinfo@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
