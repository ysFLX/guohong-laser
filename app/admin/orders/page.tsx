import OrdersAdminManager from '@/components/admin/OrdersAdminManager';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Sipariş merkezi</div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Sipariş operasyonu</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tüm siparişleri, teslimat ve kargo bilgilerini tek ekranda yönet.
        </p>
      </div>

      <OrdersAdminManager />
    </div>
  );
}
