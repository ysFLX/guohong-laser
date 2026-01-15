import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex-1 lg:pl-72">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-600">
                  Guohong Admin
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Yonetim merkezi</h1>
                <p className="text-xs text-slate-500">Siparis, stok ve talepler tek panelde.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action="/admin/orders" method="get" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs sm:flex">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-400" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    name="q"
                    placeholder="Siparis/musteri ara"
                    className="w-40 bg-transparent text-xs text-slate-600 focus:outline-none"
                  />
                </form>
                <Link
                  href="/admin"
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/orders"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Siparisler
                </Link>
                <Link
                  href="/admin/returns"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Iadeler
                </Link>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.35)] sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

