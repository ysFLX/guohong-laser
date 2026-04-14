'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';
import { sanitizeSparePartSizeOptionEntries } from '@/lib/sparePartSizeOptions';

type Category = { id: string; name: string };
type SizeOptionRow = { value: string; priceUsd: string; priceTry: string };

function createEmptySizeRow(): SizeOptionRow {
  return { value: '', priceUsd: '', priceTry: '' };
}

function formatWholeTryPrice(priceCents: number, usdTryRate: number) {
  const safeRate = Number.isFinite(usdTryRate) && usdTryRate > 0 ? usdTryRate : 0;
  if (!safeRate) return null;

  const safePriceCents = Number.isFinite(priceCents) ? Math.max(0, Math.round(priceCents)) : 0;
  const roundedTryCents = Math.max(0, Math.round(safePriceCents * safeRate));
  const roundedTry = Math.max(0, Math.round(roundedTryCents / 100));

  return new Intl.NumberFormat('tr-TR').format(roundedTry);
}

export default function AdminSparePartCreateForm({
  categories,
  usdTryRate,
}: {
  categories: Category[];
  usdTryRate: number;
}) {
  const router = useRouter();
  const inputClassName =
    'mt-2 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [hasSizeOptions, setHasSizeOptions] = useState(false);
  const [sizeOptionRows, setSizeOptionRows] = useState<SizeOptionRow[]>([createEmptySizeRow()]);
  const [priceUsd, setPriceUsd] = useState('');
  const [priceCurrency, setPriceCurrency] = useState<'TRY' | 'USD'>('TRY');
  const [stockOnHand, setStockOnHand] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parsedPrice = Number(String(priceUsd).replace(',', '.'));
  const basePriceCents =
    Number.isFinite(parsedPrice) && parsedPrice >= 0 ? Math.round(parsedPrice * 100) : 0;
  const normalizedBasePriceCents =
    priceCurrency === 'USD' ? Math.ceil(basePriceCents / 100) * 100 : basePriceCents;
  const usdTryPreview = priceCurrency === 'USD' ? formatWholeTryPrice(normalizedBasePriceCents, usdTryRate) : null;

  const updateSizeRow = (index: number, next: Partial<SizeOptionRow>) => {
    setSizeOptionRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)),
    );
  };

  const addSizeOptionRow = () => {
    setSizeOptionRows((prev) => [...prev, createEmptySizeRow()]);
  };

  const removeSizeOptionRow = (index: number) => {
    setSizeOptionRows((prev) => {
      const next = prev.filter((_, rowIndex) => rowIndex !== index);
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
                Varsayilan fiyat
              </label>
              <div className="mt-2 grid grid-cols-[1fr_110px] gap-2">
                <input
                  value={priceUsd}
                  inputMode="decimal"
                  onChange={(e) => setPriceUsd(e.target.value)}
                  className={inputClassName}
                  placeholder={priceCurrency === 'TRY' ? '129,90' : '129,90'}
                />
                <select
                  value={priceCurrency}
                  onChange={(e) => setPriceCurrency(e.target.value === 'USD' ? 'USD' : 'TRY')}
                  className={inputClassName}
                >
                  <option value="TRY">TL</option>
                  <option value="USD">USD</option>
                </select>
              </div>
                <div className="mt-2 text-xs text-[var(--admin-muted)]">
                  Orn: 129,90 {priceCurrency === 'TRY' ? 'TL' : 'USD'}
                </div>
                {usdTryPreview ? (
                  <div className="mt-1 text-xs font-medium text-[var(--admin-text)]">
                    Yuvarlanmis TL karsiligi: {usdTryPreview} TL
                  </div>
                ) : null}
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
                  if (checked && sizeOptionRows.length === 0) {
                    setSizeOptionRows([createEmptySizeRow()]);
                  }
                }}
              />
              Olcu secenegi var mi?
            </label>

            {hasSizeOptions ? (
              <div className="mt-4 space-y-3">
                <div className="text-xs text-[var(--admin-muted)]">Her satirda olcu ve TL veya USD fiyat gir.</div>
                {sizeOptionRows.map((row, index) => (
                  <div key={`size-option-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <input
                      value={row.value}
                      onChange={(e) => updateSizeRow(index, { value: e.target.value })}
                      placeholder={`Olcu ${index + 1}`}
                      className={`${inputClassName} mt-0`}
                    />
                    <input
                      value={row.priceUsd}
                      inputMode="decimal"
                      onChange={(e) => updateSizeRow(index, { priceUsd: e.target.value })}
                      placeholder="Fiyat (USD, tam sayi)"
                      className={`${inputClassName} mt-0`}
                    />
                    <input
                      value={row.priceTry}
                      inputMode="decimal"
                      onChange={(e) => updateSizeRow(index, { priceTry: e.target.value })}
                      placeholder="Fiyat (TL)"
                      className={`${inputClassName} mt-0`}
                    />
                    <AdminButton
                      type="button"
                      variant="outline"
                      tone="rose"
                      className="shrink-0 px-4 sm:self-end"
                      onClick={() => removeSizeOptionRow(index)}
                    >
                      Sil
                    </AdminButton>
                  </div>
                ))}
                <AdminButton type="button" variant="outline" className="px-4" onClick={addSizeOptionRow}>
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
              const parsedStock = Number(stockOnHand);

                const hasBlankSizeRow = hasSizeOptions
                  ? sizeOptionRows.some(
                      (row) =>
                        row.value.trim().length === 0 ||
                        (row.priceUsd.trim().length === 0 && row.priceTry.trim().length === 0),
                    )
                  : false;
                const sizeOptionEntries = hasSizeOptions
                  ? sanitizeSparePartSizeOptionEntries(sizeOptionRows, basePriceCents, priceCurrency)
                  : [];

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

                if (hasSizeOptions && hasBlankSizeRow) {
                  setError('Olculu urunde her satir icin olcu ve fiyat gir.');
                  setIsSaving(false);
                  return;
                }

                if (hasSizeOptions && sizeOptionEntries.length === 0) {
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
                    sizeOptionEntries,
                    priceCents: normalizedBasePriceCents,
                    priceCurrency,
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
