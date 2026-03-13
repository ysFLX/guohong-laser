'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';
import { sanitizeSparePartSizeOptions } from '@/lib/sparePartSizeOptions';

type Category = { id: string; name: string };

function createEmptySizeRow() {
  return '';
}

export default function AdminSparePartCreateForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const inputClassName =
    'mt-2 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [hasSizeOptions, setHasSizeOptions] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<string[]>([createEmptySizeRow()]);
  const [priceTry, setPriceTry] = useState('');
  const [stockOnHand, setStockOnHand] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateSizeOption = (index: number, value: string) => {
    setSizeOptions((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addSizeOption = () => {
    setSizeOptions((prev) => [...prev, createEmptySizeRow()]);
  };

  const removeSizeOption = (index: number) => {
    setSizeOptions((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length > 0 ? next : [createEmptySizeRow()];
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">
          Hizli olustur
        </div>
        <div className="mt-2 text-sm text-[var(--admin-muted)]">
          Temel bilgileri gir, kaydet. Sonrasinda gorselleri ve ek detaylari urun sayfasindan tamamlayabilirsin.
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
              Urun adi
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              Aciklama
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
                Genel olcu
              </label>
              <input
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="Orn: Koruma lens"
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
              <div className="mt-2 text-xs text-[var(--admin-muted)]">Orn: 1299,90</div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                Stok
              </label>
              <input value={stockOnHand} inputMode="numeric" onChange={(e) => setStockOnHand(e.target.value)} className={inputClassName} />
              <div className="mt-2 text-xs text-[var(--admin-muted)]">Orn: 12</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
            <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              <input
                type="checkbox"
                checked={hasSizeOptions}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setHasSizeOptions(checked);
                  if (checked && sizeOptions.length === 0) {
                    setSizeOptions([createEmptySizeRow()]);
                  }
                }}
              />
              Olcu secenegi var mi?
            </label>

            {hasSizeOptions ? (
              <div className="mt-4 space-y-3">
                <div className="text-xs text-[var(--admin-muted)]">
                  Olculeri tek tek gir. Ornek: `20 mm`, `24.9 mm`, `27.9 mm`
                </div>
                {sizeOptions.map((value, index) => (
                  <div key={`size-option-${index}`} className="flex gap-2">
                    <input
                      value={value}
                      onChange={(e) => updateSizeOption(index, e.target.value)}
                      placeholder={`Olcu ${index + 1}`}
                      className={`${inputClassName} mt-0`}
                    />
                    <AdminButton
                      type="button"
                      variant="outline"
                      tone="rose"
                      className="shrink-0 px-4"
                      onClick={() => removeSizeOption(index)}
                    >
                      Sil
                    </AdminButton>
                  </div>
                ))}
                <AdminButton type="button" variant="outline" className="px-4" onClick={addSizeOption}>
                  Olcu ekle
                </AdminButton>
              </div>
            ) : null}
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
                const sanitizedSizeOptions = hasSizeOptions ? sanitizeSparePartSizeOptions(sizeOptions) : [];

                if (!name.trim()) {
                  setError('Urun adi bos olamaz');
                  setIsSaving(false);
                  return;
                }

                if (!categoryId) {
                  setError('Kategori secin');
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

                if (hasSizeOptions && sanitizedSizeOptions.length === 0) {
                  setError('Olculu urunler icin en az bir olcu gir.');
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
                      hasSizeOptions,
                      sizeOptions: sanitizedSizeOptions,
                      priceCents: Math.round(parsedPrice * 100),
                      stockOnHand: Math.floor(parsedStock),
                      categoryId,
                      isFeatured,
                      isActive,
                    }),
                  });

                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi');

                  setSuccess('Urun olusturuldu');
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
