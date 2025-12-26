'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Category = { id: string; name: string };

type Initial = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  stockOnHand: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
};

export default function AdminSparePartEditForm({
  initial,
  categories,
}: {
  initial: Initial;
  categories: Category[];
}) {
  const router = useRouter();

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [dimensions, setDimensions] = useState(initial.dimensions || '');
  const [priceTry, setPriceTry] = useState(String((initial.priceCents / 100).toFixed(2)));
  const [stockOnHand, setStockOnHand] = useState(String(initial.stockOnHand));
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [isFeatured, setIsFeatured] = useState(initial.isFeatured);
  const [isActive, setIsActive] = useState(initial.isActive);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">ÃœrÃ¼n Bilgileri</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">DeÄŸiÅŸiklikleri kaydetmek iÃ§in alttaki butonu kullan.</div>
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      {success && <div className="mt-4 text-sm text-green-700">{success}</div>}

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">ÃœrÃ¼n AdÄ±</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">AÃ§Ä±klama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">Ã–lÃ§Ã¼ler</label>
            <input
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="Ã–rn: M16, D30, F125"
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">Fiyat (TL)</label>
            <input
              value={priceTry}
              inputMode="decimal"
              onChange={(e) => setPriceTry(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">Stok</label>
            <input
              value={stockOnHand}
              inputMode="numeric"
              onChange={(e) => setStockOnHand(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
            />
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Stok deÄŸiÅŸince otomatik ADJUSTMENT hareketi yazÄ±lÄ±r.</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktif
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Vitrin
          </label>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              setError('');
              setSuccess('');

              const parsedPrice = Number(String(priceTry).replace(',', '.'));
              const parsedStock = Number(stockOnHand);

              if (!name.trim()) {
                setError('ÃœrÃ¼n adÄ± boÅŸ olamaz');
                setIsSaving(false);
                return;
              }

              if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                setError('Fiyat geÃ§ersiz');
                setIsSaving(false);
                return;
              }

              if (!Number.isFinite(parsedStock) || parsedStock < 0) {
                setError('Stok geÃ§ersiz');
                setIsSaving(false);
                return;
              }

              try {
                const res = await fetch(`/api/spare-parts/${initial.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: name.trim(),
                    description,
                    dimensions: dimensions.trim() ? dimensions.trim() : null,
                    priceCents: Math.round(parsedPrice * 100),
                    stockOnHand: Math.floor(parsedStock),
                    categoryId,
                    isFeatured,
                    isActive,
                  }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi');

                setSuccess('Kaydedildi');
                router.refresh();
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Kaydedilemedi');
              } finally {
                setIsSaving(false);
              }
            }}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}


