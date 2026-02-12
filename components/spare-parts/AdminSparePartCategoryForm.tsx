'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminButton } from '@/components/admin/AdminUi';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminSparePartCategoryForm() {
  const router = useRouter();
  const inputClassName =
    'mt-2 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]';
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            Kategori adı
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug.trim()) {
                setSlug(slugify(e.target.value));
              }
            }}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            Slug
          </label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClassName} />
          <div className="mt-2 text-xs text-[var(--admin-muted)]">Boş bırakırsan otomatik oluşturulur.</div>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktif
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <AdminButton
          type="button"
          disabled={isSaving}
          onClick={async () => {
            setError('');
            setSuccess('');
            const trimmedName = name.trim();
            const trimmedSlug = slug.trim();

            if (!trimmedName) {
              setError('Kategori adı boş olamaz');
              return;
            }

            const finalSlug = trimmedSlug || slugify(trimmedName);

            setIsSaving(true);
            try {
              const res = await fetch('/api/admin/spare-parts/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: trimmedName,
                  slug: finalSlug,
                  isActive,
                }),
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Kategori oluşturulamadı');

              setSuccess('Kategori oluşturuldu');
              setName('');
              setSlug('');
              setIsActive(true);
              router.refresh();
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Kategori oluşturulamadı');
            } finally {
              setIsSaving(false);
            }
          }}
          className="px-6 py-3"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kategori ekle'}
        </AdminButton>
      </div>
    </div>
  );
}



