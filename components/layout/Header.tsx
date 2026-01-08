'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import ProfileDrawer from '@/components/profile/ProfileDrawer';

import { useCart } from '@/components/cart/CartProvider';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function Header() {
  const { status, data } = useSession();
  const [mounted, setMounted] = useState(false);
  const isAuthed = mounted && status === 'authenticated';
  const isAdmin = mounted && data?.user?.role === 'ADMIN';
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, itemCount } = useCart();
  const { open: openNotifications, unreadCount } = useNotifications();
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const avatarUrl = data?.user?.image;
  const [logoError, setLogoError] = useState(false);

  const logoSrc = theme === 'dark' ? '/images/logokoyu.png' : '/images/logoacik.png';

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const navClass = (href: string) => {
    const active = 'text-slate-900 dark:text-white border-teal-500';
    const idle = 'text-slate-500 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-white';
    return `relative px-1 pb-2 text-sm font-semibold uppercase tracking-[0.14em] border-b-2 transition ${isActive(href) ? active : idle}`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          <div className="flex items-center shrink-0">
            <Link href="/" className="group inline-flex items-center">
              <div className="flex items-center">
                {!logoError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoSrc}
                    alt="Guohong Lazer"
                    className="h-10 w-auto sm:h-12"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Guohong Lazer</span>
                )}
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex flex-1 justify-center" aria-label="Ana menu">
            <div className="flex items-center gap-8">
              <Link href="/" aria-current={isActive('/') ? 'page' : undefined} className={navClass('/')}>
                Ana Sayfa
              </Link>
              <Link href="/products" aria-current={isActive('/products') ? 'page' : undefined} className={navClass('/products')}>
                Makineler
              </Link>
              <Link
                href="/spare-parts"
                aria-current={isActive('/spare-parts') ? 'page' : undefined}
                className={navClass('/spare-parts')}
              >
                Yedek Parcalar
              </Link>
              <Link href="/gallery" aria-current={isActive('/gallery') ? 'page' : undefined} className={navClass('/gallery')}>
                Galeri
              </Link>
              <Link href="/about" aria-current={isActive('/about') ? 'page' : undefined} className={navClass('/about')}>
                Hakkimizda
              </Link>
              <Link href="/contact" aria-current={isActive('/contact') ? 'page' : undefined} className={navClass('/contact')}>
                Iletisim
              </Link>
            </div>
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:inline-flex relative items-center justify-center rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Tema degistir"
            >
              {theme === 'dark' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m8-9h1M3 12H2m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              )}
            </button>

            {isAuthed && (
              <>
                <button
                  type="button"
                  onClick={openNotifications}
                  className="relative inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-slate-800"
                  aria-label="Bildirimleri ac"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 01-6 0m6 0H9"
                    />
                  </svg>
                  {mounted && unreadCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                        isHome ? 'bg-teal-600' : 'bg-teal-600'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleCart}
                  className="relative inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-slate-800"
                  aria-label="Sepeti ac"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {mounted && itemCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                        isHome ? 'bg-teal-600' : 'bg-teal-600'
                      }`}
                    >
                      {itemCount}
                    </span>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:text-slate-700 hover:bg-white"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menuyu ac/kapat"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <div className="hidden sm:flex sm:items-center space-x-3">
              {!isAuthed && (
                <div className="relative group">
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white px-3 py-2 text-sm font-semibold rounded-md"
                  >
                    Giris Yap / Kayit Ol
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block group-focus-within:block z-50">
                    <div className="py-1">
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Giris Yap
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Kayit Ol
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {isAuthed && (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    aria-label="Profili ac"
                  >
                    <span className="sr-only">Profil</span>
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Profil fotografi" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </button>
                  {/* Cikis butonu artik profil cekmecesinde; header'dan kaldirildi */}
                </>
              )}
            </div>
          </div>
        </div>

        <ProfileDrawer isOpen={profileOpen} close={() => setProfileOpen(false)} />

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Tema: {theme === 'dark' ? 'Koyu' : 'Acik'}
              </button>

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/')
                    ? isHome
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/products')
                    ? isHome
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Makineler
              </Link>
              <Link
                href="/spare-parts"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/spare-parts')
                    ? isHome
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Yedek Parcalar
              </Link>
              <Link
                href="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/gallery')
                    ? isHome
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Galeri
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/about')
                    ? isHome
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Hakkimizda
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/contact')
                    ? isHome
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Iletisim
              </Link>

              <div className="my-2 border-t border-gray-200" />

              {!isAuthed && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Giris Yap
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm font-medium text-white rounded-md ${
                      isHome ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-600 hover:bg-teal-700'
                    }`}
                  >
                    Kayit Ol
                  </Link>
                </>
              )}

              {isAuthed && (
                <>
                  <Link
                    href="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Sepet
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Profil
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Cikis Yap
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}








