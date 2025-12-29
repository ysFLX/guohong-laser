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
  { label: 'Yedek Parçalar', href: '/spare-parts' },
  { label: 'Galeri', href: '/gallery' },
  { label: 'Hakkımızda', href: '/about' },
  { label: 'İletişim', href: '/contact' },
];

function panelsFor(pathname: string): PagePanels {
  if (pathname.startsWith('/products')) {
    return {
      left: [
        {
          title: 'Kategori İpuçları',
          description: 'Sac, boru ve kombine kesim filtrelerini kullanarak doğru ürünü hızlıca bulun.',
          list: ['Sac Kesim', 'Boru Kesim', 'Kombine Kesim', 'Özel Kesim'],
        },
        {
          title: 'Teknik Danışman',
          description: 'Model seçimi için 10 dakikalık ücretsiz danışmanlık alın.',
          cta: { label: 'Danışmanlık Al', href: '/contact?subject=Urun+Secimi' },
        },
      ],
      right: [
        {
          title: 'Teklif Talebi',
          description: 'İhtiyaçlarınızı yazın, aynı gün içinde teklif hazırlayalım.',
          cta: { label: 'Teklif Formu', href: '/quote' },
        },
        {
          title: 'Kurulum Süresi',
          description: 'Standart hatlar 7-10 gün içinde devreye alınır.',
        },
      ],
    };
  }

  if (pathname.startsWith('/spare-parts')) {
    return {
      left: [
        {
          title: 'Uyumluluk Kontrolü',
          description: 'Parça kodu veya makine modeliyle hızlı eşleştirme yapın.',
          cta: { label: 'Destek Al', href: '/contact?subject=Yedek+Parca' },
        },
        {
          title: 'Stok Avantajı',
          description: 'Kritik parçalar aynı gün kargoya verilir.',
        },
      ],
      right: [
        {
          title: 'Servis Ağı',
          description: 'Türkiye geneli servis noktalarıyla hızlı çözüm.',
        },
        {
          title: 'Katalog',
          description: 'Yedek parça kataloğunu tek dosyada inceleyin.',
          cta: { label: 'Dokümanlar', href: '/downloads' },
        },
      ],
    };
  }

  if (pathname.startsWith('/contact')) {
    return {
      left: [
        {
          title: 'İletişim Saatleri',
          description: 'Pazartesi-Cumartesi 09:00-18:00 arası destek.',
        },
        {
          title: 'Teklif Süreci',
          description: 'Formu doldurun, 24 saat içinde dönüş olacaktır.',
          cta: { label: 'Teklif Formu', href: '/quote' },
        },
      ],
      right: [
        {
          title: 'Doğrudan İletişim',
          description: '+90 536 831 67 87 - guohonglazerinfo@gmail.com',
        },
        {
          title: 'Adres',
          description: 'Fevziçakmak Mah. Aksaray Çevreyolu Caddesi Akasya Sitesi A Blok No:18T 42210',
        },
      ],
    };
  }

  if (pathname.startsWith('/quote')) {
    return {
      left: [
        {
          title: 'Hızlı Bilgi',
          description: 'Üretim kapasitesi ve malzeme türü teklif süresini kısaltır.',
        },
        {
          title: 'Dosya Gönder',
          description: 'Teknik çizim varsa bizimle paylaşabilirsiniz.',
          cta: { label: 'İletişime Geç', href: '/contact?subject=Teknik+Cizim' },
        },
      ],
      right: [
        {
          title: 'Tahmini Süre',
          description: 'Çoğu teklif 24 saat içinde hazırlanır.',
        },
      ],
    };
  }

  if (pathname.startsWith('/about')) {
    return {
      left: [
        {
          title: 'Vizyon',
          description: 'Akıllı üretim hatlarında lider çözüm ortağı olmak.',
        },
        {
          title: 'Misyon',
          description: 'Yüksek kalite ve güvenilir servis anlayışı.',
        },
      ],
      right: [
        {
          title: 'Kurumsal',
          description: '10+ yıllık saha deneyimi ve güçlü mühendislik ekibi.',
        },
        {
          title: 'Referanslar',
          description: 'Saha kurulumlarını galeride inceleyin.',
          cta: { label: 'Galeri', href: '/gallery' },
        },
      ],
    };
  }

  if (pathname.startsWith('/gallery')) {
    return {
      left: [
        {
          title: 'Saha Görselleri',
          description: 'Kurulum öncesi/sonrası gerçek projeler.',
        },
        {
          title: 'Video Arşivi',
          description: 'Üretim hatlarını video galerisinde inceleyin.',
          cta: { label: 'Video Galerisi', href: '/' },
        },
      ],
      right: [
        {
          title: 'Teknik Bilgi',
          description: 'Görsellerde yer alan modeller için bilgi alın.',
          cta: { label: 'İletişime Geç', href: '/contact?subject=Galeri' },
        },
      ],
    };
  }

  if (pathname.startsWith('/cart')) {
    return {
      left: [
        {
          title: 'Teslimat',
          description: 'Stoklu ürünler aynı gün kargoya verilir.',
        },
        {
          title: 'Ödeme',
          description: 'Güvenli ödeme altyapısı hazırlanıyor.',
        },
      ],
      right: [
        {
          title: 'Sepet Desteği',
          description: 'Sipariş öncesi teknik sorular için bize yazın.',
          cta: { label: 'Destek Al', href: '/contact?subject=Sepet' },
        },
      ],
    };
  }

  if (pathname.startsWith('/profile')) {
    return {
      left: [
        {
          title: 'Profil Kontrolü',
          description: 'Bilgilerinizi güncel tutun, teklif süreci hızlansın.',
        },
        {
          title: 'Adres Yönetimi',
          description: 'Teslimat adreslerinizi düzenleyin.',
          cta: { label: 'Adreslerim', href: '/profile/addresses' },
        },
      ],
      right: [
        {
          title: 'Favoriler',
          description: 'Beğendiğiniz ürünlere hızlı erişin.',
          cta: { label: 'Favorilerim', href: '/profile/favorites' },
        },
        {
          title: 'Siparişler',
          description: 'Sipariş durumunu görüntüleyin.',
          cta: { label: 'Siparişlerim', href: '/profile/orders' },
        },
      ],
    };
  }

  if (pathname.startsWith('/admin')) {
    return {
      left: [
        {
          title: 'Operasyon Notu',
          description: 'Bildirimleri kontrol edip dönüşleri hızlandırın.',
        },
        {
          title: 'Stok Yönetimi',
          description: 'Yeni ürün ve kategori güncellemeleri.',
        },
      ],
      right: [
        {
          title: 'Kısayollar',
          description: 'Yedek parça ve başvuru panellerine geçiş.',
          list: ['Yedek Parçalar', 'Kategoriler', 'Teklifler', 'İletişim'],
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
          title: 'Güvenli Giriş',
          description: 'Hesabınızı güvenle yönetin.',
        },
      ],
      right: [
        {
          title: 'Yardım',
          description: 'Sorun yaşarsanız destek ekibine yazın.',
          cta: { label: 'İletişim', href: '/contact?subject=Hesap' },
        },
      ],
    };
  }

  return {
    left: [
      {
        title: 'Hızlı Menü',
        description: 'Sayfalara hızlı geçiş yapın.',
        list: baseLinks,
      },
    ],
    right: [
      {
        title: 'İletişim',
        description: 'Sorular için bize ulaşın.',
        cta: { label: 'İletişime Geç', href: '/contact' },
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

  return (
    <div className="relative z-0 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#10b981,_transparent_45%)] opacity-15 dark:opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(248,250,252,0.85),_rgba(226,232,240,0.55))] dark:bg-[linear-gradient(135deg,_rgba(2,6,23,0.9),_rgba(15,23,42,0.9))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-[160px] dark:bg-emerald-400/20" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-emerald-400/15 blur-[180px] dark:bg-emerald-400/12" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(15,23,42,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(15,23,42,0.04)_1px,_transparent_1px)] bg-[size:64px_64px] opacity-20 dark:bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] dark:opacity-25" />
      </div>

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
    </div>
  );
}
