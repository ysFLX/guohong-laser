'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Footer() {
  const pathname = usePathname();
  const [whatsAppHref, setWhatsAppHref] = useState('https://wa.me/905368316787');

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
    <footer className="relative overflow-hidden border-t border-amber-200/20 bg-[#080808] text-amber-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-amber-300/25 blur-[140px]" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-200/15 blur-[160px]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,_rgba(251,191,36,0.08)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(251,191,36,0.08)_1px,_transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 lg:grid-cols-[1.1fr_1.3fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Image src="/images/logokoyu.png" alt="Guohong Lazer" width={220} height={56} sizes="220px" className="h-14 w-auto" />
              <div>
                <div className="text-xl font-semibold tracking-tight text-amber-50">Guohong Lazer</div>
                <div className="text-sm text-amber-100/70">Lazer makineleri, yedek parca ve teknik destek.</div>
              </div>
            </div>

            <p className="max-w-xl text-sm text-amber-100/70">
              Uretim hattinizi hizlandiran lazer teknolojileri, guvenilir servis ve hizli tedarik ile tek noktadan cozum.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/quote" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
                Teklif Al
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-amber-200/25 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-[#1a1a1a]">
                Iletisime Gec
              </Link>
              <a href={whatsAppHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-300/10">
                WhatsApp Hatti
              </a>
            </div>

            <div className="rounded-2xl border border-amber-200/20 bg-[#151515] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-100/60">Guvenli Odeme</div>
              <p className="mt-3 text-sm text-amber-100/75">
                Kartli odeme altyapisi basvuru surecindedir. Aktiflestiginde guvenli odeme adimlari checkout
                ekraninda gorunecektir.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/85">
                <span className="rounded-full border border-amber-200/30 bg-[#1d1d1d] px-3 py-1">Visa</span>
                <span className="rounded-full border border-amber-200/30 bg-[#1d1d1d] px-3 py-1">Mastercard</span>
                <span className="rounded-full border border-amber-200/30 bg-[#1d1d1d] px-3 py-1">Troy</span>
                <span className="rounded-full border border-amber-200/30 bg-[#1d1d1d] px-3 py-1">3D Secure</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-amber-200/20 bg-[#151515] p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-100/60">Hizli Linkler</div>
              <div className="mt-4 grid gap-2 text-sm">
                <Link href="/about" className="text-amber-100/80 hover:text-amber-200">Hakkimizda</Link>
                <Link href="/products" className="text-amber-100/80 hover:text-amber-200">Makineler</Link>
                <Link href="/spare-parts" className="text-amber-100/80 hover:text-amber-200">Yedek Parcalar</Link>
                <Link href="/gallery" className="text-amber-100/80 hover:text-amber-200">Galeri</Link>
                <Link href="/contact" className="text-amber-100/80 hover:text-amber-200">Iletisim</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/20 bg-[#151515] p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-100/60">Politikalar</div>
              <div className="mt-4 grid gap-2 text-sm">
                <Link href="/shipping" className="text-amber-100/80 hover:text-amber-200">Kargo ve Teslimat</Link>
                <Link href="/returns" className="text-amber-100/80 hover:text-amber-200">Iade ve Garanti</Link>
                <Link href="/distance-sales" className="text-amber-100/80 hover:text-amber-200">Mesafeli Satis</Link>
                <Link href="/payment-security" className="text-amber-100/80 hover:text-amber-200">Odeme Guvenligi</Link>
                <Link href="/privacy" className="text-amber-100/80 hover:text-amber-200">Gizlilik</Link>
                <Link href="/kvkk" className="text-amber-100/80 hover:text-amber-200">KVKK</Link>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200/20 bg-[#151515] p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-100/60">Iletisim</div>
              <div className="mt-4 space-y-2 text-sm text-amber-100/75">
                <div>Telefon: +90 536 831 67 87</div>
                <div>E-posta: guohonglazerinfo@gmail.com</div>
                <div>Adres: Konya / Karatay 42210</div>
                <div>Pazartesi - Cumartesi 09:00 - 18:00</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-200/20 py-5">
          <div className="flex flex-col gap-3 text-xs text-amber-100/60 sm:flex-row sm:items-center sm:justify-between">
            <div>&copy; {year} Guohong Lazer. Tum haklari saklidir.</div>
            <div className="flex flex-wrap gap-3">
              <Link href="/privacy" className="hover:text-amber-200">Gizlilik</Link>
              <Link href="/cookies" className="hover:text-amber-200">Cerez</Link>
              <Link href="/kvkk" className="hover:text-amber-200">KVKK</Link>
              <Link href="/returns" className="hover:text-amber-200">Iade</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
