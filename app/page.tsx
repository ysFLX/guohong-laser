import Image from 'next/image';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

import Reveal from '@/components/home/Reveal';
import VideoSlider from '@/components/home/VideoSlider';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { getUsdTryExchangeRate, resolveDisplayedCurrency, resolveDisplayedPriceCents } from '@/lib/exchangeRates';
import { normalizeHomePanelConfig } from '@/lib/homePanelDefaults';
import { prisma } from '@/lib/prisma';
import { isSparePartDirectPurchaseEnabled, isSparePartPriceVisible } from '@/lib/sparePartSales';

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const heroStats = [
  { label: 'Verimlilik', value: '%100' },
  { label: 'Makine Kurulum Süresi', value: '7-12 gün' },
];

const heroVideos = [
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584816/sackesim_m6icrx.mp4',
    title: 'Lazer Sac Kesimi',
  },
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584806/borukesim_dd8a5f.mp4',
    title: 'Lazer Boru Kesimi',
  },
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584837/demirkesim_kbwzy2.mp4',
    title: 'Lazer Demir Kesimi',
  },
];

const liveStatus = [
  { label: 'Teslimat', value: '2-3 iş günü', tone: 'text-amber-200' },
  { label: 'Son Güncelleme', value: '5 dk önce', tone: 'text-slate-200' },
];

const panelIcon = (name?: string) => {
  switch (name) {
    case 'building':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 21h18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 21V3h12v18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7h2M9 11h2M9 15h2M13 7h2M13 11h2M13 15h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'chart-up':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 19V5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8h16a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2v-7a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'document':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'badge-check':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 8l-10 6L2 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 4h12a1 1 0 011 1v16l-7-4-7 4V5a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 3l8 4v5c0 5-3.5 9-8 9s-8-4-8-9V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20.8 7.6a4.5 4.5 0 00-6.4 0L12 10l-2.4-2.4a4.5 4.5 0 00-6.4 6.4L12 22l8.8-8a4.5 4.5 0 000-6.4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'target':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 10-12 0v3a2 2 0 01-.6 1.4L4 17h5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 17a3 3 0 006 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'file':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'check':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'signature':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 12c4 0 4-6 8-6s4 6 8 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="18" cy="17" r="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 8v4l2 2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 22a10 10 0 100-20 10 10 0 000 20z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const commerceTiles = [
  {
    title: 'Lazer Makineleri',
    description: 'Sac, boru ve demir hatlar için profesyonel çözümler.',
    href: '/products',
  },
  {
    title: 'Yedek Parça',
    description: 'İhtiyaç duyduğunuz parçaları hızlı ve kolay bir şekilde tedarik edin.',
    href: '/spare-parts',
  },
  {
    title: 'Teknik Destek',
    description: 'Bakım planlama, arıza ve uzaktan destek süreci.',
    href: '/contact?subject=Teknik+Destek',
  },
];

const spotlight = {
  title: 'Açık Çift Tablalı Sac Kesim Makinesi',
  description:
    'Yüksek güç seçenekleri, otomatik tabla ve stabil kesim kalitesiyle üretim hattınızı hızlandırır.',
  image: '/images/1.jpg',
  specs: [
    { label: 'Güç', value: '6-12 kW' },
    { label: 'Tabla', value: '1500x3000' },
    { label: 'Otomasyon', value: 'Çift tabla' },
    { label: 'Teslim', value: '3-5 hafta' },
  ],
};

const supportGrid = [
  {
    title: 'Destek kaydı aç',
    description: 'Arıza, performans düşüşü veya kurulum talebi için.',
    href: '/contact?subject=Destek+Kaydi',
  },
  {
    title: 'Bakım planla',
    description: 'Periyodik bakım ile tüm riskleri azalt.',
    href: '/quote?type=Bakim',
  },
  {
    title: 'Uyumluluk sor',
    description: 'Model - Parça uyumu için hızlı kontrol.',
    href: '/contact?subject=Uyumluluk',
  },
  {
    title: 'Uzaktan destek',
    description: 'Teknik ekip ile uzaktan bağlantı ve teşhis için.',
    href: '/contact?subject=Uzaktan+Destek',
  },
];

const trustLinks = [
  {
    title: 'İade ve Garanti',
    description: 'Garanti kapsamı, iade koşulları ve servis akışı.',
    href: '/returns',
  },
  {
    title: 'Mesafeli Satış',
    description: 'Sipariş onayı, teslimat ve cayma hakkı özeti.',
    href: '/distance-sales',
  },
  {
    title: 'Kargo ve Teslimat',
    description: 'Hazırlama süreleri ve kargo takip bilgileri.',
    href: '/shipping',
  },
  {
    title: 'Ödeme Güvenliği',
    description: 'SSL, 3D Secure ve güvenli ödeme adımları.',
    href: '/payment-security',
  },
  {
    title: 'Gizlilik Politikası',
    description: 'KVKK, veri işleme ve iletişim bilgileri.',
    href: '/privacy',
  },
  {
    title: 'KVKK Aydınlatma',
    description: 'Veri işleme amaçları ve başvuru hakları.',
    href: '/kvkk',
  },
  {
    title: 'Çerez Politikası',
    description: 'Çerez türleri ve tercih yönetimi.',
    href: '/cookies',
  },
];

const quickShowcaseFallback = [
  {
    title: 'FSCUT',
    description: 'Kesim hattınız için kontrol yazılımı. Hızlı kurulum.',
    price: 'TL 1.900,90',
    tag: 'Yazılım',
    href: '/spare-parts',
    image: '/images/1.jpg',
  },
  {
    title: 'Seramik Conta (Halka)',
    description: 'Yüksek dayanımlı yedek parça. Stoktan teslim.',
    price: 'TL 199,99',
    tag: 'Conta',
    href: '/spare-parts',
    image: '/images/2.jpg',
  },
  {
    title: 'WSX NC30E',
    description: 'Lazer kafa parçaları için hızlı tedarik.',
    price: 'TL 1.199,99',
    tag: 'Lazer Kafası',
    href: '/spare-parts',
    image: '/images/3.jpg',
  },
];

const formatPrice = (value: number, currency = 'TRY') =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);

