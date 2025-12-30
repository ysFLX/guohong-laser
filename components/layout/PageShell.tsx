'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

type ListItem = string | { label: string; href: string };

type Card = {
  title: string;
  description: string;
  cta?: { label: string; href: string };
  list?: ListItem[];
};

type PagePanels = {
  left: Card[];
  right: Card[];
};

const baseLinks = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Makineler', href: '/products' },
  { label: 'Yedek Parcalar', href: '/spare-parts' },
  { label: 'Galeri', href: '/gallery' },
  { label: 'Hakkimizda', href: '/about' },
  { label: 'Iletisim', href: '/contact' },
];

function panelsFor(pathname: string): PagePanels {
  if (pathname.startsWith('/products') || pathname.startsWith('/spare-parts')) {
    return { left: [], right: [] };
  }

  if (pathname.startsWith('/contact')) {
    return {
      left: [
        {
          title: 'Iletisim Saatleri',
          description: 'Pazartesi-Cumartesi 09:00-18:00 arasinda destek.',
        },
        {
          title: 'Teklif Sureci',
          description: 'Formu doldurun, 24 saat icinde donus olur.',
          cta: { label: 'Teklif Formu', href: '/quote' },
        },
      ],
      right: [
        {
          title: 'Dogruan Iletisim',
          description: '+90 536 831 67 87 - guohonglazerinfo@gmail.com',
        },
        {
          title: 'Adres',
          description: 'Fevzicakmak Mah. Aksaray Cevreyolu Caddesi Akasya Sitesi A Blok No:18T 42210',
        },
      ],
    };
  }

  if (pathname.startsWith('/quote')) {
    return {
      left: [
        {
          title: 'Hizli Bilgi',
          description: 'Uretim kapasitesi ve malzeme turu teklif suresini kisaltir.',
        },
        {
          title: 'Dosya Gonder',
          description: 'Teknik cizim varsa bizimle paylasabilirsiniz.',
          cta: { label: 'Iletisime Gec', href: '/contact?subject=Teknik+Cizim' },
        },
      ],
      right: [
        {
          title: 'Tahmini Sure',
          description: 'Cogu teklif 24 saat icinde hazirlanir.',
        },
      ],
    };
  }

  if (pathname.startsWith('/about')) {
    return {
      left: [
        {
          title: 'Vizyon',
          description: 'Akilli uretim hatlarinda lider cozum ortagi olmak.',
        },
        {
          title: 'Misyon',
          description: 'Yuksek kalite ve guvenilir servis anlayisi.',
        },
      ],
      right: [
        {
          title: 'Kurumsal',
          description: '10+ yillik saha deneyimi ve guclu muhendislik ekibi.',
        },
        {
          title: 'Referanslar',
          description: 'Saha kurulumlarini galeride inceleyin.',
          cta: { label: 'Galeri', href: '/gallery' },
        },
      ],
    };
  }

  if (pathname.startsWith('/gallery')) {
    return {
      left: [
        {
          title: 'Saha Gorselleri',
          description: 'Kurulum oncesi/sonrasi gercek projeler.',
        },
        {
          title: 'Video Arsivi',
          description: 'Uretim hatlarini video galeride inceleyin.',
          cta: { label: 'Video Galerisi', href: '/' },
        },
      ],
      right: [
        {
          title: 'Teknik Bilgi',
          description: 'Gorsellerde yer alan modeller icin bilgi alin.',
          cta: { label: 'Iletisime Gec', href: '/contact?subject=Galeri' },
        },
      ],
    };
  }

  if (pathname.startsWith('/cart')) {
    return {
      left: [
        {
          title: 'Teslimat',
          description: 'Stoklu urunler ayni gun kargoya verilir.',
        },
        {
          title: 'Odeme',
          description: 'Guvenli odeme altyapisi hazirlaniyor.',
        },
      ],
      right: [
        {
          title: 'Sepet Destegi',
          description: 'Siparis oncesi teknik sorular icin bize yazin.',
          cta: { label: 'Destek Al', href: '/contact?subject=Sepet' },
        },
      ],
    };
  }

  if (pathname.startsWith('/profile')) {
    return {
      left: [
        {
          title: 'Profil Kontrolu',
          description: 'Bilgilerinizi guncel tutun, teklif sureci hizlansin.',
        },
        {
          title: 'Adres Yonetimi',
          description: 'Teslimat adreslerinizi duzenleyin.',
          cta: { label: 'Adreslerim', href: '/profile/addresses' },
        },
      ],
      right: [
        {
          title: 'Favoriler',
          description: 'Begenilen urunlere hizli erisin.',
          cta: { label: 'Favorilerim', href: '/profile/favorites' },
        },
        {
          title: 'Siparisler',
          description: 'Siparis durumunu goruntuleyin.',
          cta: { label: 'Siparislerim', href: '/profile/orders' },
        },
      ],
    };
  }

  if (pathname.startsWith('/admin')) {
    return {
      left: [
        {
          title: 'Operasyon Notu',
          description: 'Bildirimleri kontrol edip donusleri hizlandirin.',
        },
        {
          title: 'Stok Yonetimi',
          description: 'Yeni urun ve kategori guncellemeleri.',
        },
      ],
      right: [
        {
          title: 'Kisayollar',
          description: 'Yedek parca ve basvuru panellerine gecis.',
          list: ['Yedek Parcalar', 'Kategoriler', 'Teklifler', 'Iletisim'],
        },
      ],
    };
  }

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/complete-profile')
  ) {
    return {
      left: [
        {
          title: 'Guvenli Giris',
          description: 'Hesabinizi guvenle yonetin.',
        },
      ],
      right: [
        {
          title: 'Yardim',
          description: 'Sorun yasarsaniz destek ekibine yazin.',
          cta: { label: 'Iletisim', href: '/contact?subject=Hesap' },
        },
      ],
    };
  }

  return {
    left: [
      {
        title: 'Hizli Menu',
        description: 'Sayfalara hizli gecis yapin.',
        list: baseLinks,
      },
    ],
    right: [
      {
        title: 'Iletisim',
        description: 'Sorular icin bize ulasin.',
        cta: { label: 'Iletisime Gec', href: '/contact' },
      },
    ],
  };
}

