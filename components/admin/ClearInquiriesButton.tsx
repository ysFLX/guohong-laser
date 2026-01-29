'use client';

import { useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';

export default function ClearInquiriesButton({ type }: { type: 'CONTACT' | 'QUOTE' }) {
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="flex flex-col items-end">
      <AdminButton
        disabled={isClearing}
        tone="slate"
        variant="outline"
        onClick={async () => {
          const ok = window.confirm('Tüm kayıtları temizlemek istediğine emin misin?');
          if (!ok) return;

          setError('');
          setSuccess('');
          setIsClearing(true);
          try {
            const res = await fetch(`/api/admin/inquiries/clear?type=${type}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data?.error || 'Temizleme basarısız');
            }

            const count = typeof data?.count === 'number' ? data.count : 0;
            setSuccess(count > 0 ? `${count} kayıt kapatıldı.` : 'Açık kayıt yok.');

            window.location.reload();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Temizleme başarısız');
          } finally {
            setIsClearing(false);
          }
        }}
      >
        {isClearing ? 'Temizleniyor...' : 'Temizle'}
      </AdminButton>
      {success && <div className="mt-2 text-xs text-indigo-600">{success}</div>}
      {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
    </div>
  );
}


