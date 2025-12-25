'use client';

import { useMemo } from 'react';
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

export default function NotificationsDrawer() {
  const { isOpen, close, items, unreadCount, markSeen } = useNotifications();
  const { data } = useSession();
  const isAdmin = data?.user?.role === 'ADMIN';

  const title = useMemo(() => {
    if (unreadCount > 0) return `Bildirimler (${unreadCount})`;
    return 'Bildirimler';
  }, [unreadCount]);

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
              {isAdmin ? 'Yeni talepler' : 'Yanıtlar'}
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
                  ? 'Yeni iletişim / teklif talebi geldiğinde burada görünür.'
                  : 'İletişim veya teklif formu gönderdiğinde yanıtlar burada görünür.'}
              </div>
            </div>
          )}

          {items.map((x) => (
            <div key={x.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {x.type === 'QUOTE' ? 'Fiyat Teklifi' : 'İletişim'}
                    {x.product ? ` · ${x.product}` : ''}
                    {x.subject ? ` · ${x.subject}` : ''}
                  </div>

                  {isAdmin ? (
                    <>
                      <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                        {x.name || 'İsimsiz'}
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
                  Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

