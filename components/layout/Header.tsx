'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import ProfileDrawer from '@/components/profile/ProfileDrawer';

import { useCart } from '@/components/cart/CartProvider';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import { useTheme } from '@/components/theme/ThemeProvider';

const NAV_ITEMS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/products', label: 'Makineler' },
  { href: '/spare-parts', label: 'Yedek Parçalar' },
  { href: '/gallery', label: 'Galeri' },
  { href: '/about', label: 'Hakkımızda' },
  { href: '/contact', label: 'İletişim' },
] as const;

const WHATSAPP_NUMBER = '905368316787';

function buildWhatsAppHref(pageUrl?: string) {
  const message = pageUrl
    ? `Merhaba, Guohong Lazer sitesinden yazıyorum. Şu sayfa hakkında bilgi almak istiyorum:\n${pageUrl}`
    : 'Merhaba, Guohong Lazer sitesinden yazıyorum. Bilgi almak istiyorum.';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function Header() {
  const { status, data } = useSession();
  const pathname = usePathname();
  const { toggleCart, itemCount } = useCart();
  const { open: openNotifications, unreadCount } = useNotifications();
  const { theme, toggle: toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginHref, setLoginHref] = useState('/login');
  const [registerHref, setRegisterHref] = useState('/register');
  const [whatsAppHref, setWhatsAppHref] = useState(buildWhatsAppHref());

  const isAuthed = mounted && status === 'authenticated';
  const isAdmin = mounted && data?.user?.role === 'ADMIN';
  const avatarUrl = data?.user?.image;
  const logoSrc = theme === 'dark' ? '/images/logokoyu.png' : '/images/logoacik.png';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const next =
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}${window.location.hash}`
        : pathname || '/';
    const nextEncoded = encodeURIComponent(next || '/');
    setLoginHref(`/login?next=${nextEncoded}`);
    setRegisterHref(`/register?next=${nextEncoded}`);

    const pageUrl = typeof window !== 'undefined' ? window.location.href : pathname ? `${pathname}` : undefined;
    setWhatsAppHref(buildWhatsAppHref(pageUrl));
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const desktopLinkClass = (href: string) => {
    const active = 'text-slate-900 dark:text-white';
    const idle = 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white';
    return `relative text-xs font-semibold uppercase tracking-[0.18em] transition ${
      isActive(href) ? active : idle
    }`;
  };

  const mobileLinkClass = (href: string) => {
    const active = 'bg-indigo-600 text-white';
    const idle = 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60';
    return `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
      isActive(href) ? active : idle
    }`;
  };

  const cartBadge = useMemo(() => {
    if (!mounted || itemCount <= 0) return null;
    return (
      <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white">
        {itemCount}
      </span>
    );
  }, [mounted, itemCount]);

  const notificationsBadge = useMemo(() => {
    if (!mounted || unreadCount <= 0) return null;
    return (
      <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white">
        {unreadCount}
      </span>
    );
  }, [mounted, unreadCount]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/60">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-indigo-200/60 blur-[140px] dark:bg-indigo-500/15" />
        <div className="absolute -right-24 top-8 h-56 w-56 rounded-full bg-indigo-100/80 blur-[160px] dark:bg-indigo-500/10" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20 bg-[linear-gradient(90deg,_rgba(15,23,42,0.06)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(15,23,42,0.06)_1px,_transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3">
            {!logoError ? (
              <Image
                src={logoSrc}
                alt="Guohong Lazer"
                width={180}
                height={48}
                sizes="(max-width: 640px) 160px, 180px"
                priority
                className="h-10 w-auto sm:h-12"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                Guohong Lazer
              </span>
            )}
          </Link>

          <nav className="hidden lg:flex flex-1 justify-center" aria-label="Ana menü">
            <div className="flex items-center gap-7 rounded-full border border-slate-200/70 bg-white/70 px-6 py-2 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/50">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={desktopLinkClass(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/quote"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_40px_rgba(79,70,229,0.28)] transition hover:bg-indigo-700"
            >
              Teklif Al
            </Link>

            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="hidden xl:inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:bg-slate-900/50"
            >
              WhatsApp
            </a>

            <button
              type="button"
              onClick={toggleTheme}
              className="hidden sm:inline-flex relative items-center justify-center rounded-full border border-slate-200 bg-white/50 p-2 text-slate-600 transition hover:bg-white hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300 dark:hover:bg-slate-900/50 dark:hover:text-white"
              aria-label="Tema değiştir"
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m8-9h1M3 12H2m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <button
                type="button"
                onClick={openNotifications}
                className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/50 dark:hover:text-white"
                aria-label="Bildirimleri aç"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificationsBadge}
              </button>
            )}

            <button
              type="button"
              onClick={toggleCart}
              className="relative inline-flex items-center justify-center rounded-full border border-transparent bg-transparent p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/50 dark:hover:text-white"
              aria-label="Sepeti aç"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartBadge}
            </button>

            {isAuthed ? (
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/50 p-1.5 text-slate-500 transition hover:bg-white dark:border-slate-800 dark:bg-slate-950/30 dark:hover:bg-slate-900/50"
                aria-label="Profil"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Profil fotoğrafı" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href={loginHref}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-white dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/50"
                >
                  Giriş
                </Link>
                <Link
                  href={registerHref}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Kayıt
                </Link>
              </div>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 transition hover:border-indigo-300 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-200"
              >
                Admin
              </Link>
            )}

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/50 p-2 text-slate-700 transition hover:bg-white dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/50"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menüyü aç"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ProfileDrawer isOpen={profileOpen} close={() => setProfileOpen(false)} />

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-label="Mobil menü"
            className="absolute right-0 top-0 h-full w-[min(92vw,420px)] overflow-hidden border-l border-slate-200 bg-white/95 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-300">
                  Menü
                </div>
                <div className="mt-1 text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                  Guohong Lazer
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                aria-label="Menüyü kapat"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="grid gap-4 px-5 py-5">
              <div className="grid gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={mobileLinkClass(item.href)}
                  >
                    <span>{item.label}</span>
                    <span className={isActive(item.href) ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}>
                      →
                    </span>
                  </Link>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
                  Hızlı işlemler
                </div>
                <div className="mt-3 grid gap-2">
                  <Link
                    href="/quote"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Teklif Al
                  </Link>
                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                  >
                    WhatsApp hattı
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                      setMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                  >
                    Tema: {theme === 'dark' ? 'Koyu' : 'Açık'}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    toggleCart();
                  }}
                  className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                >
                  <span>Sepet</span>
                  <span className="text-slate-400 dark:text-slate-500">{mounted && itemCount > 0 ? itemCount : ''}</span>
                </button>

                {isAuthed && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openNotifications();
                    }}
                    className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                  >
                    <span>Bildirimler</span>
                    <span className="text-slate-400 dark:text-slate-500">{mounted && unreadCount > 0 ? unreadCount : ''}</span>
                  </button>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-200"
                  >
                    <span>Admin Paneli</span>
                    <span>→</span>
                  </Link>
                )}
              </div>

              {!isAuthed ? (
                <div className="grid gap-2">
                  <Link
                    href={loginHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href={registerHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              ) : (
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileOpen(true);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
                  >
                    Profili Aç
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
