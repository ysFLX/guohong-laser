'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ProfileLayout({
  children,
  side,
  showSide = true,
}: {
  children: ReactNode;
  side?: ReactNode;
  showSide?: boolean;
}) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initial = mounted
    ? (session?.user?.name?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()
    : 'U';
  const emailLine = mounted
    ? `${session?.user?.email ?? ''}${session?.user?.role === 'ADMIN' ? ' - Admin' : ''}`
    : '';

  return (
    <div className="min-h-screen space-y-12">
      <div className="rounded-[32px] bg-slate-950 px-6 py-10 text-white shadow-2xl sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-400 text-slate-900 flex items-center justify-center font-semibold">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Hesabim</h1>
              <div className="mt-1 text-sm text-white/70" suppressHydrationWarning>
                {emailLine}
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/60"
          >
            Profil sayfasi
          </Link>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${showSide ? 'lg:grid-cols-[1fr_320px]' : ''} gap-6`}>
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          {children}
        </div>

        {showSide && (
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            {side ?? (
              <>
                <div className="text-sm font-semibold text-slate-900">Adres</div>
                <div className="mt-1 text-sm text-slate-600">Adreslerini yonetmek icin tikla</div>
                <div className="mt-4">
                  <Link
                    href="/profile/addresses"
                    className="inline-flex items-center justify-center rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-orange-500"
                  >
                    Adreslerim
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

