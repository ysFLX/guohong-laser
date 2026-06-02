'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const productLinks = [
  { href: '/products', label: 'Tüm makineler' },
  { href: '/products?category=sac-plaka-kesimi', label: 'Sac plaka kesimi' },
  { href: '/products?category=boru-kesimi', label: 'Boru kesimi' },
  { href: '/spare-parts', label: 'Yedek parçalar' },
];

const quickLinks = [
  { href: '/about', label: 'Hakkımızda' },
  { href: '/quote', label: 'Teklif Al' },
  { href: '/gallery', label: 'Galeri' },
  { href: '/contact', label: 'İletişim' },
  { href: '/faq', label: 'SSS' },
];

export default function Footer() {
  const pathname = usePathname();
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');
  const year = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const message = `Merhaba, Guohong Lazer sitesinden yazıyorum. Şu sayfa hakkında bilgi almak istiyorum:\n${window.location.href}`;
    const timer = window.setTimeout(() => {
      setWhatsAppHref(`https://wa.me/905368316787?text=${encodeURIComponent(message)}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f36b21]">Guohong Lazer</p>
            <h3 className="mt-4 max-w-md text-3xl font-semibold tracking-tight">Fiber lazer makine, servis ve yedek parça çözümü.</h3>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/64">
              Konya merkezli teknik ekip, makine seçimi, kurulum, yedek parça ve satış sonrası destek süreçlerinde doğrudan yanınızda.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/quote" className="inline-flex items-center justify-center rounded-lg bg-[#f36b21] px-5 py-3 text-sm font-semibold text-white">
                Teklif al
              </Link>
              <a href={whatsAppHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-white/16 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8">
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/82">Ürünler</h4>
            <div className="mt-5 grid gap-3 text-sm">
              {productLinks.map((item) => (
                <Link key={`${item.label}-${item.href}`} href={item.href} className="text-white/62 transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/82">Kurumsal</h4>
            <div className="mt-5 grid gap-3 text-sm">
              {quickLinks.map((item) => (
                <Link key={`${item.label}-${item.href}`} href={item.href} className="text-white/62 transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/82">İletişim</h4>
            <div className="mt-5 grid gap-4 text-sm text-white/66">
              <a href={whatsAppHref} target="_blank" rel="noreferrer" className="transition hover:text-white">
                +90 536 831 67 87
              </a>
              <a href="mailto:guohonglazerinfo@gmail.com" className="transition hover:text-white">
                guohonglazerinfo@gmail.com
              </a>
              <p>Fevzi Çakmak Mah. Aksaray Çevreyolu Cad. Akasya Sanayi Sitesi No: 18T Karatay / Konya</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/46">
          <div>© {year} Guohong Lazer. Tüm hakları saklıdır.</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-white">Gizlilik</Link>
            <Link href="/kvkk" className="transition hover:text-white">KVKK</Link>
            <Link href="/returns" className="transition hover:text-white">İade</Link>
            <Link href="/shipping" className="transition hover:text-white">Teslimat</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
