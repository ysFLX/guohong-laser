'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClearInquiriesButton({ type }: { type: 'CONTACT' | 'QUOTE' }) {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        disabled={isClearing}
        onClick={async () => {
          const ok = window.confirm('Tum kayitlari temizlemek istedigine emin misin?');
          if (!ok) return;

          setError('');
          setIsClearing(true);
          try {
            const res = await fetch(`/api/admin/inquiries/clear?type=${type}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data?.error || 'Temizleme basarisiz');
            }
            router.refresh();
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Temizleme basarisiz');
          } finally {
            setIsClearing(false);
          }
        }}
        className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
      >
        {isClearing ? 'Temizleniyor...' : 'Temizle'}
      </button>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  );
}
