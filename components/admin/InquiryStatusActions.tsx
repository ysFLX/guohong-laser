'use client';

import { useState } from 'react';

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
        <button
          type="button"
          disabled={isSaving || status === 'READ'}
          onClick={() => updateStatus('READ')}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
        >
          Okundu
        </button>
        <button
          type="button"
          disabled={isSaving || status === 'CLOSED'}
          onClick={() => updateStatus('CLOSED')}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
        >
          Incele
        </button>
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
