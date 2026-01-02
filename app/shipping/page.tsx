export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Kargo ve Teslimat</h1>
        <p className="mt-4 text-sm text-slate-600">
          Siparis hazirlanma suresi, kargo firmasi ve teslimat araliklari burada yer alir.
          Teslimat adresi ve fatura adresi bilgileri siparis oncesi guncellenebilir.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Hazirlama suresi</div>
            <p className="mt-1">Stoklu urunler ayni gun, digerleri planlanan tarihte kargoya verilir.</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Teslimat bolgeleri</div>
            <p className="mt-1">Turkiye geneli teslimat yapilir. Yurtdisi icin destekle gorusebilirsiniz.</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Kargo takibi</div>
            <p className="mt-1">Siparis durumundan takip numarasina erisim saglanir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
