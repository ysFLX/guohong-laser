'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const productLinks = [
  { href: '/products', label: 'Plaka Lazer Kesim Makinesi' },
  { href: '/products', label: 'Tüp Lazer Kesim Makinesi' },
  { href: '/products', label: 'Plaka ve Boru Lazer Kesim Makinesi' },
  { href: '/products', label: 'Tüp Otomatik Beslemeli Lazer Kesim Makinesi' },
  { href: '/products', label: 'El Tipi Lazer Kaynak Makinesi' },
];

const quickLinks = [
  { href: '/about', label: 'Hakkımızda' },
  { href: '/contact?subject=Teknik+Destek', label: 'Teknik Destek' },
  { href: '/quote', label: 'Başvuru' },
  { href: '/gallery', label: 'Müşteri Davası' },
  { href: '/faq', label: 'SSS' },
  { href: '/contact', label: 'Bize Ulaşın' },
];

export default function Footer() {
  const pathname = usePathname();
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');
  const year = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pageUrl = window.location.href;
    const message = pageUrl
      ? `Merhaba, Guohong Lazer sitesinden yazıyorum. Şu sayfa hakkında bilgi almak istiyorum:\n${pageUrl}`
      : 'Merhaba, Guohong Lazer sitesinden yazıyorum. Bilgi almak istiyorum.';
    const timer = window.setTimeout(() => {
      setWhatsAppHref(`https://wa.me/905368316787?text=${encodeURIComponent(message)}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <footer className="relative overflow-hidden border-t border-[#15327f]/10 bg-white text-[#333333]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(21,50,127,0.08),_transparent_25%),linear-gradient(180deg,_rgba(21,50,127,0),_rgba(21,50,127,0.05))]" />

      <div className="relative mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-[#15327f]/12 bg-white p-8 shadow-[0_24px_60px_rgba(21,50,127,0.08)]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#15327f]">Guohong Laser</p>
              <h3 className="mt-4 text-3xl font-semibold text-[#333333]">Soruşturma gönder</h3>
              <p className="mt-4 text-sm leading-7 text-[#333333]/74">
                Sonucu görmekten daha iyi bir şey yoktur. Makine, yedek parça veya teknik servis ihtiyacınız için ekibimizle hemen iletişime geçin.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-[#15327f] px-5 py-3 text-sm font-semibold text-white">
                  Sorgulama İçin Tıklayınız
                </Link>
                <a href={whatsAppHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-[#15327f]/12 px-5 py-3 text-sm font-semibold text-[#15327f]">
                  Whatsapp
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#333333]">Ürün</h4>
              <div className="mt-5 grid gap-3 text-sm">
                {productLinks.map((item) => (
                  <Link key={`${item.label}-${item.href}`} href={item.href} className="text-[#333333]/72 transition hover:text-[#15327f]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#333333]">Hızlı bağlantılar</h4>
              <div className="mt-5 grid gap-3 text-sm">
                {quickLinks.map((item) => (
                  <Link key={`${item.label}-${item.href}`} href={item.href} className="text-[#333333]/72 transition hover:text-[#15327f]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#333333]">Bize Ulaşın</h4>
              <div className="mt-5 grid gap-4 text-sm">
                <div className="rounded-[24px] border border-[#15327f]/12 bg-[#f7f9ff] p-4">
                  <div className="text-[#333333]/45">Whatsapp</div>
                  <a href={whatsAppHref} target="_blank" rel="noreferrer" className="mt-2 block font-semibold text-[#333333] transition hover:text-[#15327f]">
                    +90 536 831 67 87
                  </a>
                </div>
                <div className="rounded-[24px] border border-[#15327f]/12 bg-[#f7f9ff] p-4">
                  <div className="text-[#333333]/45">E-posta</div>
                  <a href="mailto:guohonglazerinfo@gmail.com" className="mt-2 block font-semibold text-[#333333] transition hover:text-[#15327f]">
                    guohonglazerinfo@gmail.com
                  </a>
                </div>
                <div className="rounded-[24px] border border-[#15327f]/12 bg-[#f7f9ff] p-4">
                  <div className="text-[#333333]/45">Adres</div>
                  <div className="mt-2 font-semibold text-[#333333]">
                    Aksaray Çevreyolu Caddesi Akasya Sanayi Sitesi No: 18T Konya / Karatay 42210
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-[#15327f]/12 bg-[#f7f9ff] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#15327f]">Guvenli odeme</div>
                <div className="mt-1 text-sm text-[#333333]/68">PayTR altyapisiyla odeme ve tahsilat destegi</div>
              </div>
              <Image
                src="/paytrlogolar/paytr-logo-color.svg"
                alt="PayTR"
                width={132}
                height={34}
                sizes="132px"
                className="h-7 w-auto"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#15327f]/12 pt-6 text-sm text-[#333333]/55">
            <div>© {year} Guohong Lazer. Tüm hakları saklıdır.</div>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="transition hover:text-[#15327f]">Gizlilik</Link>
              <Link href="/kvkk" className="transition hover:text-[#15327f]">KVKK</Link>
              <Link href="/returns" className="transition hover:text-[#15327f]">İade</Link>
              <Link href="/shipping" className="transition hover:text-[#15327f]">Teslimat</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
