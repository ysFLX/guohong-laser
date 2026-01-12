'use client';

import { useState } from 'react';

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
    <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
      <div className="text-sm font-semibold text-gray-900 dark:text-white">Admin Yanit (tek yonlu)</div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
        Kullanici bu alana cevap yazamaz. Ornek: &quot;Daha fazla bilgi icin ... numaradan arayin&quot;.
      </div>

      {error && <div className="mt-3 form-alert form-alert--error">{error}</div>}
      {success && <div className="mt-3 form-alert form-alert--success">{success}</div>}
      {!canReply && (
        <div className="mt-3 text-sm text-amber-700">
          E-posta bilgisi yok. Yanit gonderilemez.
        </div>
      )}

      <textarea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!canReply}
        className="mt-3 form-input text-sm disabled:opacity-60"
        placeholder="Yanit metni..."
      />

      <div className="mt-3 flex gap-3">
        <button
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
              setSuccess('Yanit kaydedildi');
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Kaydedilemedi');
            } finally {
              setIsSaving(false);
            }
          }}
          className="btn-primary"
        >
          {isSaving ? 'Kaydediliyor...' : 'Yaniti Kaydet'}
        </button>
      </div>
    </div>
  );
}
