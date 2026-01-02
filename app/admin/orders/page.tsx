import OrdersAdminManager from '@/components/admin/OrdersAdminManager';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Siparisler</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Tum siparisleri gorup durumunu guncelleyebilirsin.
        </p>
      </div>

      <OrdersAdminManager />
    </div>
  );
}