function CardItem({ card }: { card: Card }) {
  return (
    <div className="card-surface p-5 text-slate-900 dark:text-white">
      <p className="eyebrow">{card.title}</p>
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{card.description}</p>
      {card.list && (
        <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {card.list.map((item) => {
            if (typeof item === 'string') {
              return (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {item}
                </li>
              );
            }

            return (
              <li key={item.href} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <Link href={item.href} className="hover:text-emerald-600 dark:hover:text-emerald-300">
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {card.cta && (
        <Link href={card.cta.href} className="btn-outline mt-4 inline-flex">
          {card.cta.label}
        </Link>
      )}
    </div>
  );
}

export default function PageShell({ children }: PageShellProps) {
  const pathname = usePathname();
  const panels = panelsFor(pathname);

  if (pathname.startsWith('/admin')) {
    return <div className="relative z-0">{children}</div>;
  }

  if (pathname.startsWith('/products') || pathname.startsWith('/spare-parts')) {
    return <div className="relative z-0 overflow-x-hidden">{children}</div>;
  }

  return (
    <div className="relative z-0 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#10b981,_transparent_45%)] opacity-15 dark:opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(248,250,252,0.85),_rgba(226,232,240,0.55))] dark:bg-[linear-gradient(135deg,_rgba(2,6,23,0.9),_rgba(15,23,42,0.9))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-[160px] dark:bg-emerald-400/20" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-emerald-400/15 blur-[180px] dark:bg-emerald-400/12" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(15,23,42,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(15,23,42,0.04)_1px,_transparent_1px)] bg-[size:64px_64px] opacity-20 dark:bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] dark:opacity-25" />
      </div>

      {pathname === '/' ? (
        <div className="relative mx-auto max-w-[1440px] px-3 py-8 sm:px-6 lg:px-4">
          {children}
        </div>
      ) : (
        <div className="relative mx-auto max-w-[1440px] px-3 py-8 sm:px-6 lg:px-4">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr_280px]">
            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-6">
                {panels.left.map((card) => (
                  <CardItem key={card.title} card={card} />
                ))}
              </div>
            </aside>

            <div className="min-w-0">
              <div className="card-surface overflow-hidden text-slate-900 backdrop-blur dark:text-white">
                <div className="fade-up p-6 sm:p-10">{children}</div>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-6">
                {panels.right.map((card) => (
                  <CardItem key={card.title} card={card} />
                ))}
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
