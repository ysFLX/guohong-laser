import OrdersAdminManager from '@/components/admin/OrdersAdminManager';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sipariş merkezi"
        title="Sipariş operasyonu"
        description="Tüm siparişleri, teslimat ve kargo bilgilerini tek ekranda yönet."
      />

      <OrdersAdminManager />
    </div>
  );
}
