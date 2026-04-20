'use client';

import { useEffect, useRef, useState } from 'react';

import { AdminButton } from '@/components/admin/AdminUi';
import { getLatestInquiryAdminResponse } from '@/lib/inquiryAdminResponses';

export default function InquiryReplyBox({
  inquiryId,
  existingResponse,
  canReply = true,
  onSaved,
}: {
  inquiryId: string;
  existingResponse: string | null;
  canReply?: boolean;
  onSaved?: (updated: { adminResponse: string | null; respondedAt: string | null; status: 'READ' }) => void;
}) {
  const [value, setValue] = useState(getLatestInquiryAdminResponse(existingResponse) || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const typingPingAtRef = useRef(0);

  useEffect(() => {
    setValue(getLatestInquiryAdminResponse(existingResponse) || '');
  }, [existingResponse]);

  async function pingTyping() {
    const now = Date.now();
    if (now - typingPingAtRef.current < 2500) return;
    typingPingAtRef.current = now;

    try {
      await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      });
    } catch {
      // no-op
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 shadow-sm">
      <div className="text-sm font-semibold text-[var(--admin-text)]">Admin yanıtı</div>
      <div className="mt-1 text-xs text-[var(--admin-muted)]">
        Kullanıcı bu alana cevap yazamaz. Örnek: &quot;Daha fazla bilgi için ... numaradan arayın&quot;.
      </div>

      {error && <div className="mt-3 form-alert form-alert--error">{error}</div>}
      {success && <div className="mt-3 form-alert form-alert--success">{success}</div>}
      {!canReply && <div className="mt-3 text-sm text-amber-700">E-posta bilgisi yok. Yanıt gönderilemez.</div>}

      <textarea
        rows={4}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          if (!canReply) return;
          if (!next.trim()) return;
          void pingTyping();
        }}
        disabled={!canReply}
        className="mt-3 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 disabled:opacity-60"
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
              const trimmed = value.trim();
              const res = await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminResponse: trimmed, status: 'READ' }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.error || 'Kaydedilemedi');
              const respondedAt = typeof data?.item?.respondedAt === 'string' ? data.item.respondedAt : null;
              const savedResponse = getLatestInquiryAdminResponse(
                typeof data?.item?.adminResponse === 'string' ? data.item.adminResponse : null,
              );
              onSaved?.({
                adminResponse: savedResponse,
                respondedAt,
                status: 'READ',
              });
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

