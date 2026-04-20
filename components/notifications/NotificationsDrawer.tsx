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
  const { isOpen, close, items, unreadCount, markSeen, refresh, clearLocal } = useNotifications();
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
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white/95 backdrop-blur dark:bg-slate-950/95 shadow-[0_24px_80px_rgba(15,23,42,0.28)] border-l border-slate-200/70 dark:border-slate-800/70 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Bildirimler
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isAdmin ? 'Yeni talepler' : 'Yanıtlar'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60"
              onClick={async () => {
                await fetch('/api/notifications/clear', { method: 'POST' });
                clearLocal();
                close();
              }}
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
              aria-label="Bildirimleri kapat"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-10">
              <div className="text-slate-900 dark:text-white font-semibold">Bildirim yok</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {isAdmin
                  ? 'Yeni iletişim / teklif talebi geldiğinde burada görünür.'
                  : 'Ä°letişim veya teklif formu gönderdikten sonra yanıtlar burada görünür.'}
              </div>
            </div>
          )}

          {items.map((x) => {
            const replyState = replyById[x.id] ?? { value: '', isSending: false, error: '', success: '' };
            const isOrderStatus = x.type === 'ORDER_STATUS';
            const isSystem = x.type === 'SYSTEM';
            const isLiveSupportContact =
              x.type === 'CONTACT' && /canl[ıi]\s*destek/i.test((x.subject || '').toLowerCase());
            const adminLink = isLiveSupportContact
              ? '/admin/live-support'
              : x.type === 'QUOTE'
                ? `/admin/inquiries/quotes#quote-${x.id}`
                : `/admin/inquiries/contact#contact-${x.id}`;

            return (
              <div
                key={x.id}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {isSystem
                        ? 'Sistem'
                        : isOrderStatus
                          ? 'Sipariş durumu'
                          : x.type === 'QUOTE'
                            ? 'Fiyat Teklifi'
                            : 'Ä°letişim'}
                      {!isOrderStatus && x.product ? ` - ${x.product}` : ''}
                      {!isOrderStatus && x.subject ? ` - ${x.subject}` : ''}
                    </div>

                    {isSystem ? (
                      <>
                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          {x.title || 'Bildirim'}
                        </div>
                        <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">
                          {x.message}
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span suppressHydrationWarning>{formatDateTr(x.createdAt || null)}</span>
                        </div>
                      </>
                    ) : isAdmin ? (
                      <>
                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          {x.name || 'Ä°simsiz'}
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          {x.email || ''}{x.phone ? ` - ${x.phone}` : ''}
                        </div>
                        {x.company && (
                          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Firma: {x.company}</div>
                        )}
                        <div className="mt-3 text-sm text-slate-900 dark:text-white whitespace-pre-line">
                          {x.message}
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span suppressHydrationWarning>{formatDateTr(x.createdAt || null)}</span>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Yanıtla</div>
                          <textarea
                            rows={3}
                            value={replyState.value}
                            onChange={(e) => setReplyState(x.id, { value: e.target.value })}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
                            placeholder="Kısa yanıt yaz..."
                          />
                          {replyState.error && <div className="mt-2 text-xs text-rose-600">{replyState.error}</div>}
                          {replyState.success && <div className="mt-2 text-xs text-indigo-600">{replyState.success}</div>}
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
                                    throw new Error(data?.error || 'Yanıt gönderilemedi');
                                  }
                                  setReplyState(x.id, { isSending: false, success: 'Yanıt gönderildi' });
                                  await refresh();
                                } catch (err: unknown) {
                                  setReplyState(x.id, {
                                    isSending: false,
                                    error: err instanceof Error ? err.message : 'Yanıt gönderilemedi',
                                  });
                                }
                              }}
                              className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                            >
                              {replyState.isSending ? 'Gönderiliyor...' : 'Yanıtı Gönder'}
                            </button>
                            <Link
                              href={adminLink}
                              onClick={close}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                            >
                              Panele Git
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : isOrderStatus ? (
                      <>
                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          {x.title || 'Sipariş durumu güncellendi'}
                        </div>
                        <div className="mt-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">
                          {x.message}
                        </div>
                        {x.orderId && (
                          <Link
                            href={`/profile/orders/${x.orderId}`}
                            onClick={close}
                            className="mt-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                          >
                            Siparişe git
                          </Link>
                        )}
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span suppressHydrationWarning>{formatDateTr(x.createdAt || null)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 text-sm text-slate-900 dark:text-white whitespace-pre-line">
                          {x.adminResponse}
                        </div>
                        <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                          Telefon: <span className="font-semibold">0536 831 67 87</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          Mail: <span className="font-semibold">guohonglazerinfo@gmail.com</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span suppressHydrationWarning>{formatDateTr(x.respondedAt)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:underline"
                    onClick={async () => {
                      await markSeen(x.id);
                    }}
                  >
                    Kaldır
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

