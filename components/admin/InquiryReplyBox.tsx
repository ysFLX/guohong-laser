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

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      {success && <div className="mt-3 text-sm text-green-700">{success}</div>}
      {!canReply && (
        <div className="mt-3 text-sm text-amber-700">
          Kullanicinin uyeligi bulunmamaktadir. Yanit gonderilemez.
        </div>
      )}

      <textarea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!canReply}
        className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white disabled:opacity-60"
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
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isSaving ? 'Kaydediliyor...' : 'Yaniti Kaydet'}
        </button>
      </div>
    </div>
  );
}