const trimText = (value: string, max = 90) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);
const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const getInitials = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => (word[0] ?? '').toUpperCase())
    .join('');

  return initials || 'M';
};

type QuickShowcaseItem = {
  title: string;
  description: string;
  price: string;
  tag: string;
  href: string;
  image: string;
  id?: string;
  priceCents?: number;
  currency?: string;
  imageUrl?: string | null;
  stockOnHand?: number;
  inStock?: boolean;
  ratingAverage?: number;
  ratingCount?: number;
};

type HomeTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image?: string | null;
  rating?: number;
  productLabel?: string;
  href?: string;
};

const getDisplayName = (user: { name: string | null; firstName: string | null; lastName: string | null }) => {
  if (user.name) return user.name;
  const composed = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return composed || 'Müşteri';
};

const maskName = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'Müşteri' || trimmed === 'Musteri') return 'Gizli Müşteri';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const masked = parts
    .map((part) => {
      if (!part.length) return '';
      const stars = '*'.repeat(Math.max(part.length - 1, 1));
      return `${part[0]}${stars}`;
    })
    .join(' ');
  return masked || 'Gizli Müşteri';
};

const getReviewName = (review: {
  isAnonymous: boolean;
  user: { name: string | null; firstName: string | null; lastName: string | null };
}) => {
  const displayName = getDisplayName(review.user);
  if (review.isAnonymous) return maskName(displayName);
  return displayName;
};

const process = [
  {
    title: 'Keşif ve Analiz',
    description: 'Saha ihtiyaçları ve kapasite hedefleri netleşir.',
  },
  {
    title: 'Teknik Teklif',
    description: 'Uygun makine konfigürasyonu ve plan paylaşılır.',
  },
  {
    title: 'Kurulum ve Eğitim',
    description: 'Kurulum, test, operatör ve bakım eğitimi tamamlanır.',
  },
  {
    title: 'Sürekli Destek',
    description: 'Raporlama, uzaktan takip ve servis süreci devrede olur.',
  },
];

