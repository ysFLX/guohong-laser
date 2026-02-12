'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

import { AdminButton } from '@/components/admin/AdminUi';

type SparePartImage = {
  id: string;
  url: string;
};

export default function AdminImageUpload({
  sparePartId,
  images,
}: {
  sparePartId: string;
  images: SparePartImage[];
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'ADMIN';

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !anon) return null;
    return createClient(url, anon);
  }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isAdmin) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-3 text-xs text-[var(--admin-muted)]">
        JPG/PNG/WEBP önerilir. Yükleme doğrudan Supabase Storage (bucket: <span className="font-semibold">spare-parts</span>)
        içine yapılır.
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setError('');
            const list = Array.from(e.target.files || []);
            setFiles(list);
          }}
          className="block w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--admin-card-muted)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--admin-text)] hover:file:bg-[var(--admin-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]"
        />

        <AdminButton
          type="button"
          disabled={files.length === 0 || isUploading}
          onClick={async () => {
            if (files.length === 0) return;
            setIsUploading(true);
            setError('');
            try {
              if (!supabase) {
                throw new Error('Supabase client hazır değil');
              }

              await Promise.all(
                files.map(async (file) => {
                  const signRes = await fetch(`/api/spare-parts/${sparePartId}/upload-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      fileName: file.name,
                      contentType: file.type,
                    }),
                  });
                  const signData = await signRes.json();
                  if (!signRes.ok) throw new Error(signData?.error || 'Upload url oluşturulamadı');

                  const upload = await supabase.storage
                    .from('spare-parts')
                    .uploadToSignedUrl(signData.path, signData.token, file, { contentType: file.type });

                  if (upload.error) {
                    throw new Error(upload.error.message || 'Yükleme başarısız');
                  }

                  const saveRes = await fetch(`/api/spare-parts/${sparePartId}/image-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: signData.publicUrl }),
                  });
                  const saveData = await saveRes.json();
                  if (!saveRes.ok) throw new Error(saveData?.error || 'Kaydedilemedi');
                }),
              );
              setFiles([]);
              router.refresh();
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Yükleme başarısız');
            } finally {
              setIsUploading(false);
            }
          }}
          className="px-6 py-3"
        >
          {isUploading ? 'Yükleniyor...' : 'Yükle'}
        </AdminButton>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Ürün görseli" className="h-28 w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              <button
                type="button"
                disabled={deletingId === img.id}
                onClick={async () => {
                  setError('');
                  setDeletingId(img.id);
                  try {
                    const res = await fetch(`/api/spare-parts/images/${img.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || 'Silme başarısız');
                    router.refresh();
                  } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : 'Silme başarısız');
                  } finally {
                    setDeletingId(null);
                  }
                }}
                className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-black/80 disabled:opacity-60"
              >
                {deletingId === img.id ? 'Siliniyor…' : 'Sil'}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
