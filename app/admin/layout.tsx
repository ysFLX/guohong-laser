import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        session.user.email ? { email: { equals: session.user.email, mode: 'insensitive' } } : undefined,
      ].filter(Boolean),
    },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-64 flex-col bg-slate-950 text-slate-100 border-r border-slate-800">
          <div className="px-6 py-6 border-b border-slate-800">
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">Admin LTE</div>
            <div className="mt-2 text-lg font-semibold">Guohong Panel</div>
            <p className="mt-2 text-xs text-slate-400">Operasyon, stok ve talepler</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Dashboard
            </Link>
            <Link
              href="/admin/spare-parts"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              Yedek Parcalar
            </Link>
            <Link
              href="/admin/inquiries/quotes"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              Teklifler
            </Link>
            <Link
              href="/admin/inquiries/contact"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-400" />
              Iletisim
            </Link>
          </nav>

          <div className="px-6 py-5 border-t border-slate-800">
            <div className="rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
              Admin girisi aktif. Islem kayitlari ve bildirimleri kontrol etmeyi unutma.
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="px-4 py-4 sm:px-6 lg:px-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Admin Panel</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sadece admin kullanicilar erisebilir.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/spare-parts"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Yedek Parcalar
                </Link>
                <Link
                  href="/admin/inquiries/quotes"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Teklifler
                </Link>
                <Link
                  href="/admin/inquiries/contact"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Iletisim
                </Link>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