const staticTestimonials: HomeTestimonial[] = [
  {
    id: 'static-1',
    name: 'Fatih Turgut Polat',
    role: 'Satış Müdürü',
    quote:
      'Kurulum süreci net planlandı, kesim kalitesi ve servis hızı beklentimizin üstünde.',
    image: '/images/avatar1.jpg',
  },
  {
    id: 'static-2',
    name: 'Arafat Uygur',
    role: 'Satış Müdürü',
    quote:
      'Yedek parça hızı sayesinde duruş süreleri ciddi şekilde azaldı.',
    image: '/images/avatar2.jpg',
  },
];

const faq = [
  {
    q: 'Makine seçiminde nasıl ilerliyorsunuz?',
    a: 'Ücretsiz keşif ve hat analizi ile uygun konfigurasyon belirliyoruz.',
  },
  {
    q: 'Servis süreci ne kadar hızlı?',
    a: 'Uzaktan destekle hızlı teşhis, gerekirse saha ekibi yönlendirme sağlanıyor.',
  },
  {
    q: 'Yedek parça stokları hazır mı?',
    a: 'Kritik parçalar stoklu, diğerleri için hızlı tedarik hattı mevcut.',
  },
  {
    q: 'Eğitim veriliyor mu?',
    a: 'Kurulum sonrası operator ve bakım ekibine kapsamlı eğitim verilir.',
  },
];

