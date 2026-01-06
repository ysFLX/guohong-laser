'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: JSX.Element;
};

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V9h6v12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/spare-parts',
    label: 'Yedek Parcalar',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/orders',
    label: 'Siparisler',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M7 4h10l2 4H5l2-4z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 8h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/inquiries#quotes',
    label: 'Teklifler',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 4h16v12H7l-3 3V4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/inquiries#contact',
    label: 'Iletisim',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M21 10V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 16l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-slate-900 lg:text-slate-100 lg:shadow-xl">
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="text-xs uppercase tracking-[0.3em] text-teal-300">Admin LTE</div>
        <div className="mt-2 text-lg font-semibold">Guohong Panel</div>
        <p className="mt-2 text-xs text-slate-400">Operasyon, stok ve talepler</p>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-sm font-semibold text-slate-900">
            A
          </div>
          <div>
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-xs text-slate-400">Sistem</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-slate-800 text-white shadow-[inset_3px_0_0_0_rgba(20,184,166,1)]'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <span className={`text-teal-300 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-slate-800">
        <div className="rounded-lg bg-slate-950/70 p-3 text-xs text-slate-400">
          Admin girisi aktif. Islem kayitlarini guncel tut.
        </div>
      </div>
    </aside>
  );
}
