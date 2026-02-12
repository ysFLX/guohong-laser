'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';

type Category = { id: string; name: string };

export default function AdminSparePartCreateForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const inputClassName =
    'mt-2 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [priceTry, setPriceTry] = useState('');
  const [stockOnHand, setStockOnHand] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">
          Hızlı oluştur
        </div>
        <div className="mt-2 text-sm text-[var(--admin-muted)]">
          Temel bilgileri gir → kaydet. Sonrasında görselleri ve ek detayları ürün sayfasından tamamlayabilirsin.
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              Ürün adı
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={`${inputClassName} min-h-[160px] resize-y`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Ölçüler
              </label>
              <input
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="Örn: M16, D30, F125"
                className={inputClassName}
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Kategori
              </label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClassName}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Fiyat (TL)
              </label>
              <input value={priceTry} inputMode="decimal" onChange={(e) => setPriceTry(e.target.value)} className={inputClassName} />
              <div className="mt-2 text-xs text-[var(--admin-muted)]">Örn: 1299,90</div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Stok
              </label>
              <input value={stockOnHand} inputMode="numeric" onChange={(e) => setStockOnHand(e.target.value)} className={inputClassName} />
              <div className="mt-2 text-xs text-[var(--admin-muted)]">Örn: 12</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Aktif
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Vitrin
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
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
                  setError('Ürün adı boş olamaz');
                  setIsSaving(false);
                  return;
                }

                if (!categoryId) {
                  setError('Kategori seçin');
                  setIsSaving(false);
                  return;
                }

                if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                  setError('Fiyat geçersiz');
                  setIsSaving(false);
                  return;
                }

                if (!Number.isFinite(parsedStock) || parsedStock < 0) {
                  setError('Stok geçersiz');
                  setIsSaving(false);
                  return;
                }

                try {
                  const res = await fetch('/api/admin/spare-parts', {
                    method: 'POST',
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

                  setSuccess('Ürün oluşturuldu');
                  router.push(`/admin/spare-parts/${data.item.id}`);
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
          </div>
        </div>
      </div>
    </div>
  );
}
