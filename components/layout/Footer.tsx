'use client';

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
    setWhatsAppHref(`https://wa.me/905368316787?text=${encodeURIComponent(message)}`);
  }, [pathname]);

  return (
    <footer className="relative overflow-hidden border-t border-white/8 bg-[#09095e] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.18),_transparent_25%),linear-gradient(180deg,_rgba(5,0,92,0),_rgba(5,0,92,0.55))]" />

      <div className="relative mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-white/10 bg-[#15148c] p-8 shadow-[0_40px_120px_-70px_rgba(5,0,92,0.95)]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#ff6a0d]">Guohong Laser</p>
              <h3 className="mt-4 text-3xl font-semibold text-white">Soruşturma gönder</h3>
              <p className="mt-4 text-sm leading-7 text-white/74">
                Sonucu görmekten daha iyi bir şey yoktur. Makine, yedek parça veya teknik servis ihtiyacınız için ekibimizle hemen iletişime geçin.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-[#ff6a0d] px-5 py-3 text-sm font-semibold text-[#15148c]">
                  Sorgulama İçin Tıklayınız
                </Link>
                <a href={whatsAppHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white">
                  Whatsapp
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Ürün</h4>
              <div className="mt-5 grid gap-3 text-sm">
                {productLinks.map((item) => (
                  <Link key={`${item.label}-${item.href}`} href={item.href} className="text-white/72 transition hover:text-[#ff6a0d]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Hızlı bağlantılar</h4>
              <div className="mt-5 grid gap-3 text-sm">
                {quickLinks.map((item) => (
                  <Link key={`${item.label}-${item.href}`} href={item.href} className="text-white/72 transition hover:text-[#ff6a0d]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Bize Ulaşın</h4>
              <div className="mt-5 grid gap-4 text-sm">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-white/45">Whatsapp</div>
                  <a href={whatsAppHref} target="_blank" rel="noreferrer" className="mt-2 block font-semibold text-white transition hover:text-[#ff6a0d]">
                    +90 536 831 67 87
                  </a>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-white/45">E-posta</div>
                  <a href="mailto:sales@guohonglaser.com" className="mt-2 block font-semibold text-white transition hover:text-[#ff6a0d]">
                    sales@guohonglaser.com
                  </a>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-white/45">Adres</div>
                  <div className="mt-2 font-semibold text-white">
                    Aksaray Çevreyolu Caddesi Akasya Sanayi Sitesi No: 18T Konya / Karatay 42210
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/55">
            <div>© {year} Guohong Lazer. Tüm hakları saklıdır.</div>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="transition hover:text-[#ff6a0d]">Gizlilik</Link>
              <Link href="/kvkk" className="transition hover:text-[#ff6a0d]">KVKK</Link>
              <Link href="/returns" className="transition hover:text-[#ff6a0d]">İade</Link>
              <Link href="/shipping" className="transition hover:text-[#ff6a0d]">Teslimat</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
