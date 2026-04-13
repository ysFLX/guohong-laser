'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo, useRef, useState } from 'react';

import { AdminBadge, AdminButton, AdminRadioCard } from '@/components/admin/AdminUi';

type SparePartImage = {
  id: string;
  url: string;
};

type SizeOptionEntry = {
  value: string;
  imageUrl: string | null;
  imageUrls: string[];
};

export default function AdminImageUpload({
  sparePartId,
  images,
  sizeOptionEntries = [],
}: {
  sparePartId: string;
  images: SparePartImage[];
  sizeOptionEntries?: SizeOptionEntry[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const hasSizeOptions = sizeOptionEntries.length > 0;

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !anon) return null;
    return createClient(url, anon);
  }, []);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const sizeInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadMode, setUploadMode] = useState<'gallery' | 'size'>('gallery');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [sizeFiles, setSizeFiles] = useState<File[]>([]);
  const [selectedSizeValue, setSelectedSizeValue] = useState(sizeOptionEntries[0]?.value ?? '');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingSize, setIsUploadingSize] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sizeDeletingValue, setSizeDeletingValue] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isAdmin) return null;

  async function uploadFile(file: File) {
    if (!supabase) {
      throw new Error('Supabase client hazir degil');
    }

    const signRes = await fetch(`/api/spare-parts/${sparePartId}/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    });
    const signData = await signRes.json();
    if (!signRes.ok) throw new Error(signData?.error || 'Upload url olusturulamadi');

    const upload = await supabase.storage
      .from('spare-parts')
      .uploadToSignedUrl(signData.path, signData.token, file, { contentType: file.type });

    if (upload.error) {
      throw new Error(upload.error.message || 'Yukleme basarisiz');
    }

    return signData.publicUrl as string;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-3 text-xs text-[var(--admin-muted)]">
        JPG/PNG/WEBP onerilir. Yukleme dogrudan Supabase Storage (bucket: <span className="font-semibold">spare-parts</span>) icine yapilir.
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {hasSizeOptions ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminRadioCard active={uploadMode === 'gallery'} onClick={() => setUploadMode('gallery')}>
            Galeri gorseli yukle
          </AdminRadioCard>
          <AdminRadioCard active={uploadMode === 'size'} onClick={() => setUploadMode('size')}>
            Olcuye ozel gorsel yukle
          </AdminRadioCard>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[var(--admin-text)]">
              {uploadMode === 'size' && hasSizeOptions ? 'Olcu gorseli yukle' : 'Galeri gorseli yukle'}
            </div>
            <div className="mt-1 text-xs text-[var(--admin-muted)]">
              {uploadMode === 'size' && hasSizeOptions
                ? 'Yuklemeden once hangi olcu icin oldugunu sec. Ayni olcuye birden fazla gorsel ekleyebilirsin.'
                : 'Bu alana yuklenen gorseller urun galerisinde listelenir.'}
            </div>
          </div>

          {uploadMode === 'size' && hasSizeOptions ? (
            <select
              value={selectedSizeValue}
              onChange={(e) => setSelectedSizeValue(e.target.value)}
              className="min-w-[220px] rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-3 text-sm text-[var(--admin-text)]"
            >
              {sizeOptionEntries.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.value}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={uploadMode === 'size' ? sizeInputRef : galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              setError('');
              const list = Array.from(e.target.files || []);
              if (uploadMode === 'size') setSizeFiles(list);
              else setGalleryFiles(list);
            }}
            className="block w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--admin-card-muted)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--admin-text)] hover:file:bg-[var(--admin-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]"
          />

          <AdminButton
            type="button"
            disabled={
              uploadMode === 'size' && hasSizeOptions
                ? sizeFiles.length === 0 || isUploadingSize || !selectedSizeValue
                : galleryFiles.length === 0 || isUploadingGallery
            }
            onClick={async () => {
              setError('');

              try {
                if (uploadMode === 'size' && hasSizeOptions) {
                  if (sizeFiles.length === 0) return;
                  if (!selectedSizeValue) throw new Error('Olcu secimi gerekli');

                  setIsUploadingSize(true);
                  for (const file of sizeFiles) {
                    const publicUrl = await uploadFile(file);

                    const saveRes = await fetch(`/api/spare-parts/${sparePartId}/size-option-image`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ sizeValue: selectedSizeValue, url: publicUrl }),
                    });
                    const saveData = await saveRes.json();
                    if (!saveRes.ok) throw new Error(saveData?.error || 'Olcu gorseli kaydedilemedi');
                  }

                  setSizeFiles([]);
                  if (sizeInputRef.current) sizeInputRef.current.value = '';
                } else {
                  if (galleryFiles.length === 0) return;

                  setIsUploadingGallery(true);
                  await Promise.all(
                    galleryFiles.map(async (file) => {
                      const publicUrl = await uploadFile(file);
                      const saveRes = await fetch(`/api/spare-parts/${sparePartId}/image-url`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: publicUrl }),
                      });
                      const saveData = await saveRes.json();
                      if (!saveRes.ok) throw new Error(saveData?.error || 'Kaydedilemedi');
                    }),
                  );

                  setGalleryFiles([]);
                  if (galleryInputRef.current) galleryInputRef.current.value = '';
                }

                router.refresh();
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Yukleme basarisiz');
              } finally {
                setIsUploadingGallery(false);
                setIsUploadingSize(false);
              }
            }}
            className="px-6 py-3"
          >
            {uploadMode === 'size' && hasSizeOptions
              ? isUploadingSize
                ? 'Yukleniyor...'
                : sizeFiles.length > 1
                  ? `${sizeFiles.length} gorseli yukle`
                  : 'Olcu gorselini yukle'
              : isUploadingGallery
                ? 'Yukleniyor...'
                : 'Yukle'}
          </AdminButton>
        </div>
      </div>

      {hasSizeOptions ? (
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[var(--admin-text)]">Olcu gorselleri</div>
              <div className="mt-1 text-xs text-[var(--admin-muted)]">
                Her olcu icin birden fazla gorsel tutulur. Yeni yuklemeler eskisinin uzerine yazmaz.
              </div>
            </div>
            <AdminBadge tone="indigo">
              {sizeOptionEntries.reduce(
                (count, entry) =>
                  count + (entry.imageUrls?.length ? entry.imageUrls.length : entry.imageUrl ? 1 : 0),
                0,
              )}{' '}
              gorsel
            </AdminBadge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {sizeOptionEntries.map((entry) => (
              <div
                key={entry.value}
                className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-[var(--admin-text)]">{entry.value}</div>
                    <div className="mt-1 text-xs text-[var(--admin-muted)]">
                      {((entry.imageUrls?.length ?? 0) > 0 || entry.imageUrl) ? 'Bu olcuye gorseller baglandi' : 'Henuz gorsel secilmedi'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminButton
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUploadMode('size');
                        setSelectedSizeValue(entry.value);
                        sizeInputRef.current?.click();
                      }}
                    >
                      {((entry.imageUrls?.length ?? 0) > 0 || entry.imageUrl) ? 'Gorsel ekle' : 'Gorsel sec'}
                    </AdminButton>
                    {((entry.imageUrls?.length ?? 0) > 0 || entry.imageUrl) ? (
                      <AdminButton
                        type="button"
                        tone="rose"
                        variant="outline"
                        disabled={sizeDeletingValue === entry.value}
                        onClick={async () => {
                          setError('');
                          setSizeDeletingValue(entry.value);
                          try {
                            const res = await fetch(
                              `/api/spare-parts/${sparePartId}/size-option-image?sizeValue=${encodeURIComponent(entry.value)}`,
                              { method: 'DELETE' },
                            );
                            const data = await res.json();
                            if (!res.ok) throw new Error(data?.error || 'Olcu gorseli silinemedi');
                            router.refresh();
                          } catch (e: unknown) {
                            setError(e instanceof Error ? e.message : 'Olcu gorseli silinemedi');
                          } finally {
                            setSizeDeletingValue(null);
                          }
                        }}
                      >
                        {sizeDeletingValue === entry.value ? 'Siliniyor...' : 'Tumunu sil'}
                      </AdminButton>
                    ) : null}
                  </div>
                </div>

                {(() => {
                  const imageUrls = entry.imageUrls?.length ? entry.imageUrls : entry.imageUrl ? [entry.imageUrl] : [];

                  if (imageUrls.length === 0) {
                    return (
                      <div className="flex h-40 items-center justify-center border-t border-[var(--admin-border)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                        Gorsel yok
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-2 border-t border-[var(--admin-border)] p-3 sm:grid-cols-3">
                      {imageUrls.map((url, index) => (
                        <div key={`${entry.value}-${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`${entry.value} gorseli ${index + 1}`} className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            disabled={sizeDeletingValue === `${entry.value}-${url}`}
                            onClick={async () => {
                              setError('');
                              setSizeDeletingValue(`${entry.value}-${url}`);
                              try {
                                const res = await fetch(
                                  `/api/spare-parts/${sparePartId}/size-option-image?sizeValue=${encodeURIComponent(entry.value)}&url=${encodeURIComponent(url)}`,
                                  { method: 'DELETE' },
                                );
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error || 'Olcu gorseli silinemedi');
                                router.refresh();
                              } catch (e: unknown) {
                                setError(e instanceof Error ? e.message : 'Olcu gorseli silinemedi');
                              } finally {
                                setSizeDeletingValue(null);
                              }
                            }}
                            className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-60"
                          >
                            {sizeDeletingValue === `${entry.value}-${url}` ? 'Sil...' : 'Sil'}
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Urun gorseli" className="h-28 w-full object-cover" />
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
                    if (!res.ok) throw new Error(data?.error || 'Silme basarisiz');
                    router.refresh();
                  } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : 'Silme basarisiz');
                  } finally {
                    setDeletingId(null);
                  }
                }}
                className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-black/80 disabled:opacity-60"
              >
                {deletingId === img.id ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
