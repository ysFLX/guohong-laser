'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ProfileDrawer({ isOpen, close }: { isOpen: boolean; close: () => void }) {
  const { data } = useSession();
  const user = data?.user;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[70] ${isOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white/95 backdrop-blur dark:bg-slate-950/95 shadow-[0_24px_80px_rgba(15,23,42,0.28)] border-l border-slate-200/70 dark:border-slate-800/70 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Profil
              </div>
              <div className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                Hesap ayarları ve oturum
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
              aria-label="Profili kapat"
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

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="Profil fotoğrafı" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Kullanıcı'}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/profile"
              onClick={close}
              className="block px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60"
            >
              Hesap Ayarları
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={close}
                className="block px-4 py-3 rounded-2xl text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:border-indigo-300 dark:text-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-400/30"
              >
                Admin Paneli
              </Link>
            )}

            <Link
              href="/profile/orders"
              onClick={close}
              className="block px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60"
            >
              Siparişlerim
            </Link>

            <Link
              href="/profile/favorites"
              onClick={close}
              className="block px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60"
            >
              Favorilerim
            </Link>

            <Link
              href="/profile/addresses"
              onClick={close}
              className="block px-4 py-3 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60"
            >
              Adreslerim
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

