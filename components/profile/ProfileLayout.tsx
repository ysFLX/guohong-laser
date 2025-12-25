'use client';

import { ReactNode } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                  {(session?.user?.name?.[0] || (session?.user?.email ?? 'U')[0]).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hesabim</h1>
                  <div className="mt-1 text-sm text-gray-600">
                    {session?.user?.email ?? ''}
                    {session?.user?.role === 'ADMIN' ? ' - Admin' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${showSide ? 'lg:grid-cols-3' : ''} gap-6`}>
            <div className={`${showSide ? 'lg:col-span-2' : ''} bg-white rounded-xl shadow-sm border border-gray-100 p-6`}>
              {children}
            </div>

            {showSide && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {side ?? (
                  <>
                    <div className="text-sm font-semibold text-gray-900">Adres</div>
                    <div className="mt-1 text-sm text-gray-500">Adreslerini yonetmek icin tikla</div>
                    <div className="mt-4">
                      <Link href="/profile/addresses" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Adreslerim
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

