'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import ProfileDrawer from '@/components/profile/ProfileDrawer';

import { useCart } from '@/components/cart/CartProvider';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function Header() {
  const { status, data } = useSession();
  const isAuthed = status === 'authenticated';
  const isAdmin = data?.user?.role === 'ADMIN';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, itemCount } = useCart();
  const { open: openNotifications, unreadCount } = useNotifications();
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const avatarUrl = data?.user?.image;

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link href="/" className="inline-flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    theme === "dark"
                      ? "https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/logokoyu.png"
                      : "https://bhicsl4oxabnqqnk.public.blob.vercel-storage.com/logoacik.png"
                  }
                  alt="Guohong Lazer"
                  className="h-8 w-auto sm:h-9"
                />
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Ana menu">
              <Link href="/" aria-current="page" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Ana Sayfa
              </Link>
              <Link href="/products" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Makineler
              </Link>
              <Link href="/spare-parts" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Yedek Parcalar
              </Link>
              <Link href="/gallery" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Galeri
              </Link>
              <Link href="/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Hakkimizda
              </Link>
              <Link href="/contact" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Iletisim
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:inline-flex relative items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    aria-label="Admin Panel"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4l7 4v4c0 4.418-3.582 8-8 8s-8-3.582-8-8V8l9-4z"
                      />
                    </svg>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={openNotifications}
                  className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleCart}
                  className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  aria-label="Sepeti ac"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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

            <div className="hidden sm:flex sm:items-center space-x-4 ml-auto">
              {!isAuthed && (
                <div className="relative group">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white px-3 py-2 text-sm font-medium rounded-md"
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
          <div className="sm:hidden border-t border-gray-200 py-2">
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
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Makineler
              </Link>
              <Link
                href="/spare-parts"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Yedek Parcalar
              </Link>
              <Link
                href="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Galeri
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Hakkimizda
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
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
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
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




