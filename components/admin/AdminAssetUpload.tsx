'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
};

export default function AdminAssetUpload({ label, value, onChange, helper }: Props) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !anon) return null;
    return createClient(url, anon);
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isAdmin) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      {helper && <div className="text-xs text-slate-500">{helper}</div>}

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Panel görseli" className="h-32 w-full rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white"
          >
            Kaldır
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Henüz görsel eklenmedi.
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setError('');
            const selected = e.target.files?.[0] || null;
            setFile(selected);
          }}
          className="block w-full text-sm text-slate-700"
        />
        <button
          type="button"
          disabled={!file || isUploading}
          onClick={async () => {
            if (!file) return;
            setIsUploading(true);
            setError('');
            try {
              if (!supabase) {
                throw new Error('Supabase client hazır değil');
              }
              const signRes = await fetch('/api/admin/site-assets/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, contentType: file.type }),
              });
              const signData = await signRes.json();
              if (!signRes.ok) throw new Error(signData?.error || 'Upload url oluşturulamadı');

              const upload = await supabase.storage
                .from('spare-parts')
                .uploadToSignedUrl(signData.path, signData.token, file, { contentType: file.type });

              if (upload.error) {
                throw new Error(upload.error.message || 'Yükleme başarısız');
              }

              onChange(signData.publicUrl);
              setFile(null);
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Yükleme başarısız');
            } finally {
              setIsUploading(false);
            }
          }}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isUploading ? 'Yükleniyor...' : 'Görsel yükle'}
        </button>
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}

