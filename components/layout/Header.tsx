'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import ProfileDrawer from '@/components/profile/ProfileDrawer';
import { useCart } from '@/components/cart/CartProvider';
import { useNotifications } from '@/components/notifications/NotificationsProvider';
import { useTheme } from '@/components/theme/ThemeProvider';

type NavChild = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  children?: NavChild[];
};

const PRIMARY_NAV: NavItem[] = [
  { href: '/about', label: 'Hakkımızda' },
  {
    href: '/products',
    label: 'Ürünler',
    children: [
      { href: '/products', label: 'Plaka Lazer Kesim Makinesi' },
      { href: '/products', label: 'Tüp Lazer Kesim Makinesi' },
      { href: '/products', label: 'Plaka ve Boru Lazer Kesim Makinesi' },
      { href: '/products', label: 'Tüp Otomatik Beslemeli Lazer Kesim Makinesi' },
      { href: '/products', label: 'El Tipi Lazer Kaynak Makinesi' },
      { href: '/products', label: 'Lazer Temizleme Makinesi' },
    ],
  },
  {
    href: '/contact',
    label: 'Hizmet',
    children: [
      { href: '/contact?subject=Teknik+Destek', label: 'Teknik Destek' },
      { href: '/quote', label: 'Başvuru' },
      { href: '/gallery', label: 'Müşteri Davası' },
      { href: '/faq', label: 'SSS' },
    ],
  },
  { href: '/gallery', label: 'Haberler' },
  { href: '/contact', label: 'Bize Ulaşın' },
] ;

