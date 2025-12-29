'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

import { useNotifications } from './NotificationsProvider';

function formatDateTr(value: string | null) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
}

type ReplyState = {
  value: string;
  isSending: boolean;
  error: string;
  success: string;
};

export default function NotificationsDrawer() {
  const { isOpen, close, items, unreadCount, markSeen, refresh } = useNotifications();
  const { data } = useSession();
  const isAdmin = data?.user?.role === 'ADMIN';
  const [replyById, setReplyById] = useState<Record<string, ReplyState>>({});

  const title = useMemo(() => {
    if (unreadCount > 0) return `Bildirimler (${unreadCount})`;
    return 'Bildirimler';
  }, [unreadCount]);

  const setReplyState = (id: string, next: Partial<ReplyState>) => {
    setReplyById((prev) => ({
      ...prev,
      [id]: {
        value: prev[id]?.value ?? '',
        isSending: prev[id]?.isSending ?? false,
        error: prev[id]?.error ?? '',
        success: prev[id]?.success ?? '',
        ...next,
      },
    }));
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{title}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? 'Yeni talepler' : 'Yanýtlar'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={async () => {
                await fetch('/api/notifications/clear', { method: 'POST' });
                close();
              }}
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={close}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Bildirimleri kapat"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-10">
              <div className="text-gray-900 dark:text-white font-semibold">Bildirim yok</div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {isAdmin
                  ? 'Yeni iletiþim / teklif talebi geldiðinde burada görünür.'
                  : 'Ýletiþim veya teklif formu gönderdiðinde yanýtlar burada görünür.'}
              </div>
            </div>
          )}

          {items.map((x) => {
            const replyState = replyById[x.id] ?? { value: '', isSending: false, error: '', success: '' };
            const adminLink = x.type === 'QUOTE' ? `/admin/inquiries/quotes#${x.id}` : `/admin/inquiries/contact#${x.id}`;

            return (
              <div key={x.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {x.type === 'QUOTE' ? 'Fiyat Teklifi' : 'Ýletiþim'}
                      {x.product ? ` · ${x.product}` : ''}
                      {x.subject ? ` · ${x.subject}` : ''}
                    </div>

                    {isAdmin ? (
                      <>
                        <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                          {x.name || 'Ýsimsiz'}
                        </div>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          {x.email || ''}{x.phone ? ` · ${x.phone}` : ''}
                        </div>
                        {x.company && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Firma: {x.company}</div>
                        )}
                        <div className="mt-3 text-sm text-gray-900 dark:text-white whitespace-pre-line">
                          {x.message}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400"><span suppressHydrationWarning>{formatDateTr(x.createdAt || null)}</span></div>
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Yanýtla</div>
                          <textarea
                            rows={3}
                            value={replyState.value}
                            onChange={(e) => setReplyState(x.id, { value: e.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
                            placeholder="Kýsa yanýt yaz..."
                          />
                          {replyState.error && <div className="mt-2 text-xs text-red-600">{replyState.error}</div>}
                          {replyState.success && <div className="mt-2 text-xs text-emerald-600">{replyState.success}</div>}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={replyState.isSending}
                              onClick={async () => {
                                setReplyState(x.id, { isSending: true, error: '', success: '' });
                                try {
                                  const res = await fetch(`/api/admin/inquiries/${x.id}/reply`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ adminResponse: replyState.value, status: 'READ' }),
                                  });
                                  const data = await res.json().catch(() => ({}));
                                  if (!res.ok) {
                                    throw new Error(data?.error || 'Yanýt gönderilemedi');
                                  }
                                  setReplyState(x.id, { isSending: false, success: 'Yanýt gönderildi' });
                                  await refresh();
                                } catch (err: unknown) {
                                  setReplyState(x.id, {
                                    isSending: false,
                                    error: err instanceof Error ? err.message : 'Yanýt gönderilemedi',
                                  });
                                }
                              }}
                              className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                            >
                              {replyState.isSending ? 'Gönderiliyor...' : 'Yanýtý Gönder'}
                            </button>
                            <Link
                              href={adminLink}
                              onClick={close}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Panele Git
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 text-sm text-gray-900 dark:text-white whitespace-pre-line">
                          {x.adminResponse}
                        </div>
                        <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                          Telefon: <span className="font-semibold">0536 831 67 87</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                          Mail: <span className="font-semibold">guohonglazerinfo@gmail.com</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400"><span suppressHydrationWarning>{formatDateTr(x.respondedAt)}</span></div>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:underline"
                    onClick={async () => {
                      await markSeen(x.id);
                    }}
                  >
                    Kaldýr
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
