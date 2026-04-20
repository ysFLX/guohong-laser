import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?next=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] [--admin-bg:#f6f7ff] [--admin-surface:#ffffff] [--admin-surface-muted:#f6f7ff] [--admin-border:rgba(15,23,42,0.1)] [--admin-text:#0f172a] [--admin-muted:#475569] [--admin-accent:#4f46e5] [--admin-accent-contrast:#ffffff] [--admin-sidebar-bg:#ffffff] [--admin-sidebar-text:#0f172a] [--admin-sidebar-muted:#475569] [--admin-sidebar-hover:rgba(15,23,42,0.04)] [--admin-sidebar-active:rgba(79,70,229,0.14)] [--admin-sidebar-accent:#4f46e5] [--admin-sidebar-accent-text:#0f172a] [--admin-card:#ffffff] [--admin-card-muted:#f1f5ff] [--admin-shadow:0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-200/50 blur-[140px]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-indigo-100/80 blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_55%)]" />

      <div className="relative flex min-h-screen">
        <AdminSidebar />

        <div className="flex-1 lg:pl-72">
          <header className="sticky top-0 z-20 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/85 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--admin-muted)]">
                  Guohong Admin Paneli
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Yönetim Merkezi</h1>
                <p className="text-xs text-[var(--admin-muted)]">Sipariş, stok ve talepler tek panelde.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form
                  action="/admin/orders"
                  method="get"
                  className="hidden items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-2 text-xs sm:flex"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-[var(--admin-muted)]" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    name="q"
                    placeholder="Sipariş/müşteri ara"
                    className="w-44 bg-transparent text-xs text-[var(--admin-muted)] focus:outline-none"
                  />
                </form>
                <Link
                  href="/admin"
                  className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-semibold text-[var(--admin-accent-contrast)] shadow-[0_10px_30px_rgba(79,70,229,0.25)] hover:opacity-95"
                >
                  Anasayfa
                </Link>
                <Link
                  href="/admin/orders"
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-card-muted)]"
                >
                  Siparişler
                </Link>
                <Link
                  href="/admin/returns"
                  className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-card-muted)]"
                >
                  Ä°adeler
                </Link>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

