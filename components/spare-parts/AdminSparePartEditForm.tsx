'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Urun bilgileri</div>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Duzenleme paneli</h2>
          <p className="mt-1 text-sm text-slate-500">Degisiklikleri kaydetmek icin asagidaki butonu kullan.</p>
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
      {success && <div className="mt-4 text-sm text-emerald-600">{success}</div>}

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Urun adi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Aciklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Olculer</label>
            <input
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="Orn: M16, D30, F125"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Fiyat (TL)</label>
            <input
              value={priceTry}
              inputMode="decimal"
              onChange={(e) => setPriceTry(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Stok</label>
            <input
              value={stockOnHand}
              inputMode="numeric"
              onChange={(e) => setStockOnHand(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
            />
            <div className="mt-2 text-xs text-slate-500">Stok degisince hareket kaydi olusur.</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktif
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Vitrin
          </label>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <AdminButton
            type="button"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              setError('');
              setSuccess('');

              const parsedPrice = Number(String(priceTry).replace(',', '.'));
              const parsedStock = Number(stockOnHand);

              if (!name.trim()) {
                setError('Urun adi bos olamaz');
                setIsSaving(false);
                return;
              }

              if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                setError('Fiyat gecersiz');
                setIsSaving(false);
                return;
              }

              if (!Number.isFinite(parsedStock) || parsedStock < 0) {
                setError('Stok gecersiz');
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
            className="px-6 py-3"
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </AdminButton>
          <AdminButton
            type="button"
            disabled={isDeleting}
            onClick={async () => {
              const ok = window.confirm('Urunu silmek istiyor musun? Bu islem geri alinamaz.');
              if (!ok) return;
              setIsDeleting(true);
              setError('');
              setSuccess('');
              try {
                const res = await fetch(`/api/spare-parts/${initial.id}`, { method: 'DELETE' });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || 'Silinemedi');
                router.push('/admin/spare-parts');
                router.refresh();
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Silinemedi');
              } finally {
                setIsDeleting(false);
              }
            }}
            tone="rose"
            variant="outline"
            className="px-6 py-3"
          >
            {isDeleting ? 'Siliniyor...' : 'Urunu sil'}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
