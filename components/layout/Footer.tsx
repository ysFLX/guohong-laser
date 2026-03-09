'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPaymentProviderName, getPaymentProviderPendingNotice } from '@/lib/paymentProviderStatus';

export default function Footer() {
  const pathname = usePathname();
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');
  const providerName = getPaymentProviderName();
  const quickLinks = [
    { href: '/about', label: 'Hakkimizda' },
    { href: '/products', label: 'Makineler' },
    { href: '/spare-parts', label: 'Yedek Parcalar' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/contact', label: 'Iletisim' },
  ];
  const policyLinks = [
    { href: '/shipping', label: 'Kargo ve Teslimat' },
    { href: '/returns', label: 'Iade ve Garanti' },
    { href: '/distance-sales', label: 'Mesafeli Satis' },
    { href: '/payment-security', label: 'Odeme Guvenligi' },
    { href: '/privacy', label: 'Gizlilik' },
    { href: '/kvkk', label: 'KVKK' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pageUrl = window.location.href;
    const message = pageUrl
      ? `Merhaba, Guohong Lazer sitesinden yaziyorum. Su sayfa hakkinda bilgi almak istiyorum:\n${pageUrl}`
      : 'Merhaba, Guohong Lazer sitesinden yaziyorum. Bilgi almak istiyorum.';
    setWhatsAppHref(`https://wa.me/905368316787?text=${encodeURIComponent(message)}`);
  }, [pathname]);

  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-amber-200/20 bg-[#060606] text-amber-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-4 h-64 w-64 rounded-full bg-amber-300/20 blur-[140px]" />
        <div className="absolute -bottom-24 left-4 h-72 w-72 rounded-full bg-amber-200/10 blur-[160px]" />
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(90deg,_rgba(251,191,36,0.08)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(251,191,36,0.08)_1px,_transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 lg:grid-cols-[1.25fr_1fr]">
          <section className="rounded-3xl border border-amber-200/20 bg-gradient-to-br from-[#14110a] via-[#101010] to-[#0a0a0a] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <Image
                  src="/images/logokoyu.png"
                  alt="Guohong Lazer"
                  width={220}
                  height={56}
                  sizes="220px"
                  className="h-12 w-auto sm:h-14"
                />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-amber-100/60">Guvenilir Partner</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-amber-50">Guohong Lazer</h3>
                </div>
              </div>
              <div className="rounded-full border border-emerald-200/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-200">
                Cevap suresi: 30 dk
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-amber-100/78">
              Uretim hattinizi hizlandiran lazer teknolojileri, guvenilir servis ve hizli yedek parca tedariki ile
              tum sureci tek noktadan yonetiyoruz.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(251,191,36,0.3)] transition hover:bg-amber-400"
              >
                Teklif Al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-white/5"
              >
                Iletisime Gec
              </Link>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10"
              >
                WhatsApp Hatti
              </a>
            </div>

            <div className="mt-7 rounded-2xl border border-amber-200/20 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Guvenli Odeme</p>
                  <p className="mt-1 text-sm text-amber-100/75">{getPaymentProviderPendingNotice()}</p>
                </div>
                <div className="rounded-full border border-amber-200/25 bg-[#1a1a1a] px-3 py-1 text-xs font-semibold text-amber-100/85">
                  3D Secure
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200/20 bg-[#101010] px-3 py-2">
                <Image
                  src="/paytrlogolar/paytr-logo-white.svg"
                  alt="PayTR"
                  width={132}
                  height={34}
                  sizes="132px"
                  className="h-7 w-auto"
                />
                <div className="h-6 w-px bg-amber-200/20" />
                <span className="text-xs font-semibold text-amber-100/85">{providerName}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">
                <span className="rounded-full border border-amber-200/30 bg-[#171717] px-3 py-1">Visa</span>
                <span className="rounded-full border border-amber-200/30 bg-[#171717] px-3 py-1">Mastercard</span>
                <span className="rounded-full border border-amber-200/30 bg-[#171717] px-3 py-1">Troy</span>
              </div>
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200/20 bg-[#121212] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Hizli Linkler</p>
              <div className="mt-4 grid gap-2 text-sm">
                {quickLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-amber-100/80 transition hover:text-amber-200">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/20 bg-[#121212] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Politikalar</p>
              <div className="mt-4 grid gap-2 text-sm">
                {policyLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-amber-100/80 transition hover:text-amber-200">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/20 bg-[#121212] p-6 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Iletisim</p>
              <div className="mt-4 grid gap-3 text-sm text-amber-100/80 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200/15 bg-[#171717] px-4 py-3">Telefon: +90 536 831 67 87</div>
                <div className="rounded-xl border border-amber-200/15 bg-[#171717] px-4 py-3">E-posta: guohonglazerinfo@gmail.com</div>
                <div className="rounded-xl border border-amber-200/15 bg-[#171717] px-4 py-3">Adres: Konya / Karatay 42210</div>
                <div className="rounded-xl border border-amber-200/15 bg-[#171717] px-4 py-3">Pazartesi - Cumartesi 09:00 - 18:00</div>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-amber-200/20 py-6">
          <div className="flex flex-col gap-3 text-xs text-amber-100/60 sm:flex-row sm:items-center sm:justify-between">
            <div>&copy; {year} Guohong Lazer. Tum haklari saklidir.</div>
            <div className="flex flex-wrap gap-3">
              <Link href="/privacy" className="transition hover:text-amber-200">Gizlilik</Link>
              <Link href="/cookies" className="transition hover:text-amber-200">Cerez</Link>
              <Link href="/kvkk" className="transition hover:text-amber-200">KVKK</Link>
              <Link href="/returns" className="transition hover:text-amber-200">Iade</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
