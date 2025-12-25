'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClearInquiriesButton({ type }: { type: 'CONTACT' | 'QUOTE' }) {
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  return (
    <button
      type="button"
      disabled={isClearing}
      onClick={async () => {
        const ok = window.confirm('Tüm kayıtları temizlemek istediğine emin misin?');
        if (!ok) return;

        setIsClearing(true);
        try {
          await fetch('/api/admin/inquiries/clear', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
          });
          router.refresh();
        } finally {
          setIsClearing(false);
        }
      }}
      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
    >
      {isClearing ? 'Temizleniyor...' : 'Temizle'}
    </button>
  );
}
