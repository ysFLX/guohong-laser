'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileDrawer({ isOpen, close }: { isOpen: boolean; close: () => void }) {
  const { data } = useSession();
  const user = data?.user;
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      close();
    }
  }, [pathname, isOpen, close]);

  return (
    <div
      className={`fixed inset-0 z-[80] ${isOpen ? '' : 'pointer-events-none hidden'}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white/95 dark:bg-slate-950 shadow-2xl border-l border-slate-200/80 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-4 p-4 border-b border-slate-200/70 dark:border-slate-800">
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">Profil</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Hesap ayarları ve oturum</div>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
            aria-label="Profili kapat"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="Profil fotografi" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || 'Kullanıcı'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/profile"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hesap Ayarları
            </Link>

            <Link
              href="/profile/orders"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Siparişlerim
            </Link>

            <Link
              href="/profile/favorites"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Favorilerim
            </Link>

            <Link
              href="/profile/addresses"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Adreslerim
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}


