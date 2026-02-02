'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
    <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="text-sm font-semibold text-gray-900 dark:text-white">Admin: Resim Yükle</div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
        JPG/PNG/WEBP önerilir. Yükleme doğrudan Supabase Storage (bucket: spare-parts) içine yapılır.
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setError('');
            const list = Array.from(e.target.files || []);
            setFiles(list);
          }}
          className="block w-full text-sm text-gray-700 dark:text-gray-200"
        />

        <button
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
                })
              );
              setFiles([]);
              router.refresh();
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Yükleme başarısız');
            } finally {
              setIsUploading(false);
            }
          }}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isUploading ? 'Yükleniyor...' : 'yükle'}
        </button>
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Urun gorseli" className="h-28 w-full object-cover" />
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
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white hover:bg-black/80 disabled:opacity-60"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