const MOBILE_LINKS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/about', label: 'Hakkımızda' },
  { href: '/products', label: 'Ürünler' },
  { href: '/spare-parts', label: 'Yedek Parçalar' },
  { href: '/gallery', label: 'Galeri' },
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
  const pathname = usePathname();
  const { status, data } = useSession();
  const { toggleCart, itemCount } = useCart();
  const { open: openNotifications, unreadCount } = useNotifications();
  const { theme, toggle: toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [whatsAppHref, setWhatsAppHref] = useState(buildWhatsAppHref());
  const [loginHref, setLoginHref] = useState('/login');
  const [registerHref, setRegisterHref] = useState('/register');
  const mobileMenuRef = useRef<HTMLElement | null>(null);

  const isAuthed = mounted && status === 'authenticated';
  const isAdmin = mounted && data?.user?.role === 'ADMIN';
  const avatarUrl = data?.user?.image;

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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    mobileMenuRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const cartBadge = useMemo(() => {
    if (!mounted || itemCount <= 0) return null;
    return (
      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#15327f] px-1 text-[11px] font-bold text-white">
        {itemCount}
      </span>
    );
  }, [itemCount, mounted]);

  const notificationsBadge = useMemo(() => {
    if (!mounted || unreadCount <= 0) return null;
    return (
      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#15327f] px-1 text-[11px] font-bold text-white">
        {unreadCount}
      </span>
    );
  }, [mounted, unreadCount]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-white/95 text-[#333333] shadow-[0_10px_30px_rgba(21,50,127,0.08)] backdrop-blur-xl">
      <div className="border-b border-[#15327f]/10 bg-[#15327f]">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-white/82 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <a href="mailto:sales@guohonglaser.com" className="transition hover:text-[#ff6a0d]">
              E-posta: sales@guohonglaser.com
            </a>
            <a href={whatsAppHref} target="_blank" rel="noreferrer" className="transition hover:text-[#ff6a0d]">
              Whatsapp: +90 536 831 67 87
            </a>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <span>Turkish</span>
            <span className="text-white/35">|</span>
            <span className="text-white/55">English</span>
            <span className="text-white/55">Russian</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[92px] items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/images/logokoyu-crop.png" alt="Guohong Lazer" width={220} height={90} priority className="h-[58px] w-auto sm:h-[64px]" />
          </Link>

          <nav className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-[#15327f]/12 bg-[#f7f9ff] px-2 py-2">
              {PRIMARY_NAV.map((item) => (
                <div key={item.label} className="group relative">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      isActive(item.href) ? 'bg-[#15327f] text-white' : 'text-[#333333]/78 hover:bg-[#15327f]/6 hover:text-[#15327f]'
                    }`}
                  >
                    {item.label}
                    {item.children ? (
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                  </Link>

                  {item.children ? (
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-[340px] -translate-x-1/2 pt-4 group-hover:block group-hover:pointer-events-auto">
                      <div className="rounded-[28px] border border-[#15327f]/12 bg-white p-4 shadow-[0_22px_44px_rgba(21,50,127,0.12)]">
                        <div className="grid gap-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="rounded-2xl px-4 py-3 text-sm font-medium text-[#333333]/74 transition hover:bg-[#f7f9ff] hover:text-[#15327f]"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-[#15327f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2260]">
              Teklif Al
            </Link>
            <Link href="/spare-parts" className="inline-flex items-center justify-center rounded-full border border-[#15327f]/12 px-5 py-3 text-sm font-semibold text-[#15327f] transition hover:bg-[#15327f]/6 hover:text-[#15327f]">
              Yedek Parçalar
            </Link>

            <button type="button" onClick={toggleTheme} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#15327f]/12 bg-white text-[#15327f] transition hover:bg-[#15327f]/6 hover:text-[#15327f]" aria-label="Tema değiştir">
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8-9h1M3 12H2m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
              )}
            </button>

            {isAuthed ? (
              <>
                <button type="button" onClick={openNotifications} className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#15327f]/12 bg-white text-[#15327f] transition hover:bg-[#15327f]/6 hover:text-[#15327f]" aria-label="Bildirimleri aç">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {notificationsBadge}
                </button>
                <button type="button" onClick={toggleCart} className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#15327f]/12 bg-white text-[#15327f] transition hover:bg-[#15327f]/6 hover:text-[#15327f]" aria-label="Sepeti aç">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  {cartBadge}
                </button>
                <button type="button" onClick={() => setProfileOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-[#15327f]/12 bg-[#f7f9ff] px-2 py-2 text-sm font-semibold text-white transition hover:bg-white/8" aria-label="Profili aç">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Profil fotoğrafı" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">G</span>
                  )}
                  <span className="pr-2">Profil</span>
                </button>
              </>
            ) : (
              <>
                <Link href={loginHref} className="inline-flex items-center justify-center rounded-full border border-white/12 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/8 hover:text-white">
                  Giriş
                </Link>
                <Link href={registerHref} className="inline-flex items-center justify-center rounded-full border border-white/12 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/8 hover:text-white">
                  Kayıt
                </Link>
              </>
            )}

            {isAdmin ? (
              <Link href="/admin" className="inline-flex items-center justify-center rounded-full border border-[#15327f]/20 bg-[#15327f]/6 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#15327f]">
                Admin
              </Link>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <button type="button" onClick={toggleCart} className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#15327f]/12 bg-[#f7f9ff] text-white/82" aria-label="Sepeti aç">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartBadge}
            </button>
            <button type="button" onClick={() => setMobileMenuOpen((prev) => !prev)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#15327f]/12 bg-[#f7f9ff] text-white/82" aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>

      <ProfileDrawer isOpen={profileOpen} close={() => setProfileOpen(false)} />

      <div className={`fixed inset-0 z-[150] lg:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-[#000033]/28 backdrop-blur-sm transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)} />
        <aside
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobil menü"
          className={`absolute right-0 top-0 h-dvh w-full max-w-sm overflow-y-auto border-l border-[#15327f]/12 bg-white px-6 pb-8 pt-6 text-[#333333] transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-[#15327f]/12 pb-5">
            <Image src="/images/logokoyu-crop.png" alt="Guohong Lazer" width={180} height={74} className="h-12 w-auto" />
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#15327f]/12 bg-[#f7f9ff]">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            {MOBILE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(item.href) ? 'bg-[#15327f] text-white' : 'bg-[#f7f9ff] text-[#333333] hover:bg-[#edf2ff]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-3">
            <Link href="/quote" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center rounded-2xl bg-[#ff6a0d] px-4 py-3 text-sm font-semibold text-[#15148c]">
              Teklif Al
            </Link>
            <a href={whatsAppHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-[#15327f]/12 bg-[#f7f9ff] px-4 py-3 text-sm font-semibold text-white">
              WhatsApp
            </a>
            {!isAuthed ? (
              <>
                <Link href={loginHref} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center rounded-2xl border border-[#15327f]/12 bg-[#f7f9ff] px-4 py-3 text-sm font-semibold text-white">
                  Giriş Yap
                </Link>
                <Link href={registerHref} onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center justify-center rounded-2xl border border-[#15327f]/12 bg-[#f7f9ff] px-4 py-3 text-sm font-semibold text-white">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <>
                <button type="button" onClick={() => { setMobileMenuOpen(false); setProfileOpen(true); }} className="inline-flex items-center justify-center rounded-2xl border border-[#15327f]/12 bg-[#f7f9ff] px-4 py-3 text-sm font-semibold text-white">
                  Profili Aç
                </button>
                <button type="button" onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }} className="inline-flex items-center justify-center rounded-2xl border border-rose-300/30 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  Çıkış Yap
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
