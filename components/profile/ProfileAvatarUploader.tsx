"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";

type Props = {
  imageUrl?: string | null;
  onUpdated?: (url: string) => void;
};

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

export default function ProfileAvatarUploader({ imageUrl, onUpdated }: Props) {
  const router = useRouter();
  const { update } = useSession();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!url || !anon) return null;
    return createClient(url, anon);
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setError("");
    setIsUploading(true);
    try {
      if (!supabase) {
        throw new Error("Supabase client hazır değil");
      }

      const signRes = await fetch("/api/profile/avatar/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData?.error || "Upload url oluşturulamadı");

      const upload = await supabase.storage
        .from("profile-avatars")
        .uploadToSignedUrl(signData.path, signData.token, file, { contentType: file.type });

      if (upload.error) {
        throw new Error(upload.error.message || "Yükleme başarısız");
      }

      const saveRes = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: signData.publicUrl }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData?.error || "Kaydedilemedi");

      setFile(null);
      onUpdated?.(signData.publicUrl);
      await update?.();
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-4 bg-white">
      <div className="text-sm font-semibold text-gray-900">Profil Fotoğrafı</div>
      <div className="mt-1 text-xs text-gray-500">JPEG/PNG/WEBP önerilir.</div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Profil fotografi" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs">Yok</span>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setError("");
              if (selected && (!SUPPORTED_IMAGE_TYPES.has(selected.type) || selected.size > MAX_AVATAR_BYTES)) {
                setFile(null);
                setError("Sadece JPG, PNG veya WEBP ve en fazla 4 MB görsel yükle.");
                return;
              }
              setFile(selected);
            }}
            className="block w-full text-sm text-gray-700"
          />
        </div>
        <button
          type="button"
          disabled={!file || isUploading}
          onClick={handleUpload}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isUploading ? "Yükleniyor..." : "Yukle"}
        </button>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
    </div>
  );
}

