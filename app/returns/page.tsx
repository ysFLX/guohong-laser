export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Iade ve Garanti</h1>
        <p className="mt-4 text-sm text-slate-600">
          Iade kosullari, garanti kapsamı ve servis surecleri bu sayfada net olarak paylasilir.
          Satın alma oncesi ve sonrası destek icin iletisim kanallarimizi kullanabilirsiniz.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Iade kosullari</div>
            <p className="mt-1">
              Kullanim durumu, ürün tipi ve ambalaj kosullarina gore iade kabul kosullari degisebilir.
            </p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Garanti kapsamı</div>
            <p className="mt-1">
              Garanti suresi ve kapsamı ürün tipine gore degisir. Detaylar için destek ekibimize ulasin.
            </p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Servis sureci</div>
            <p className="mt-1">
              Ariza bildiriminden teslimata kadar tüm adimlar, teknik ekibimiz tarafindan yonetilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
