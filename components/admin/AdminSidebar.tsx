'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import type { ReactNode } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: 'Genel',
    items: [
      {
        href: '/admin',
        label: 'Anasayfa',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 21V9h6v12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: '/admin/orders',
        label: 'Siparişler',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 4h10l2 4H5l2-4z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 8h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: '/admin/returns',
        label: 'İadeler',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 7h9a4 4 0 014 4v6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 4l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 17h-9a4 4 0 01-4-4V7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 20l3-3-3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: '/admin/inquiries',
        label: 'Talepler',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4h16v12H7l-3 3V4z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Yedek Parça',
    items: [
      {
        href: '/admin/spare-parts',
        label: 'Urun Listesi',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: '/admin/spare-parts/new',
        label: 'Yeni Ürün',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: '/admin/spare-parts/categories',
        label: 'Kategoriler',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Talepler',
    items: [
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
        label: 'İletişim',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 10V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 16l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Site Ayarları',
    items: [
      {
        href: '/admin/site-config',
        label: 'Anasayfa Panelleri',
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.4 15a1.7 1.7 0 00.34 1.87l.04.04a2 2 0 01-2.83 2.83l-.04-.04A1.7 1.7 0 0015 19.4a1.7 1.7 0 00-1 .6 1.7 1.7 0 00-.33 1v.09a2 2 0 01-4 0v-.09a1.7 1.7 0 00-1.33-1.6 1.7 1.7 0 00-1.6.33l-.04.04a2 2 0 01-2.83-2.83l.04-.04A1.7 1.7 0 004.6 15a1.7 1.7 0 00-.6-1 1.7 1.7 0 00-1-.33h-.09a2 2 0 010-4h.09a1.7 1.7 0 001.6-1.33 1.7 1.7 0 00-.33-1.6l-.04-.04a2 2 0 012.83-2.83l.04.04A1.7 1.7 0 008.34 4.6a1.7 1.7 0 001-.6 1.7 1.7 0 00.33-1v-.09a2 2 0 014 0v.09a1.7 1.7 0 001.33 1.6 1.7 1.7 0 001.6-.33l.04-.04a2 2 0 012.83 2.83l-.04.04A1.7 1.7 0 0019.4 9c.1.33.15.66.15 1s-.05.67-.15 1z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-[var(--admin-border)] lg:bg-[var(--admin-sidebar-bg)]/95 lg:text-[var(--admin-sidebar-text)] lg:backdrop-blur">
      <div className="px-6 py-6 border-b border-[var(--admin-border)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--admin-sidebar-accent)] text-[var(--admin-accent-contrast)] shadow-[0_10px_30px_rgba(34,211,238,0.35)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 2l8 4v12l-8 4-8-4V6l8-4zm0 2.3L6 6.1v9.8l6 2.8 6-2.8V6.1L12 4.3z" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-sidebar-muted)]">Guohong Admin</div>
            <div className="text-lg font-semibold">Yönetim Merkezi</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--admin-sidebar-muted)]">Operasyon, stok ve taleplerin kurumsal kontrolü.</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--admin-sidebar-active)] text-sm font-semibold text-[var(--admin-sidebar-accent-text)]">
            A
          </div>
          <div>
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-xs text-[var(--admin-sidebar-muted)]">Sistem</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-center text-xs font-semibold text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-hover)]"
          >
            Siteye dön
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-xs font-semibold text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-hover)]"
          >
            Çıkış yap
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--admin-sidebar-muted)]">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                        ? 'bg-[var(--admin-sidebar-active)] text-[var(--admin-sidebar-accent-text)] shadow-[inset_3px_0_0_0_var(--admin-sidebar-accent)] ring-1 ring-[var(--admin-sidebar-accent)]/40'
                        : 'text-[var(--admin-sidebar-muted)] hover:bg-[var(--admin-sidebar-hover)] hover:text-[var(--admin-sidebar-text)]'
                    }`}
                  >
                    <span
                      className={`text-[var(--admin-sidebar-accent)] ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-[var(--admin-border)]">
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-3 text-xs text-[var(--admin-sidebar-muted)]">
          Admin girişi aktif. İşlem kayıtlarını güncel tut.
        </div>
        <div className="mt-3 flex flex-col gap-2 text-xs">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-hover)]"
          >
            Sipariş merkezine git
          </Link>
          <Link
            href="/admin/spare-parts/new"
            className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 text-[var(--admin-sidebar-text)] hover:bg-[var(--admin-sidebar-hover)]"
          >
            Yeni ürün ekle
          </Link>
        </div>
      </div>
    </aside>
  );
}
