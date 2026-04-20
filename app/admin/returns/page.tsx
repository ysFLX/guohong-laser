import ReturnsAdminManager from '@/components/admin/ReturnsAdminManager';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function AdminReturnsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ä°ade merkezi"
        title="Ä°ade ve değişiklik talepleri"
        description="Ä°ade taleplerini durum, not ve kanıt dosyalarıyla takip et."
      />
      <ReturnsAdminManager />
    </div>
  );
}

