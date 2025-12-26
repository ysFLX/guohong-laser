'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function ProfileDrawer({ isOpen, close }: { isOpen: boolean; close: () => void }) {
  const { data } = useSession();
  const user = data?.user;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="text-lg font-bold text-slate-900 dark:text-white">Profil</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Hesap ayarları ve oturum</div>
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

