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
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="text-lg font-bold text-gray-900 dark:text-white">Profil</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Hesap ayarlari ve oturum</div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="Profil fotografi" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'Kullanici'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/profile"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Hesap Ayarlari
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={close}
                className="block px-4 py-2 rounded-xl text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="/profile/orders"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Siparislerim
            </Link>

            <Link
              href="/profile/favorites"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Favorilerim
            </Link>

            <Link
              href="/profile/addresses"
              onClick={close}
              className="block px-4 py-2 rounded-xl text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Adreslerim
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cikis Yap
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
