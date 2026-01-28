import ReturnsAdminManager from '@/components/admin/ReturnsAdminManager';

export default function AdminReturnsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">İade merkezi</div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">İade ve değişiklik talepleri</h1>
        <p className="mt-2 text-sm text-slate-500">
          İade taleplerini durum, not ve kanıt dosyalarıyla takip et.
        </p>
      </div>
      <ReturnsAdminManager />
    </div>
  );
}
