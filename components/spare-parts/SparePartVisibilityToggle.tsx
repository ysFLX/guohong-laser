'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  sparePartId: string;
  isActive: boolean;
  compact?: boolean;
};

export default function SparePartVisibilityToggle({ sparePartId, isActive, compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextActive = !isActive;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/spare-parts/${sparePartId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: nextActive }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || 'Durum guncellenemedi');
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
      className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive
          ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
      } ${compact ? 'px-2.5 py-1.5 text-[11px]' : ''}`}
    >
      {loading ? 'Bekle...' : isActive ? 'Gizle' : 'Goster'}
    </button>
  );
}
