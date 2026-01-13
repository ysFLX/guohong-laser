import ReturnsAdminManager from '@/components/admin/ReturnsAdminManager';

export default function AdminReturnsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Iade merkezi</div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Iade ve degisim talepleri</h1>
        <p className="mt-2 text-sm text-slate-600">
          Musteri taleplerini durum ve notlarla yonet, kanit dosyalarina hizlica ulas.
        </p>
      </div>
      <ReturnsAdminManager />
    </div>
  );
}
