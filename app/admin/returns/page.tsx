import ReturnsAdminManager from '@/components/admin/ReturnsAdminManager';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminReturnsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="İade merkezi"
        title="İade ve değişiklik talepleri"
        description="İade taleplerini durum, not ve kanıt dosyalarıyla takip et."
      />
      <ReturnsAdminManager />
    </div>
  );
}
