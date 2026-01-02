export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Iade ve Garanti</h1>
        <p className="mt-4 text-sm text-slate-600">
          Iade ve garanti surecleri urun tipi, kullanim durumu ve servis raporlarina gore degisir.
          Asagidaki maddeler bilgilendirme amaclidir. Kesin teyit icin destek hattimizla iletisime gecin.
        </p>
        <div className="mt-6 space-y-6 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Iade kosullari</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Stoklu urunlerde iade talebi, teslimattan sonra makul sure icinde iletilmelidir.</li>
              <li>Urun orijinal ambalajinda, eksiksiz ve tekrar satilabilir durumda olmalidir.</li>
              <li>Ozel siparis ve kisilestirilmis urunlerde iade kabul edilmeyebilir.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Garanti kapsamı</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Garanti suresi urun grubuna gore degisir ve siparis belgesinde belirtilir.</li>
              <li>Yetkisiz mudahale, yanlis kullanim ve sariyici sarf malzeme hasarlari kapsam disidir.</li>
              <li>Garanti talepleri icin seri numarasi ve fatura gereklidir.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Servis sureci</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Ariza bildirimi alindiktan sonra teknik ekip on degerlendirme yapar.</li>
              <li>Gerekirse uzaktan destek veya yerinde servis planlanir.</li>
              <li>Parca degisimi ihtiyacinda onay ve tedarik sureci baslatilir.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