export default async function Home() {
  const sparePartPriceVisible = isSparePartPriceVisible();
  const sparePartDirectPurchaseEnabled = isSparePartDirectPurchaseEnabled();
  const prismaHome = prisma as unknown as {
    homePanelConfig: {
      findUnique: (args: unknown) => Promise<{
        capacitySchedule?: unknown;
        priceAlertSteps?: unknown;
        procurementFlow?: unknown;
        capacityImageUrl?: string | null;
        priceAlertImageUrl?: string | null;
        procurementImageUrl?: string | null;
      } | null>;
    };
  };
  const config = await prismaHome.homePanelConfig.findUnique({
    where: { id: 'home' },
  });
  const {
    capacitySchedule,
    procurementFlow,
    capacityImageUrl,
    procurementImageUrl,
  } = normalizeHomePanelConfig(config ?? {});
  const exchangeRate = await getUsdTryExchangeRate();
  const spareParts = await prisma.sparePart.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
    take: 24,
  });
  const byCategory = new Map<string, typeof spareParts[number]>();
  for (const part of spareParts) {
    const existing = byCategory.get(part.categoryId);
    if (!existing) {
      byCategory.set(part.categoryId, part);
      continue;
    }

    const existingInStock = existing.stockOnHand > 0;
    const partInStock = part.stockOnHand > 0;
    if (!existingInStock && partInStock) {
      byCategory.set(part.categoryId, part);
    }
  }
  const pickedParts = Array.from(byCategory.values()).slice(0, 3);
  const pickedPartIds = pickedParts.map((part) => part.id);
  const pickedRatings = pickedPartIds.length
    ? await prisma.sparePartReview.groupBy({
        by: ['sparePartId'],
        where: { sparePartId: { in: pickedPartIds }, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const pickedRatingMap = new Map(
    pickedRatings.map((row) => [
      row.sparePartId,
      {
        average: Number(row._avg.rating ?? 0),
        count: row._count.rating,
      },
    ]),
  );
  const quickShowcase: QuickShowcaseItem[] = [
    ...pickedParts.map((part) => {
      const rating = pickedRatingMap.get(part.id) ?? { average: 0, count: 0 };
      const displayedPriceCents = resolveDisplayedPriceCents(part.priceCents, part.currency, exchangeRate.rate);
      const displayedCurrency = resolveDisplayedCurrency(part.currency);
      return {
        title: part.name,
        description: trimText(part.description, 90),
        price: formatPrice(displayedPriceCents / 100, displayedCurrency),
        tag: part.category.name,
        href: `/spare-parts/${part.id}`,
        image: part.imageUrl ?? part.images[0]?.url ?? '/images/2.jpg',
        id: part.id,
        priceCents: displayedPriceCents,
        currency: displayedCurrency,
        imageUrl: part.imageUrl ?? part.images[0]?.url ?? null,
        stockOnHand: part.stockOnHand,
        inStock: part.stockOnHand > 0,
        ratingAverage: rating.average,
        ratingCount: rating.count,
      };
    }),
  ];
  if (quickShowcase.length < 3) {
    const existing = new Set(quickShowcase.map((item) => item.title));
    for (const fallback of quickShowcaseFallback) {
      if (quickShowcase.length >= 3) break;
      if (!existing.has(fallback.title)) {
        quickShowcase.push(fallback);
      }
    }
  }

  let testimonials: HomeTestimonial[] = staticTestimonials;
  try {
    const homepageReviews = await prisma.sparePartReview.findMany({
      where: {
        isApproved: true,
        rating: { gte: 4 },
        OR: [{ body: { not: null } }, { title: { not: null } }],
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: {
        user: { select: { name: true, firstName: true, lastName: true } },
        sparePart: { select: { id: true, name: true, category: { select: { name: true } } } },
      },
    });

    const fromReviews: HomeTestimonial[] = [];
    for (const review of homepageReviews) {
      const quoteSource = normalizeWhitespace(review.body ?? review.title ?? '');
      if (!quoteSource) continue;

      const productLabel = [review.sparePart.name, review.sparePart.category?.name].filter(Boolean).join(' • ');
      fromReviews.push({
        id: review.id,
        name: getReviewName(review),
        role: 'Doğrulanmış müşteri',
        quote: trimText(quoteSource, 170),
        image: null,
        rating: review.rating,
        productLabel,
        href: `/spare-parts/${review.sparePart.id}#reviews`,
      });
    }

    if (fromReviews.length) {
      testimonials = [...fromReviews, ...staticTestimonials].slice(0, 2);
    }
  } catch (error) {
    console.error('home:testimonials', error);
  }

  return (
    <div className={`${space.className} bg-[#070707] text-amber-50`}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(245,158,11,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />

        <Reveal as="section" className="relative mx-auto w-full px-0 pb-10 pt-10">
          <div className="relative overflow-hidden rounded-[34px] border border-amber-200/20 bg-[linear-gradient(160deg,#0d0d0d_0%,#17120b_55%,#111111_100%)] text-white shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
            <div className="relative grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-12 lg:py-12">
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                  GUOHONG LAZER
                  <span className="block text-amber-300">Endüstriyel Fiber Lazer Kesim Çözümleri</span>
                </h1>
                <p className="max-w-xl text-base text-white/70">
                  Makine, yedek parça ve teknik destek tek sistemde. Hattını hızlandıran, servis akışını netleştiren
                  premium operasyon altyapısı.
                </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-7 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 sm:w-auto"
                >
                  Makineleri Gör
                </Link>
                <Link
                  href="/spare-parts"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-amber-200/35 bg-[#121212] px-7 py-3 text-sm font-semibold text-amber-100 transition hover:bg-[#1a1a1a] sm:w-auto"
                >
                  Yedek parça al
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/25 px-7 py-3 text-sm font-semibold text-white/85 transition hover:border-white/50 sm:w-auto"
                >
                  Teklif al
                </Link>
              </div>
                <div className="flex flex-wrap gap-3">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                      <p className="text-lg font-semibold text-white">{stat.value}</p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative min-h-[340px] overflow-hidden rounded-[28px] border border-amber-200/25 bg-black/30">
                  <Image
                    src="/images/about-showcase.jpg"
                    alt="Guohong Lazer Hat"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                    quality={85}
                  />
                </div>
                <div className="rounded-2xl border border-amber-200/20 bg-black/30 px-4 py-3">
                  {liveStatus.map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-amber-200/10 py-2 last:border-b-0">
                      <span className="text-xs text-amber-100/65">{item.label}</span>
                      <span className={`text-sm font-semibold ${item.tone}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal as="section" className="mx-auto mt-10 w-full px-0">
        <div className="rounded-[28px] border border-amber-200/20 bg-[#101010] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.45)]">
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/90">Saha goruntuleri</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Sac, boru ve demir kesim hatları
              </h2>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_320px]">
            <VideoSlider items={heroVideos} />
            <div className="grid gap-4">
              <div className="rounded-[24px] border border-amber-200/15 bg-[#171717] p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">
                  Kontrol merkezi
                </div>
                <div className="mt-3 space-y-3 text-sm text-amber-100/75">
                  <p>Alt bardan sureyi gorebilir, videoyu istedigin noktaya sarabilirsin.</p>
                  <p>Tam ekran butonu artik aktif videonun kendisini aciyor; tarayici izin verirse direkt buyur.</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-amber-200/15 bg-[#151515] p-5">
                <div className="flex items-center justify-between border-b border-amber-200/10 pb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/75">Hat ozeti</span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    Canli akis
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {heroVideos.map((item, idx) => (
                    <div
                      key={item.src}
                      className="rounded-2xl border border-amber-200/10 bg-black/20 px-4 py-3"
                    >
                      <div className="text-[11px] uppercase tracking-[0.22em] text-amber-300/55">
                        0{idx + 1}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-amber-50">{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-amber-200/15 bg-[linear-gradient(180deg,#191919_0%,#121212_100%)] p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300/75">Saha notlari</div>
                <div className="mt-4 grid gap-3">
                  {liveStatus.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-amber-200/10 bg-black/20 px-4 py-3"
                    >
                      <span className="text-xs text-amber-100/60">{item.label}</span>
                      <span className={`text-sm font-semibold ${item.tone}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto w-full px-0">
        <div className="grid gap-4 rounded-[30px] border border-amber-200/15 bg-[#101010] p-5 md:grid-cols-3">
          {commerceTiles.map((tile, index) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="group rounded-[22px] border border-amber-200/20 bg-[#151515] p-5 transition hover:border-amber-300/45 hover:bg-[#1c1c1c]"
            >
              <div className="text-xs font-semibold text-amber-300/85">0{index + 1}</div>
              <h3 className="text-lg font-semibold text-amber-50">{tile.title}</h3>
              <p className="mt-2 text-sm leading-6 text-amber-100/70">{tile.description}</p>
              <span className="mt-5 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
                Detaya git
                <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[36px] border border-amber-200/20 bg-[#111111] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.3em] text-amber-300">Vitrin</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Yedek Parçalar
                </h2>
              </div>
              <Link
                href="/spare-parts"
                className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60"
              >
                Tümünü Gör
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {quickShowcase.map((item) => {
                const isDbItem = typeof item.id === 'string';
                const inStock = Boolean(item.inStock);
                const stockLabel = isDbItem ? (inStock ? 'Stokta' : 'Siparişle') : null;
                const stockRequestHref =
                  isDbItem && item.id
                    ? `/stock-request?product=${encodeURIComponent(item.title)}&id=${encodeURIComponent(item.id)}`
                    : '/stock-request';

                return (
                  <div
                    key={item.title}
                    className="group relative overflow-hidden rounded-[24px] border border-amber-200/20 bg-[#171717] px-4 pb-4 pt-3 transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)] glint"
                  >
                    <Link href={item.href} className="block">
                      <div className="relative h-32 w-full overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          quality={75}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                            {item.tag}
                          </span>
                          {stockLabel && (
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                                inStock ? 'bg-amber-100 text-amber-900' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {stockLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                          {typeof item.ratingCount === 'number' && item.ratingCount > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                              <span className="text-amber-600">★ {Number(item.ratingAverage ?? 0).toFixed(1)}</span>
                              <span className="text-slate-400">({item.ratingCount} yorum)</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-amber-300">
                          {sparePartPriceVisible ? item.price : 'Fiyat icin teklif al'}
                        </span>
                      </div>
                    </Link>

                    {isDbItem && item.id && typeof item.priceCents === 'number' && (
                      <div className="mt-4 grid gap-2">
                        {inStock && sparePartDirectPurchaseEnabled ? (
                          <AddToCartButton
                            id={item.id}
                            name={item.title}
                            priceCents={item.priceCents}
                            imageUrl={item.imageUrl ?? null}
                            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                          />
                        ) : (
                          <Link
                            href={inStock ? `/quote?product=${encodeURIComponent(item.title)}&id=${encodeURIComponent(item.id)}` : stockRequestHref}
                            className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-300"
                          >
                            {inStock ? 'Fiyat teklifi iste' : 'Stok gelince haber ver'}
                          </Link>
                        )}
                        <Link
                          href={item.href}
                          className="inline-flex items-center justify-center rounded-xl border border-amber-200/30 bg-[#0f0f0f] px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-[#1b1b1b]"
                        >
                          Detay gör
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[36px] border border-amber-200/20 bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-8 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            <p className="text-xs tracking-[0.3em] text-amber-200">Hızlı teklif</p>
            <h3 className="mt-3 text-2xl font-semibold">Teklifinizi 30 dakika içinde oluşturun</h3>
            <p className="mt-3 text-sm text-white/70">
              Üretim hedefini, parça modelini ve teslim aciliyetinizi iletin. Net fiyat ve plan aynı gün içinde geri dönsün.
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">1. Model / parça bilgisi</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">2. Adet ve teslim tarihi</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">3. İletişim e-posta adresi</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-2.5 text-sm font-semibold text-black"
              >
                Teklif Al
              </Link>
              <Link
                href="/contact?subject=Hizli+Teklif"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div>
          <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
            <p className="text-xs tracking-[0.3em] text-amber-300">Ürün</p>
            <h2 className="mt-3 text-2xl font-semibold text-amber-50">{spotlight.title}</h2>
            <p className="mt-3 text-sm text-amber-100/70">{spotlight.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {spotlight.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-amber-50">{spec.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
              >
                Detayları Gör
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-amber-200/30 px-6 py-2.5 text-sm font-semibold text-amber-100 hover:border-amber-300/60"
              >
                Teklif İste
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-[#171717] shadow-xl">
            <Image
              src={spotlight.image}
              alt={spotlight.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
              loading="lazy"
              decoding="async"
              quality={70}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-transparent to-transparent" />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-10 w-full px-0 md:hidden">
        <div className="grid gap-3 rounded-[24px] border border-amber-200/20 bg-[#111111] p-4 shadow-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300">Hızlı Erişim</p>
          <div className="grid gap-2">
            <Link
              href="/spare-parts"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black"
            >
              Yedek Parça Ara
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-amber-200/30 px-4 py-3 text-sm font-semibold text-amber-100"
            >
              Makine Çözümleri
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white/80"
            >
              Teklif Al
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-6 text-white shadow-2xl glint">
            {capacityImageUrl ? (
              <div className="pointer-events-none absolute inset-0">
                <Image
                  src={capacityImageUrl}
                  alt="Kapasite gorseli"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-25"
                  loading="lazy"
                  decoding="async"
                  quality={70}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/60 to-[#2a1d0f]/70" />
              </div>
            ) : null}
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Canlı kapasite takvimi</p>
            <h2 className="mt-2 text-2xl font-semibold">Üretim + servis randevu paneli</h2>
            <p className="mt-3 text-sm text-white/70">
              Keşif, kurulum ve servis slotlarını canlı takip et. Takvim doluluğuna göre otomatik önceliklendirme al.
            </p>
            <div className="mt-6 grid gap-3">
              {capacitySchedule.map((slot) => (
                <div key={slot.title} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-amber-200">
                        {panelIcon(slot.icon)}
                      </span>
                      <span>{slot.title}</span>
                    </div>
                    <span className="text-amber-200">{slot.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/70">{slot.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/60">{slot.window}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact?subject=Kesif+Randevusu"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
              >
                Keşif randevusu al
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                Teslim planını sor
              </Link>
            </div>
          </div>

        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 hidden w-full px-0 md:block">
        <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl glint">
          {procurementImageUrl ? (
            <div className="pointer-events-none absolute inset-0">
              <Image
                src={procurementImageUrl}
                alt="Satin alma gorseli"
                fill
                sizes="(max-width: 1024px) 100vw, 100vw"
                className="object-cover opacity-10"
                loading="lazy"
                decoding="async"
                quality={70}
              />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Kurumsal Satın Alma</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Tekliften Teslimata Tek Akış
              </h2>
            </div>
            <div className="flex gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">Yetkili Onay</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">SLA Takip</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {procurementFlow.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-amber-300">
                  <span>Adım {index + 1}</span>
                  <span className="rounded-full bg-amber-300/10 px-2 py-1 text-[10px] font-semibold text-amber-200">
                    {step.title}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                    {panelIcon(step.icon)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-amber-50">{step.title}</p>
                    <p className="mt-1 text-sm text-amber-100/70">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/25"
            >
              Kurumsal teklif başlat
            </Link>
            <Link
              href="/contact?subject=Kurumsal+Satin+Alma"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
            >
              Satın alma desteği
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Destek merkezi</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                E-ticaret + teknik destek tek sayfada
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60"
            >
              Destek al
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportGrid.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4 transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-lg ${index > 1 ? 'hidden md:block' : ''}`}
              >
                <p className="text-sm font-semibold text-amber-50">{item.title}</p>
                <p className="mt-2 text-sm text-amber-100/70">{item.description}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Aç
                  <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-amber-300">Güven</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Garanti, teslimat ve güvenli ödeme bilgileri
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
            >
              Destek iste
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustLinks.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4 transition hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-lg ${index > 2 ? 'hidden md:block' : ''}`}
              >
                <p className="text-sm font-semibold text-amber-50">{item.title}</p>
                <p className="mt-2 text-sm text-amber-100/70">{item.description}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Detay
                  <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 hidden w-full gap-6 px-0 md:grid lg:grid-cols-2">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">İş akışı</p>
          <h2 className="mt-2 text-2xl font-semibold text-amber-50">4 adımda devreye alma</h2>
          <div className="mt-6 space-y-4">
            {process.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-black">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-amber-50">{step.title}</p>
                    <p className="mt-1 text-sm text-amber-100/70">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-amber-200/20 bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-6 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Uyumluluk ve güven</p>
          <h2 className="mt-2 text-2xl font-semibold">Model - Parça uyumu tek ekranda</h2>
          <p className="mt-3 text-sm text-white/70">
            Makine modeline göre uyumlu yedek parçaları anında göster, stok ve teslim bilgisiyle karar ver.
          </p>
          <div className="mt-6 grid gap-3">
            {['Model seçimi', 'Uyumlu parça listesi', 'Hızlı teslim bilgisi', 'Teknik onay'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/spare-parts"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            Yedek parça arat
          </Link>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 hidden w-full gap-5 px-0 md:grid lg:grid-cols-2">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/20 via-white/10 to-amber-500/20 text-xs font-semibold text-amber-100">
                    {getInitials(item.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-amber-50">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                  </div>
                  {typeof item.rating === 'number' && (
                    <div className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-300">
                      ★ {item.rating}/5
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-amber-100/70 line-clamp-4">"{item.quote}"</p>
            {item.href && item.productLabel && (
              <Link
                href={item.href}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                <span className="line-clamp-1">{item.productLabel}</span>
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        ))}
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0">
        <div className="rounded-[32px] border border-amber-200/20 bg-[#111111] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300">SSS</p>
              <h2 className="mt-2 text-2xl font-semibold text-amber-50">
                Sıkça Sorulan Sorular
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-amber-200/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 hover:border-amber-300/60"
            >
              Sorunuz mu var?
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-amber-200/20 bg-[#171717] px-4 py-4"
              >
                <p className="text-sm font-semibold text-amber-50">{item.q}</p>
                <p className="mt-2 text-sm text-amber-100/70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 w-full px-0 pb-16">
        <div className="grid gap-6 rounded-[36px] border border-amber-200/20 bg-gradient-to-r from-[#171108] via-[#0b0b0b] to-[#2a1d0f] p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Hadi başlayalım</p>
              <h2 className="mt-2 text-2xl font-semibold">Makine ve yedek parçalar için plan hazırlayalım</h2>
              <p className="mt-2 text-sm text-white/70">Teklifini hızlı hazırlayalım, kurulum takvimini netleştirelim.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
              >
                Hemen teklif al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

