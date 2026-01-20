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
    <div className="relative min-h-screen overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)] [--admin-bg:#0b1120] [--admin-surface:#0f172a] [--admin-surface-muted:#111827] [--admin-border:rgba(148,163,184,0.2)] [--admin-text:#e2e8f0] [--admin-muted:#94a3b8] [--admin-accent:#22d3ee] [--admin-accent-contrast:#081018] [--admin-sidebar-bg:#0b1120] [--admin-sidebar-text:#e2e8f0] [--admin-sidebar-muted:#94a3b8] [--admin-sidebar-hover:rgba(30,41,59,0.6)] [--admin-sidebar-active:rgba(34,211,238,0.14)] [--admin-sidebar-accent:#22d3ee] [--admin-sidebar-accent-text:#e2e8f0] [--admin-card:#0f172a] [--admin-card-muted:#0b1220]">
      <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-teal-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_45%)]" />

      <div className="relative flex min-h-screen">
        <AdminSidebar />

        <div className="flex-1 lg:pl-72">
          <header className="sticky top-0 z-20 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/90 backdrop-blur">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">
                  Guohong Admin
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Yonetim merkezi</h1>
                <p className="text-xs text-[var(--admin-muted)]">Siparis, stok ve talepler tek panelde.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action="/admin/orders" method="get" className="hidden items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-2 text-xs sm:flex">
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-[var(--admin-muted)]" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    name="q"
                    placeholder="Siparis/musteri ara"
                    className="w-44 bg-transparent text-xs text-[var(--admin-muted)] focus:outline-none"
                  />
                </form>
                <Link
                  href="/admin"
                  className="rounded-full bg-[var(--admin-accent)] px-4 py-2 text-xs font-semibold text-[var(--admin-accent-contrast)] shadow-[0_10px_30px_rgba(34,211,238,0.25)] hover:opacity-90"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/orders"
                  className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-card-muted)]"
                >
                  Siparisler
                </Link>
                <Link
                  href="/admin/returns"
                  className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-card-muted)]"
                >
                  Iadeler
                </Link>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
              <div className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-card)]/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.35)] sm:p-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

