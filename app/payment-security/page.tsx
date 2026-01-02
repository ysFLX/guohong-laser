export default function PaymentSecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Odeme Guvenligi</h1>
        <p className="mt-4 text-sm text-slate-600">
          Odeme altyapisi guvenlik standartlarina uygundur. Kart bilgileri sistemimizde tutulmaz.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Guvenli altyapi</div>
            <p className="mt-1">Odeme islemleri SSL ile korunur ve guvenli servisler uzerinden gerceklesir.</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Kart bilgisi saklama</div>
            <p className="mt-1">Kart verileri saklanmaz, islem odeme saglayicisi tarafindan yurutulur.</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Sahtekarlik onleme</div>
            <p className="mt-1">Supheli islemler kontrol edilir ve gerekirse dogrulama talep edilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
