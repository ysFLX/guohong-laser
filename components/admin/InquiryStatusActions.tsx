import { useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';

export default function InquiryStatusActions({ inquiryId, status }: { inquiryId: string; status: 'NEW' | 'READ' | 'CLOSED' }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const updateStatus = async (nextStatus: 'NEW' | 'READ' | 'CLOSED') => {
    setError('');
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Durum guncellenemedi');
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Durum guncellenemedi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        <AdminButton
          onClick={() => updateStatus('READ')}
          disabled={isSaving || status === 'READ'}
          tone="emerald"
          variant="outline"
        >
          Okundu
        </AdminButton>
        <AdminButton
          onClick={() => updateStatus('CLOSED')}
          disabled={isSaving}
          tone="rose"
          variant="outline"
        >
          Sil
        </AdminButton>
      </div>
      {error && <div className="text-xs text-rose-600">{error}</div>}
    </div>
  );
}
