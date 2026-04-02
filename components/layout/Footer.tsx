'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPaymentProviderName, getPaymentProviderPendingNotice, isPaymentProviderActive } from '@/lib/paymentProviderStatus';

export default function Footer() {
  const pathname = usePathname();
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');
  const providerName = getPaymentProviderName();
  const providerActive = isPaymentProviderActive();
  const paymentNotice = providerActive
    ? `${providerName} ile güvenli ödeme aktif. Kart işlemleri 3D Secure ile korunur.`
    : getPaymentProviderPendingNotice();
  const quickLinks = [
    { href: '/about', label: 'Hakkımızda' },
    { href: '/products', label: 'Makineler' },
    { href: '/spare-parts', label: 'Yedek Parçalar' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/contact', label: 'İletişim' },
  ];
  const seoLinks = [
    { href: '/guohong-lazer', label: 'Guohong Lazer' },
    { href: '/guohong-lazer-konya', label: 'Guohong Lazer Konya' },
    { href: '/guohong-yedek-parca', label: 'Guohong Yedek Parça' },
    { href: '/lazer-kesim-makinesi-konya', label: 'Lazer Kesim Makinesi Konya' },
  ];
  const policyLinks = [
    { href: '/shipping', label: 'Kargo ve Teslimat' },
    { href: '/returns', label: 'İade ve Garanti' },
    { href: '/distance-sales', label: 'Mesafeli Satış' },
    { href: '/payment-security', label: 'Ödeme Güvenliği' },
    { href: '/privacy', label: 'Gizlilik' },
    { href: '/kvkk', label: 'KVKK' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pageUrl = window.location.href;
    const message = pageUrl
      ? `Merhaba, Guohong Lazer sitesinden yazıyorum. Şu sayfa hakkında bilgi almak istiyorum:\n${pageUrl}`
      : 'Merhaba, Guohong Lazer sitesinden yazıyorum. Bilgi almak istiyorum.';
    setWhatsAppHref(`https://wa.me/905368316787?text=${encodeURIComponent(message)}`);
  }, [pathname]);

  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-amber-200/25 bg-[#15148c] text-amber-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-4 h-64 w-64 rounded-full bg-amber-300/20 blur-[140px]" />
        <div className="absolute -bottom-24 left-4 h-72 w-72 rounded-full bg-amber-200/10 blur-[160px]" />
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(90deg,_rgba(251,191,36,0.08)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(251,191,36,0.08)_1px,_transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 lg:grid-cols-[1.25fr_1fr]">
          <section className="rounded-3xl border border-amber-200/25 bg-[#15148c] p-6 shadow-[0_22px_60px_rgba(5,0,92,0.45)] sm:p-8">
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
                  <p className="text-[11px] uppercase tracking-[0.25em] text-amber-100/60">Güvenilir Partner</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-amber-50">Guohong Lazer</h3>
                </div>
              </div>
              <div className="rounded-full border border-amber-200/35 bg-amber-300/10 px-4 py-1.5 text-xs font-semibold text-amber-100">
                Cevap süresi: 30 dk
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-amber-100/78">
              Üretim hattınızı hızlandıran lazer teknolojileri, güvenilir servis ve hızlı yedek parça tedariki ile
              tüm süreci tek noktadan yönetiyoruz.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-100/65">
              Guohong Lazer Konya merkezli fiber lazer kesim makineleri, teknik servis, kurulum, bakım ve yedek
              parça tedariki sunar. Türkiye geneline teklif, satış sonrası destek ve hızlı parça erişimi sağlıyoruz.
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
                className="inline-flex items-center justify-center rounded-full border border-amber-200/35 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-[#15148c]"
              >
                İletişime Geç
              </Link>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10"
              >
                WhatsApp Hattı
              </a>
            </div>

            <div className="mt-7 rounded-2xl border border-amber-200/25 bg-[#15148c] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Güvenli Ödeme</p>
                  <p className="mt-1 text-sm text-amber-100/75">{paymentNotice}</p>
                </div>
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    providerActive
                      ? 'border-amber-200/35 bg-amber-300/10 text-amber-100'
                      : 'border-amber-200/30 bg-[#15148c] text-amber-100/90'
                  }`}
                >
                  {providerActive ? 'Odeme Aktif' : 'Aktivasyon Beklemede'}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200/25 bg-[#15148c] px-3 py-2">
                <Image
                  src="/paytrlogolar/paytr-logo-white.svg"
                  alt="PayTR"
                  width={132}
                  height={34}
                  sizes="132px"
                  className="h-7 w-auto"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">
                <span className="rounded-full border border-amber-200/35 bg-[#15148c] px-3 py-1">Visa</span>
                <span className="rounded-full border border-amber-200/35 bg-[#15148c] px-3 py-1">Mastercard</span>
                <span className="rounded-full border border-amber-200/35 bg-[#15148c] px-3 py-1">Troy</span>
                <span className="rounded-full border border-amber-200/35 bg-[#15148c] px-3 py-1">3D Secure</span>
              </div>
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200/25 bg-[#15148c] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Hızlı Linkler</p>
              <div className="mt-4 grid gap-2 text-sm">
                {quickLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-amber-100/80 transition hover:text-amber-200">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/25 bg-[#15148c] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Politikalar</p>
              <div className="mt-4 grid gap-2 text-sm">
                {policyLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-amber-100/80 transition hover:text-amber-200">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/25 bg-[#15148c] p-6 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">Popüler Aramalar</p>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {seoLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-amber-100/80 transition hover:text-amber-200">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/25 bg-[#15148c] p-6 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/60">İletişim</p>
              <div className="mt-4 grid gap-3 text-sm text-amber-100/80 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200/20 bg-[#15148c] px-4 py-3">Telefon: +90 536 831 67 87</div>
                <div className="rounded-xl border border-amber-200/20 bg-[#15148c] px-4 py-3">E-posta: guohonglazerinfo@gmail.com</div>
                <div className="rounded-xl border border-amber-200/20 bg-[#15148c] px-4 py-3">Adres: Aksaray Çevreyolu Caddesi Akasya Sanayi Sitesi No: 18T Konya / Karatay 42210</div>
                <div className="rounded-xl border border-amber-200/20 bg-[#15148c] px-4 py-3">Pazartesi - Cuma 09:00 - 17:00</div>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-amber-200/20 py-6">
          <div className="flex flex-col gap-3 text-xs text-amber-100/60 sm:flex-row sm:items-center sm:justify-between">
            <div>&copy; {year} Guohong Lazer. Tüm hakları saklıdır.</div>
            <div className="flex flex-wrap gap-3">
              <Link href="/privacy" className="transition hover:text-amber-200">Gizlilik</Link>
              <Link href="/cookies" className="transition hover:text-amber-200">Çerez</Link>
              <Link href="/kvkk" className="transition hover:text-amber-200">KVKK</Link>
              <Link href="/returns" className="transition hover:text-amber-200">İade</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
