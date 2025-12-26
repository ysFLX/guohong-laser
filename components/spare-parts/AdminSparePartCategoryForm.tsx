'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-white">Yeni Kategori</div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      {success && <div className="mt-2 text-sm text-green-700">{success}</div>}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">Kategori Adi</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug.trim()) {
                setSlug(slugify(e.target.value));
              }
            }}
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div className="sm:col-span-1 flex items-end">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktif
          </label>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          disabled={isSaving}
          onClick={async () => {
            setError('');
            setSuccess('');
            const trimmedName = name.trim();
            const trimmedSlug = slug.trim();

            if (!trimmedName) {
              setError('Kategori adi bos olamaz');
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
              if (!res.ok) throw new Error(data?.error || 'Kategori olusturulamadi');

              setSuccess('Kategori olusturuldu');
              setName('');
              setSlug('');
              setIsActive(true);
              router.refresh();
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Kategori olusturulamadi');
            } finally {
              setIsSaving(false);
            }
          }}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSaving ? 'Kaydediliyor...' : 'Kategori Ekle'}
        </button>
      </div>
    </div>
  );
}


