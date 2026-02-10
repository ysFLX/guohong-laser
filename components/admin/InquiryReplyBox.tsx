'use client';

import { useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';

export default function InquiryReplyBox({
  inquiryId,
  existingResponse,
  canReply = true,
}: {
  inquiryId: string;
  existingResponse: string | null;
  canReply?: boolean;
}) {
  const [value, setValue] = useState(existingResponse || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">Admin yanıtı</div>
      <div className="mt-1 text-xs text-slate-500">
        Kullanıcı bu alana cevap yazamaz. Örnek: &quot;Daha fazla bilgi için ... numaradan arayın&quot;.
      </div>

      {error && <div className="mt-3 form-alert form-alert--error">{error}</div>}
      {success && <div className="mt-3 form-alert form-alert--success">{success}</div>}
      {!canReply && <div className="mt-3 text-sm text-amber-700">E-posta bilgisi yok. Yanıt gönderilemez.</div>}

      <textarea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!canReply}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60 disabled:opacity-60"
        placeholder="Yanıt metni..."
      />

      <div className="mt-3 flex gap-3">
        <AdminButton
          type="button"
          disabled={isSaving || !canReply}
          onClick={async () => {
            setIsSaving(true);
            setError('');
            setSuccess('');
            try {
              const res = await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminResponse: value, status: 'READ' }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi');
              setSuccess('Yanıt kaydedildi');
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Kaydedilemedi');
            } finally {
              setIsSaving(false);
            }
          }}
          className="px-5"
        >
          {isSaving ? 'Kaydediliyor...' : 'Yanıtı Kaydet'}
        </AdminButton>
      </div>
    </div>
  );
}
